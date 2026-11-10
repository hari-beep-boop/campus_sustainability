import mongoose from 'mongoose';

const forecastSchema = new mongoose.Schema(
  {
    buildingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Building',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['energy', 'water', 'co2'],
      required: true,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    modelVersion: {
      type: String,
      default: 'seasonal-ewma-v1.0',
    },
    points: [
      {
        ts: { type: Date, required: true },
        predicted: { type: Number, required: true },
        lower: { type: Number, required: true },
        upper: { type: Number, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

forecastSchema.index({ buildingId: 1, type: 1, generatedAt: -1 });

const Forecast = mongoose.model('Forecast', forecastSchema);
export default Forecast;
