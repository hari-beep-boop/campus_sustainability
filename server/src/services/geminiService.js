import { GoogleGenAI } from '@google/genai';
import config from '../config/env.js';
import AnalyticsService from './analyticsService.js';
import Alert from '../models/Alert.js';
import Setting from '../models/Setting.js';
import AiPlan from '../models/AiPlan.js';
import Recommendation from '../models/Recommendation.js';
import logger from '../utils/logger.js';

export class GeminiService {
  /**
   * Check status and validate the GEMINI_API_KEY from environment
   */
  static async checkStatus() {
    const apiKey = config.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        configured: false,
        model: config.GEMINI_MODEL,
        message: 'GEMINI_API_KEY is not configured in .env file.',
      };
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const candidates = [
        config.GEMINI_MODEL || 'gemini-3.1-flash-lite',
        'gemini-3.1-flash-lite',
        'gemini-3.5-flash-lite',
        'gemini-flash-latest',
        'gemini-3.5-flash',
      ];
      let workingModel = null;
      let lastErr = null;

      for (const m of [...new Set(candidates)]) {
        try {
          await ai.models.generateContent({
            model: m,
            contents: 'OK',
          });
          workingModel = m;
          break;
        } catch (e) {
          lastErr = e;
        }
      }

      if (workingModel) {
        return {
          configured: true,
          valid: true,
          model: workingModel,
          message: `Connected to Gemini (${workingModel}) via server/.env configuration.`,
        };
      }

      return {
        configured: true,
        valid: false,
        model: config.GEMINI_MODEL,
        message: `Key rejected by Google AI: ${lastErr?.message || 'Failed to connect'}`,
      };
    } catch (err) {
      return {
        configured: true,
        valid: false,
        model: config.GEMINI_MODEL,
        message: `Key rejected by Google AI: ${err.message}`,
      };
    }
  }

  /**
   * Build compact statistics payload for the AI prompt
   */
  static async buildPromptContext(scope = {}) {
    const summary = await AnalyticsService.getSummary();
    const buildings = await AnalyticsService.getBuildingUsage();
    const alerts = await Alert.find({ ackAt: null }).limit(5);
    const thresholds = (await Setting.findOne({ key: 'thresholds' }))?.value || {};

    return {
      campusSummary: {
        totalEnergyKwh: summary.energyKwh,
        totalWaterL: summary.waterL,
        avgCo2Ppm: summary.co2Ppm,
        totalCarbonKg: summary.carbonKg,
        sustainabilityScore: summary.score,
        nightBaselineKw: summary.nightBaselineKw,
      },
      buildings: buildings.map((b) => ({
        name: b.building,
        type: b.type,
        energyKwh: b.energy,
        waterL: b.water,
        co2Ppm: b.co2Ppm,
        carbonKg: b.carbonKg,
      })),
      activeAlerts: alerts.map((a) => a.message),
      thresholdLimits: thresholds,
      userScope: scope,
    };
  }

  /**
   * Generate structured sustainability implementation plan using environment key
   */
  static async generatePlan({ userId, scope = {} }) {
    const apiKey = config.GEMINI_API_KEY;
    if (!apiKey) {
      throw {
        status: 400,
        message:
          'GEMINI_API_KEY is missing. Please add your key to GEMINI_API_KEY= in server/.env and restart the server.',
      };
    }

    const context = await this.buildPromptContext(scope);
    const candidateModels = [
      config.GEMINI_MODEL || 'gemini-3.1-flash-lite',
      'gemini-3.1-flash-lite',
      'gemini-3.5-flash-lite',
      'gemini-flash-latest',
      'gemini-3.5-flash',
    ];
    // Deduplicate candidate models
    const uniqueModels = [...new Set(candidateModels)];

    const systemPrompt = `You are a Principal Campus Sustainability and Energy Engineer.
Analyze the provided campus telemetry data and create an actionable, high-impact Sustainability Implementation Plan.

RULES:
1. Base all conclusions strictly on the provided campus statistics. Do NOT invent measurements.
2. Clearly identify anomalies such as high nighttime baselines or indoor air quality spikes (>1000 ppm).
3. Return ONLY a valid JSON object matching this exact schema:
{
  "executiveSummary": "Concise 2-3 paragraph summary of campus state and strategic priorities",
  "findings": [
    { "building": "Building Name", "metric": "energy|water|co2|air", "evidence": "data evidence", "severity": "low|medium|high" }
  ],
  "actions": [
    {
      "id": "ACT-1",
      "title": "Action title",
      "description": "Detailed implementation steps",
      "category": "energy|water|air|carbon|behaviour|infrastructure",
      "effort": "low|medium|high",
      "estimatedSavings": { "unit": "kWh|L|kgCO2e|ppm", "perMonth": 2500 },
      "assumptions": ["Assumption 1"],
      "dependsOn": [],
      "phase": 1
    }
  ],
  "roadmap": [
    { "phase": 1, "name": "Immediate Quick-Wins", "weeks": 4, "actionIds": ["ACT-1"] },
    { "phase": 2, "name": "Operational Retrofits", "weeks": 8, "actionIds": ["ACT-2"] }
  ],
  "risks": ["Potential implementation hurdle or seasonal disruption"],
  "kpisToTrack": [
    { "name": "Nighttime Peak Demand", "target": "< 12 kW" },
    { "name": "Indoor CO2 in Classrooms", "target": "< 800 ppm during peak hours" }
  ]
}`;

    const promptText = `Campus Sustainability Telemetry Data:\n${JSON.stringify(context, null, 2)}\n\nGenerate the complete JSON implementation plan.`;

    let generatedPlan = null;
    let successfulModel = uniqueModels[0];
    let lastError = null;

    const ai = new GoogleGenAI({ apiKey });

    for (const m of uniqueModels) {
      try {
        const response = await ai.models.generateContent({
          model: m,
          contents: [
            { role: 'user', parts: [{ text: `${systemPrompt}\n\n${promptText}` }] },
          ],
          config: {
            responseMimeType: 'application/json',
          },
        });

        const responseText = response.text?.trim();
        generatedPlan = JSON.parse(responseText);
        successfulModel = m;
        break; // Successfully generated!
      } catch (aiErr) {
        lastError = aiErr;
        logger.warn({ model: m, err: aiErr.message }, 'Gemini model attempt failed, trying fallback');
      }
    }

    if (!generatedPlan) {
      throw {
        status: 502,
        message: `Gemini generation error: ${lastError?.message || 'All model attempts failed'}. Verify GEMINI_API_KEY in server/.env.`,
      };
    }

    // Save plan to MongoDB (NEVER storing the apiKey)
    const savedPlan = await AiPlan.create({
      createdBy: userId,
      scope,
      model: successfulModel,
      summaryStats: context.campusSummary,
      plan: generatedPlan,
    });

    // Automatically convert high-priority actions into Recommendations
    if (Array.isArray(generatedPlan.actions)) {
      const recsToInsert = generatedPlan.actions.slice(0, 3).map((act) => ({
        title: act.title,
        description: act.description,
        category: act.category || 'energy',
        impact: act.effort === 'high' ? 'high' : 'medium',
        source: 'ai',
      }));
      await Recommendation.insertMany(recsToInsert).catch(() => {});
    }

    return savedPlan;
  }
}

export default GeminiService;
