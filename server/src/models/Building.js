import mongoose from 'mongoose';

const buildingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      trim: true,
      uppercase: true,
    },
    location: {
      type: String,
      default: 'Main Campus',
    },
    campus: {
      type: String,
      default: 'Main',
    },
    buildingType: {
      type: String,
      enum: ['academic', 'library', 'residential', 'administrative', 'laboratory', 'sports', 'other'],
      default: 'academic',
    },
    areaM2: {
      type: Number,
      default: 2500,
    },
    occupancy: {
      type: Number,
      default: 300,
    },
  },
  {
    timestamps: true,
  }
);

const Building = mongoose.model('Building', buildingSchema);
export default Building;
