/**
 * generateSampleData.js
 * Generates realistic synthetic telemetry and waste breakdown CSV data for
 * Campus Sustainability Tracker v2.
 *
 * Output files:
 *  - data/sustainability_readings_subset.csv
 *  - data/waste_breakdown_subset.csv
 */

const fs = require('fs');
const path = require('path');

// Simple seedable pseudo-random number generator (Mulberry32) for reproducible data
function createRng(seed = 123456789) {
  let s = seed;
  return function() {
    let t = (s += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = createRng(42);

function randomInRange(min, max) {
  return min + rng() * (max - min);
}

function roundTo(val, decimals = 2) {
  const factor = Math.pow(10, decimals);
  return Math.round(val * factor) / factor;
}

// Target directory
const dataDir = path.resolve(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 5 Monitored Buildings
const buildings = [
  { id: 1, name: 'Science Block A', code: 'SCI-A', type: 'academic', campus: 'Main' },
  { id: 2, name: 'Engineering Hall', code: 'ENG', type: 'academic', campus: 'Main' },
  { id: 3, name: 'Library Complex', code: 'LIB', type: 'library', campus: 'Main' },
  { id: 4, name: 'Student Residence North', code: 'RES-N', type: 'residential', campus: 'Main' },
  { id: 5, name: 'Admin Building', code: 'ADMIN', type: 'administrative', campus: 'Main' }
];

/**
 * 1. Generate sustainability_readings_subset.csv
 * Columns: timestamp,building_id,bdg2_building_name,display_name,building_type,campus,resource_type,value
 * 
 * - Energy, Water, CO2: Hourly for 7 days (168 hours): 2026-10-21T00:00:00Z to 2026-10-27T23:00:00Z
 * - Waste: Daily for 30 days: 2026-09-28 to 2026-10-27
 */
function generateReadings() {
  const rows = [
    'timestamp,building_id,bdg2_building_name,display_name,building_type,campus,resource_type,value'
  ];

  // 7 days hourly: 2026-10-21 00:00:00 to 2026-10-27 23:00:00 (168 hours)
  const startHourly = new Date('2026-10-21T00:00:00.000Z');
  const totalHours = 168;

  for (let h = 0; h < totalHours; h++) {
    const currentTs = new Date(startHourly.getTime() + h * 60 * 60 * 1000);
    const tsStr = currentTs.toISOString();
    const hour = currentTs.getUTCHours();
    const dayOfWeek = currentTs.getUTCDay(); // 0 = Sun, 6 = Sat
    const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);

    for (const b of buildings) {
      // 1. Energy (kWh) range 50 - 300
      let energyBase = 70;
      if (b.type === 'academic' || b.type === 'administrative') {
        const peak = isWeekend ? 0.35 : 1.0;
        if (hour >= 8 && hour <= 18) {
          energyBase = (180 + Math.sin((hour - 8) / 10 * Math.PI) * 80) * peak;
        } else if (hour > 18 && hour <= 22) {
          energyBase = (110 + (22 - hour) * 15) * peak;
        } else {
          energyBase = 55 + randomInRange(0, 15);
        }
        if (b.code === 'ENG') energyBase += 25; // High baseload lab machinery
      } else if (b.type === 'library') {
        const peak = isWeekend ? 0.75 : 1.0;
        if (hour >= 8 && hour <= 23) {
          energyBase = (140 + Math.sin((hour - 8) / 15 * Math.PI) * 70) * peak;
        } else {
          energyBase = 60 + randomInRange(0, 15);
        }
      } else if (b.type === 'residential') {
        // Morning peak (6-9) and evening peak (18-24)
        if (hour >= 6 && hour <= 9) {
          energyBase = 150 + randomInRange(20, 70);
        } else if (hour >= 18 && hour <= 23) {
          energyBase = 190 + randomInRange(30, 90);
        } else if (hour >= 10 && hour <= 17) {
          energyBase = isWeekend ? 130 + randomInRange(10, 40) : 80 + randomInRange(5, 25);
        } else {
          energyBase = 70 + randomInRange(5, 20);
        }
      }

      // Add noise and occasional anomaly spike
      let energyValue = energyBase + randomInRange(-10, 10);
      if (rng() < 0.015) {
        energyValue += randomInRange(40, 70); // HVAC / lab anomaly
      }
      energyValue = Math.min(300, Math.max(50, energyValue));
      rows.push(`${tsStr},${b.id},"${b.name}",${b.code},${b.type},${b.campus},energy,${roundTo(energyValue, 2)}`);

      // 2. Water (Litres) range 100 - 800
      let waterBase = 130;
      const mealPeak = (hHour) => {
        if (hHour >= 7 && hHour <= 9) return 1.8;   // Breakfast / morning
        if (hHour >= 12 && hHour <= 14) return 2.1; // Lunch
        if (hHour >= 19 && hHour <= 21) return 1.9; // Dinner
        return 0.8;
      };

      if (b.type === 'residential') {
        waterBase = 220 * mealPeak(hour);
        if (isWeekend) waterBase *= 1.15;
      } else if (b.type === 'academic' || b.type === 'administrative') {
        if (!isWeekend && hour >= 8 && hour <= 18) {
          waterBase = 180 * mealPeak(hour);
        } else {
          waterBase = 110 + randomInRange(0, 20);
        }
      } else if (b.type === 'library') {
        if (hour >= 9 && hour <= 21) {
          waterBase = 160 * (mealPeak(hour) * 0.9);
        } else {
          waterBase = 105 + randomInRange(0, 15);
        }
      }

      let waterValue = waterBase + randomInRange(-20, 25);
      if (rng() < 0.01) {
        waterValue += randomInRange(150, 250); // Leak / high-draw anomaly
      }
      waterValue = Math.min(800, Math.max(100, waterValue));
      rows.push(`${tsStr},${b.id},"${b.name}",${b.code},${b.type},${b.campus},water,${roundTo(waterValue, 1)}`);

      // 3. CO2 (ppm) range 400 - 1500
      let co2Base = 420;
      if (b.type === 'academic' || b.type === 'administrative') {
        if (!isWeekend && hour >= 9 && hour <= 17) {
          // Class hours occupancy build-up
          co2Base = 650 + Math.sin((hour - 9) / 8 * Math.PI) * 550;
        } else if (!isWeekend && hour > 17 && hour <= 20) {
          co2Base = 520 - (hour - 17) * 30;
        } else {
          co2Base = 415 + randomInRange(0, 20);
        }
      } else if (b.type === 'library') {
        if (hour >= 10 && hour <= 22) {
          co2Base = 580 + Math.sin((hour - 10) / 12 * Math.PI) * 450;
          if (isWeekend) co2Base *= 0.85;
        } else {
          co2Base = 415 + randomInRange(0, 15);
        }
      } else if (b.type === 'residential') {
        // High at night when occupants sleep, low midday
        if (hour >= 22 || hour <= 7) {
          co2Base = 750 + randomInRange(50, 350);
        } else if (hour >= 8 && hour <= 17) {
          co2Base = isWeekend ? 580 + randomInRange(20, 80) : 440 + randomInRange(10, 40);
        } else {
          co2Base = 600 + randomInRange(20, 100);
        }
      }

      let co2Value = co2Base + randomInRange(-25, 25);
      if (rng() < 0.015 && hour >= 10 && hour <= 16) {
        co2Value += randomInRange(150, 300); // Packed lecture hall anomaly
      }
      co2Value = Math.min(1500, Math.max(400, Math.round(co2Value)));
      rows.push(`${tsStr},${b.id},"${b.name}",${b.code},${b.type},${b.campus},co2,${co2Value}`);
    }
  }

  // 4. Waste (kg) Daily only for 30 days: 2026-09-28 to 2026-10-27
  const startDaily = new Date('2026-09-28T18:00:00.000Z');
  for (let d = 0; d < 30; d++) {
    const currentDay = new Date(startDaily.getTime() + d * 24 * 60 * 60 * 1000);
    const dayStr = currentDay.toISOString();
    const dayOfWeek = currentDay.getUTCDay();
    const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);

    for (const b of buildings) {
      let wasteBase = 20;
      if (b.type === 'residential') {
        wasteBase = isWeekend ? 42 : 32;
      } else if (b.type === 'academic') {
        wasteBase = isWeekend ? 8 : 28;
      } else if (b.type === 'library') {
        wasteBase = isWeekend ? 12 : 22;
      } else if (b.type === 'administrative') {
        wasteBase = isWeekend ? 6 : 18;
      }

      let wasteValue = wasteBase + randomInRange(-4, 5);
      if (rng() < 0.05) {
        wasteValue += randomInRange(8, 15); // Campus event waste spike
      }
      wasteValue = Math.min(50, Math.max(5, wasteValue));
      rows.push(`${dayStr},${b.id},"${b.name}",${b.code},${b.type},${b.campus},waste,${roundTo(wasteValue, 2)}`);
    }
  }

  const filePath = path.join(dataDir, 'sustainability_readings_subset.csv');
  fs.writeFileSync(filePath, rows.join('\n') + '\n', 'utf8');
  console.log(`Generated ${rows.length - 1} rows in ${filePath}`);
}

/**
 * 2. Generate waste_breakdown_subset.csv
 * Columns: building_id,category,value_kg,date
 * 
 * - Categories: paper, plastic, organic, glass, e_waste, general
 * - 30 days (2026-09-28 to 2026-10-27) × 5 buildings × 6 categories = 900 rows
 * - Realistic values:
 *     organic: 15-40 kg
 *     paper: 5-20 kg
 *     plastic: 3-15 kg
 *     general: 5-25 kg
 *     glass: 1-8 kg
 *     e_waste: 0.5-5 kg
 */
function generateWasteBreakdown() {
  const rows = [
    'building_id,category,value_kg,date'
  ];

  const categories = [
    { name: 'organic', min: 15, max: 40, resMultiplier: 1.3, acadMultiplier: 0.7 },
    { name: 'paper', min: 5, max: 20, resMultiplier: 0.6, acadMultiplier: 1.4 },
    { name: 'plastic', min: 3, max: 15, resMultiplier: 1.2, acadMultiplier: 0.9 },
    { name: 'general', min: 5, max: 25, resMultiplier: 1.1, acadMultiplier: 1.0 },
    { name: 'glass', min: 1, max: 8, resMultiplier: 1.2, acadMultiplier: 0.6 },
    { name: 'e_waste', min: 0.5, max: 5, resMultiplier: 0.5, acadMultiplier: 1.5 }
  ];

  const startDate = new Date('2026-09-28T00:00:00.000Z');

  for (let d = 0; d < 30; d++) {
    const current = new Date(startDate.getTime() + d * 24 * 60 * 60 * 1000);
    const dateStr = current.toISOString().split('T')[0];
    const isWeekend = (current.getUTCDay() === 0 || current.getUTCDay() === 6);

    for (const b of buildings) {
      for (const cat of categories) {
        let base = randomInRange(cat.min, cat.max);
        
        // Modulate by building type
        if (b.type === 'residential') {
          base *= cat.resMultiplier;
          if (isWeekend) base *= 1.2;
        } else if (b.type === 'academic' || b.type === 'administrative') {
          base *= cat.acadMultiplier;
          if (isWeekend) base *= 0.4;
        } else if (b.type === 'library') {
          if (cat.name === 'paper') base *= 1.3;
          if (isWeekend) base *= 0.7;
        }

        // Clamp to category realistic bounds
        const val = Math.min(cat.max * 1.1, Math.max(cat.min * 0.8, base));
        rows.push(`${b.id},${cat.name},${roundTo(val, 2)},${dateStr}`);
      }
    }
  }

  const filePath = path.join(dataDir, 'waste_breakdown_subset.csv');
  fs.writeFileSync(filePath, rows.join('\n') + '\n', 'utf8');
  console.log(`Generated ${rows.length - 1} rows in ${filePath}`);
}

// Execute generation
generateReadings();
generateWasteBreakdown();
