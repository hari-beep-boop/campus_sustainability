import {
  calculateCurrentRms,
  calculatePowerWatts,
  calculateEnergyKwh,
  calculateWaterLitres,
  calculateCarbonKg,
  getCo2AirQualityBand,
} from '../utils/units.js';

export class CalcService {
  /**
   * Process a raw sample from an IoT device and return normalized readings
   * @param {Object} sample - Raw sample { ts, co2_ppm, acs_mv, acs_rms_a, water_pulses, interval_s }
   * @param {Object} calibration - Device calibration object
   */
  static processSample(sample, calibration = {}) {
    const intervalS = sample.interval_s || 10;
    const results = [];

    // 1. Process Electricity
    if (sample.acs_rms_a !== undefined || sample.acs_mv !== undefined) {
      const elecCal = calibration.electricity || {};
      const sensitivity = elecCal.sensitivityMvPerA || 100;
      const zeroMv = elecCal.zeroCurrentMv || 2500;
      const voltage = elecCal.mainsVoltage || 230;
      const pf = elecCal.powerFactor || 0.9;

      let currentA = sample.acs_rms_a;
      if (currentA === undefined && sample.acs_mv !== undefined) {
        currentA = calculateCurrentRms(sample.acs_mv, zeroMv, sensitivity);
      }

      const powerW = calculatePowerWatts(currentA || 0, voltage, pf);
      const energyKwh = calculateEnergyKwh(powerW, intervalS);

      results.push({
        type: 'energy',
        value: Number(energyKwh.toFixed(6)),
        unit: 'kWh',
        raw: {
          currentA,
          powerW,
          acs_mv: sample.acs_mv,
          interval_s: intervalS,
        },
      });
    }

    // 2. Process Water
    if (sample.water_pulses !== undefined) {
      const waterCal = calibration.water || {};
      const pulsesPerL = waterCal.pulsesPerLitre || 450;
      const litres = calculateWaterLitres(sample.water_pulses, pulsesPerL);

      results.push({
        type: 'water',
        value: Number(litres.toFixed(3)),
        unit: 'L',
        raw: {
          pulses: sample.water_pulses,
          interval_s: intervalS,
        },
      });
    }

    // 3. Process CO2 (Air Quality ppm)
    if (sample.co2_ppm !== undefined) {
      const co2Cal = calibration.co2 || {};
      const offset = co2Cal.offsetPpm || 0;
      const scale = co2Cal.scale !== undefined ? co2Cal.scale : 1.0;
      const calibratedPpm = Math.max(300, Math.min(10000, Math.round((sample.co2_ppm + offset) * scale)));

      results.push({
        type: 'co2',
        value: calibratedPpm,
        unit: 'ppm',
        raw: {
          originalPpm: sample.co2_ppm,
          qualityBand: getCo2AirQualityBand(calibratedPpm),
        },
      });
    }

    return results;
  }
}

export default CalcService;
