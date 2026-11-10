import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    buildingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Building',
      required: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    apiKeyHash: {
      type: String,
      required: true,
    },
    sensors: [
      {
        type: String,
        enum: ['co2', 'electricity', 'water'],
      },
    ],
    calibration: {
      co2: {
        offsetPpm: { type: Number, default: 0 },
        scale: { type: Number, default: 1.0 },
      },
      electricity: {
        sensitivityMvPerA: { type: Number, default: 100 }, // ACS721-20A default = 100mV/A
        zeroCurrentMv: { type: Number, default: 2500 }, // 2.5V zero point at 5V Vcc
        mainsVoltage: { type: Number, default: 230 }, // 230V default (India / EU)
        powerFactor: { type: Number, default: 0.9 },
      },
      water: {
        pulsesPerLitre: { type: Number, default: 450 }, // YF-S201 typical
      },
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['online', 'offline'],
      default: 'online',
    },
  },
  {
    timestamps: true,
  }
);

deviceSchema.index({ buildingId: 1 });

const Device = mongoose.model('Device', deviceSchema);
export default Device;
