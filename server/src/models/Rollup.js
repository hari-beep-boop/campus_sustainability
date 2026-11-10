import mongoose from 'mongoose';

const rollupSchema = new mongoose.Schema(
  {
    buildingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Building',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['energy', 'water', 'co2', 'waste'],
      required: true,
    },
    bucket: {
      type: String,
      enum: ['hour', 'day'],
      required: true,
    },
    start: {
      type: Date,
      required: true,
      index: true,
    },
    sum: { type: Number, default: 0 },
    avg: { type: Number, default: 0 },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

rollupSchema.index({ buildingId: 1, type: 1, bucket: 1, start: 1 }, { unique: true });

const Rollup = mongoose.model('Rollup', rollupSchema);
export default Rollup;
