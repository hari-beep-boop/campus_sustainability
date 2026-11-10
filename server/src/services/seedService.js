import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import Building from '../models/Building.js';
import Setting from '../models/Setting.js';
import Reading from '../models/Reading.js';
import Device from '../models/Device.js';
import Alert from '../models/Alert.js';
import Recommendation from '../models/Recommendation.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function seedInitialData() {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      logger.info('Database already contains data; skipping initial seed.');
      return;
    }

    logger.info('Database is empty. Initializing seed data with users, buildings, and settings...');

    // 1. Seed Default Users with bcrypt
    const users = [
      {
        username: 'admin',
        passwordHash: await User.hashPassword('Admin@123'),
        role: 'admin',
      },
      {
        username: 'manager',
        passwordHash: await User.hashPassword('Manager@123'),
        role: 'facility_manager',
      },
      {
        username: 'student',
        passwordHash: await User.hashPassword('Student@123'),
        role: 'student',
      },
    ];
    await User.insertMany(users);
    logger.info('Default accounts created (admin, manager, student).');

    // 2. Seed Default Settings
    const defaultSettings = [
      {
        key: 'thresholds',
        value: {
          energy_kwh: 6000,
          water_litres: 95000,
          co2_ppm: 1000,
          waste_kg: 500,
        },
      },
      {
        key: 'gridEmissionFactorKgPerKwh',
        value: 0.71,
      },
      {
        key: 'reportCampusName',
        value: 'Greenwood Central Campus',
      },
    ];
    await Setting.insertMany(defaultSettings);

    // 3. Seed Buildings
    const buildingsData = [
      { name: 'Science Block A', code: 'SCI-A', buildingType: 'academic', location: 'North Quad', areaM2: 4500, occupancy: 500 },
      { name: 'Engineering Hall', code: 'ENG', buildingType: 'academic', location: 'East Wing', areaM2: 5200, occupancy: 650 },
      { name: 'Library Complex', code: 'LIB', buildingType: 'library', location: 'Central Square', areaM2: 3800, occupancy: 400 },
      { name: 'Student Residence North', code: 'RES-N', buildingType: 'residential', location: 'Residential District', areaM2: 6000, occupancy: 350 },
      { name: 'Admin Building', code: 'ADMIN', buildingType: 'administrative', location: 'South Gate', areaM2: 2400, occupancy: 150 },
    ];
    const createdBuildings = await Building.insertMany(buildingsData);
    logger.info(`Seeded ${createdBuildings.length} campus buildings.`);

    // 4. Seed Simulated Devices
    const devicesData = createdBuildings.map((b, i) => ({
      deviceId: `bldg-0${i + 1}-node`,
      buildingId: b._id,
      label: `${b.name} Multi-Sensor Node`,
      apiKeyHash: '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890dummykeyhash',
      sensors: ['co2', 'electricity', 'water'],
      calibration: {
        co2: { offsetPpm: 0, scale: 1.0 },
        electricity: { sensitivityMvPerA: 100, zeroCurrentMv: 2500, mainsVoltage: 230, powerFactor: 0.9 },
        water: { pulsesPerLitre: 450 },
      },
      status: 'online',
      lastSeenAt: new Date(),
    }));
    await Device.insertMany(devicesData);

    // 5. Seed Initial Readings from CSV if available
    const csvPath = path.resolve(__dirname, '../../../data/sustainability_readings_subset.csv');
    if (fs.existsSync(csvPath)) {
      const csvRaw = fs.readFileSync(csvPath, 'utf8');
      const lines = csvRaw.trim().split('\n');
      const header = lines[0].split(',');
      const buildingMap = {};
      createdBuildings.forEach((b) => {
        buildingMap[b.name] = b._id;
        buildingMap[b.code] = b._id;
      });

      const readingsToInsert = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        // Parse CSV columns: timestamp,building_id,bdg2_building_name,display_name,building_type,campus,resource_type,value
        // Handle quoted names
        const matches = line.match(/(?:[^\s",]+|"[^"]*")+/g);
        if (!matches || matches.length < 8) continue;

        const ts = new Date(matches[0]);
        const bdgName = matches[2].replace(/"/g, '').trim();
        const code = matches[3].replace(/"/g, '').trim();
        const type = matches[6].trim().toLowerCase();
        const value = parseFloat(matches[7]);

        const buildingId = buildingMap[bdgName] || buildingMap[code] || createdBuildings[0]._id;
        if (!isNaN(value)) {
          let unit = 'kWh';
          if (type === 'water') unit = 'L';
          if (type === 'co2') unit = 'ppm';
          if (type === 'waste') unit = 'kg';

          readingsToInsert.push({
            ts,
            meta: {
              buildingId,
              deviceId: `bldg-node`,
              type,
            },
            value,
            unit,
          });
        }
      }

      if (readingsToInsert.length > 0) {
        await Reading.insertMany(readingsToInsert);
        logger.info(`Inserted ${readingsToInsert.length} seed sensor readings.`);
      }
    }

    // 6. Seed Default Recommendations
    const sampleRecs = [
      {
        buildingId: createdBuildings[0]._id,
        title: 'Optimize HVAC Scheduling in Science Block A',
        description: 'Night baseline energy load is consistently 38% of peak. Set HVAC setbacks between 22:00 and 06:00 to save estimated 2,400 kWh/month.',
        category: 'energy',
        impact: 'high',
        source: 'rule',
      },
      {
        buildingId: createdBuildings[1]._id,
        title: 'Repair Restroom Flow Flapper in Engineering Hall',
        description: 'Continuous low-level water draw detected between 01:00 and 04:00 (approx 2.4 L/min), indicative of a leaking fixture.',
        category: 'water',
        impact: 'medium',
        source: 'rule',
      },
      {
        buildingId: createdBuildings[2]._id,
        title: 'Demand-Controlled Ventilation in Library complex',
        description: 'CO₂ peaks above 1,100 ppm during study hours. Modulate fresh air dampers based on live ppm sensors to improve cognitive comfort.',
        category: 'air',
        impact: 'high',
        source: 'rule',
      },
    ];
    await Recommendation.insertMany(sampleRecs);

    // 7. Seed Initial Sample Alerts
    const sampleAlerts = [
      {
        buildingId: createdBuildings[0]._id,
        metric: 'energy',
        severity: 'high',
        message: 'Science Block A exceeded peak threshold (6,240 kWh vs 6,000 kWh limit)',
        source: 'threshold',
      },
      {
        buildingId: createdBuildings[2]._id,
        metric: 'co2',
        severity: 'medium',
        message: 'Library Complex 2nd Floor reading 1,120 ppm CO₂ (poor ventilation)',
        source: 'threshold',
      },
    ];
    await Alert.insertMany(sampleAlerts);

    logger.info('Initial seed completed successfully!');
  } catch (err) {
    logger.error({ err: err.message }, 'Error seeding initial data');
  }
}

export default seedInitialData;
