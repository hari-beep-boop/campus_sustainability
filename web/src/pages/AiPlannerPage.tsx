import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

export const AiPlannerPage: React.FC = () => {
  const { isStaff } = useAuth();

  // Server AI status state
  const [aiStatus, setAiStatus] = useState<{
    configured: boolean;
    valid?: boolean;
    model?: string;
    message?: string;
  } | null>(null);

  // Planning scope state
  const [goals, setGoals] = useState<string[]>(['electricity', 'carbon', 'air']);
  const [budget, setBudget] = useState<'low' | 'medium' | 'high'>('medium');
  const [constraints, setConstraints] = useState('Prioritize low-cost operational interventions during semester breaks.');

  // Plan generation state
  const [generating, setGenerating] = useState(false);
  const [planResult, setPlanResult] = useState<any>(null);
  const [, setPastPlans] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load AI configuration status & past plans on mount
  useEffect(() => {
    if (isStaff) {
      client
        .get('/ai/status')
        .then((res) => setAiStatus(res.data))
        .catch(() => {});

      client
        .get('/ai/plans')
        .then((res) => setPastPlans(res.data?.plans || []))
        .catch(() => {});
    }
  }, [isStaff]);

  if (!isStaff) {
    return (
      <div className="p-8 text-center bg-card rounded-card border border-card-border shadow-soft max-w-lg mx-auto mt-12">
        <span className="text-4xl">🔒</span>
        <h2 className="mt-3 text-lg font-bold text-ink">
          Access Restricted — Administrative Role Required
        </h2>
        <p className="mt-2 text-xs text-muted leading-relaxed">
          The <strong className="text-ink">Gemini AI Implementation Planner</strong> is an institutional planning tool restricted to Campus Administrators and Facility Managers. Your current role is <strong className="text-ink">Student / Viewer (Stats Only)</strong>.
        </p>
      </div>
    );
  }

  const handleGeneratePlan = async () => {
    setGenerating(true);
    setError(null);

    try {
      const res = await client.post(
        '/ai/plan',
        {
          scope: {
            goals,
            budget,
            constraints,
          },
        },
        {
          timeout: 45000,
        }
      );

      const generated = res.data?.plan;
      setPlanResult(generated.plan);
      setPastPlans((prev) => [generated, ...prev]);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Authentication session expired. Please sign in again.');
      } else {
        setError(
          err.response?.data?.error?.message ||
            'Failed to generate AI plan. Please check server/.env configuration.'
        );
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header & Server AI Status */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-8 rounded-pill bg-primary-soft text-primary flex items-center justify-center text-sm shadow-soft">
              ✨
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-muted">
              AI Decarbonization Engine
            </span>
          </div>
          <h1 className="text-2xl font-black text-ink">
            Gemini AI Implementation Planner
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Institutional AI engine analyzing campus telemetry to generate prioritized, phased decarbonization roadmaps.
          </p>
        </div>

        {/* Engine Status Badge */}
        <div>
          {aiStatus?.configured ? (
            <span className="inline-flex items-center px-3.5 py-1.5 rounded-pill text-xs font-bold bg-primary-soft text-primary border border-primary/20 shadow-soft">
              <span className="w-2 h-2 rounded-full bg-primary mr-2 animate-pulse" />
              Engine: {aiStatus.model || 'gemini-3.8-flash'} (.env active)
            </span>
          ) : (
            <span className="inline-flex items-center px-3.5 py-1.5 rounded-pill text-xs font-bold bg-amber-500/10 text-warn border border-warn/20 shadow-soft">
              <span className="w-2 h-2 rounded-full bg-warn mr-2" />
              Add GEMINI_API_KEY in server/.env
            </span>
          )}
        </div>
      </div>

      {/* Scope & Planning Parameters Panel */}
      <div className="bg-card p-6 rounded-card border border-card-border shadow-soft space-y-6">
        <div className="flex justify-between items-center border-b border-card-border pb-3">
          <h2 className="text-base font-bold text-ink flex items-center gap-2">
            <span>🎯</span> Planning Scope &amp; Targets
          </h2>
          <span className="text-xs text-muted">
            Telemetry from 5 buildings will be analyzed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Goals */}
          <div>
            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2.5">
              Strategic Focus Areas
            </label>
            <div className="space-y-2.5 text-xs">
              {[
                { id: 'electricity', label: 'Reduce Electricity & Night Baseload' },
                { id: 'water', label: 'Eliminate Water Leaks & Minimize Draw' },
                { id: 'air', label: 'Improve Indoor Air Quality (CO₂ < 800 ppm)' },
                { id: 'carbon', label: 'Deep Scope 2 Decarbonization' },
              ].map((g) => (
                <label key={g.id} className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={goals.includes(g.id)}
                    onChange={(e) => {
                      if (e.target.checked) setGoals([...goals, g.id]);
                      else setGoals(goals.filter((x) => x !== g.id));
                    }}
                    className="rounded border-card-border text-primary focus:ring-primary h-4 w-4"
                  />
                  <span className="text-ink font-medium">{g.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2.5">
              Target Budget Level
            </label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as const).map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBudget(b)}
                  className={`flex-1 py-2 text-xs font-bold uppercase rounded-pill border transition-all ${
                    budget === b
                      ? 'bg-primary text-white border-primary shadow-pill'
                      : 'border-card-border bg-frame text-muted hover:text-ink'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted mt-2.5 leading-relaxed">
              {budget === 'low' && 'Focuses on operational schedules, setbacks, and zero-cost behavioral nudges.'}
              {budget === 'medium' && 'Encompasses smart controls, fixture repairs, and targeted LED/flow retrofits.'}
              {budget === 'high' && 'Includes capital retrofits: rooftop solar PV, smart BMS, heat pumps.'}
            </p>
          </div>

          {/* Constraints */}
          <div>
            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2.5">
              Campus Constraints
            </label>
            <textarea
              rows={3}
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              placeholder="e.g. Prioritize low-cost operational interventions during breaks."
              className="w-full text-xs p-3 border border-card-border rounded-tile bg-frame text-ink focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Generate Button */}
        <div className="pt-4 border-t border-card-border flex justify-end">
          <button
            onClick={handleGeneratePlan}
            disabled={generating}
            className="px-6 py-3 text-xs sm:text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-pill shadow-pill transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            <span>{generating ? '🧠 Analyzing Campus Telemetry...' : '⚡ Generate Implementation Plan'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-danger-soft border border-danger/30 rounded-tile text-xs text-danger flex items-start justify-between">
          <div>
            <div className="font-bold mb-0.5">Plan Generation Notice:</div>
            <div>{error}</div>
            {error.toLowerCase().includes('auth') || error.toLowerCase().includes('token') ? (
              <div className="mt-2.5">
                <a
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-danger text-white rounded-pill font-bold shadow-soft hover:opacity-90 transition-opacity"
                >
                  <span>🔑</span> Sign In Again
                </a>
              </div>
            ) : (
              <div className="mt-2 text-[11px] font-mono text-danger">
                Tip: Open server/.env and check GEMINI_API_KEY
              </div>
            )}
          </div>
        </div>
      )}

      {/* Generated Implementation Plan Display */}
      {planResult && (
        <div className="bg-card rounded-card border border-card-border shadow-soft p-6 space-y-6">
          <div className="flex justify-between items-start border-b border-card-border pb-4">
            <div>
              <span className="text-xs font-bold uppercase text-primary tracking-wider">
                Gemini AI Generated
              </span>
              <h2 className="text-xl font-black text-ink mt-0.5">
                Campus Sustainability Implementation Plan
              </h2>
            </div>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 text-xs font-bold text-ink border border-card-border rounded-pill hover:bg-frame transition-all shadow-soft"
            >
              🖨️ Print / Save
            </button>
          </div>

          {/* Executive Summary */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">
              Executive Summary
            </h3>
            <p className="text-sm text-ink leading-relaxed bg-primary-soft/40 p-4 rounded-tile border border-primary/20">
              {planResult.executiveSummary}
            </p>
          </div>

          {/* Action Items Table */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">
              Prioritized Action Matrix
            </h3>
            <div className="overflow-x-auto rounded-tile border border-card-border">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-card-border bg-frame text-muted font-bold">
                    <th className="py-3 px-3.5">Action</th>
                    <th className="py-3 px-3.5">Category</th>
                    <th className="py-3 px-3.5">Effort</th>
                    <th className="py-3 px-3.5">Est. Monthly Savings</th>
                    <th className="py-3 px-3.5">Phase</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border bg-card">
                  {planResult.actions?.map((act: any) => (
                    <tr key={act.id} className="hover:bg-frame/40 transition-colors">
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-ink">{act.title}</div>
                        <div className="text-[11px] text-muted mt-0.5">{act.description}</div>
                      </td>
                      <td className="py-3 px-3.5 font-bold text-muted uppercase text-[10px]">
                        {act.category}
                      </td>
                      <td className="py-3 px-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-pill text-[10px] font-bold uppercase ${
                            act.effort === 'low'
                              ? 'bg-primary-soft text-primary border border-primary/20'
                              : act.effort === 'medium'
                              ? 'bg-amber-500/10 text-warn border border-warn/20'
                              : 'bg-danger-soft text-danger border border-danger/20'
                          }`}
                        >
                          {act.effort}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 font-bold text-primary">
                        {act.estimatedSavings?.perMonth ? `${act.estimatedSavings.perMonth.toLocaleString()} ${act.estimatedSavings.unit}/mo` : 'N/A'}
                      </td>
                      <td className="py-3 px-3.5 font-bold text-ink">
                        Phase {act.phase}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Phased Roadmap Timeline */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">
              Phased Rollout Timeline
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {planResult.roadmap?.map((phase: any) => (
                <div
                  key={phase.phase}
                  className="p-4 border border-card-border rounded-tile bg-frame text-xs space-y-1.5"
                >
                  <div className="flex justify-between items-center font-bold text-ink mb-1">
                    <span>Phase {phase.phase}: {phase.name}</span>
                    <span className="text-[10px] bg-primary-soft text-primary font-bold px-2 py-0.5 rounded-pill border border-primary/20">
                      {phase.weeks} Weeks
                    </span>
                  </div>
                  <div className="text-muted text-[11px]">
                    Includes {phase.actionIds?.length || 0} designated initiatives.
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiPlannerPage;
