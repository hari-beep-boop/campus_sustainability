/**
 * Pure calculation functions for physical conversions
 */

export function calculateCurrentRms(adcMv, zeroCurrentMv = 2500, sensitivityMvPerA = 100) {
  const diffMv = Math.abs(adcMv - zeroCurrentMv);
  return diffMv / sensitivityMvPerA;
}

export function calculatePowerWatts(iRmsA, mainsVoltage = 230, powerFactor = 0.9) {
  return Math.max(0, iRmsA * mainsVoltage * powerFactor);
}

export function calculateEnergyKwh(powerWatts, intervalSeconds) {
  return (powerWatts * intervalSeconds) / 3600000;
}

export function calculateWaterLitres(pulses, pulsesPerLitre = 450) {
  return pulses / pulsesPerLitre;
}

export function calculateWaterFlowRate(litres, intervalSeconds) {
  if (intervalSeconds <= 0) return 0;
  return litres / (intervalSeconds / 60);
}

export function calculateCarbonKg(energyKwh, emissionFactor = 0.71) {
  return energyKwh * emissionFactor;
}

export function getCo2AirQualityBand(ppm) {
  if (ppm <= 800) return { band: 'good', label: 'Good', color: 'green' };
  if (ppm <= 1000) return { band: 'acceptable', label: 'Acceptable', color: 'yellow' };
  if (ppm <= 1500) return { band: 'poor', label: 'Poor (Ventilate)', color: 'orange' };
  return { band: 'bad', label: 'Hazardous', color: 'red' };
}
