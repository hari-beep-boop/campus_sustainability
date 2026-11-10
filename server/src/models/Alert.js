import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema(
  {
    buildingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Building',
      required: true,
      index: true,
    },
    metric: {
      type: String,
      enum: ['energy', 'water', 'co2', 'waste', 'device'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    message: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      enum: ['threshold', 'anomaly', 'device'],
      required: true,
    },
    ackBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    ackAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

alertSchema.index({ createdAt: -1 });
alertSchema.index({ buildingId: 1, severity: 1 });

const Alert = mongoose.model('Alert', alertSchema);
export default Alert;
