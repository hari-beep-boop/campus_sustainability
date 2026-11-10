import mongoose from 'mongoose';

const readingSchema = new mongoose.Schema(
  {
    ts: {
      type: Date,
      required: true,
      index: true,
    },
    meta: {
      buildingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Building',
        required: true,
        index: true,
      },
      deviceId: {
        type: String,
        trim: true,
      },
      type: {
        type: String,
        enum: ['energy', 'water', 'co2', 'waste'],
        required: true,
        index: true,
      },
      seq: {
        type: Number,
      },
    },
    value: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    raw: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

readingSchema.index({ 'meta.buildingId': 1, 'meta.type': 1, ts: -1 });
readingSchema.index({ 'meta.deviceId': 1, 'meta.seq': 1 });

const Reading = mongoose.model('Reading', readingSchema);
export default Reading;
