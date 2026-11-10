import mongoose from 'mongoose';

const recommendationSchema = new mongoose.Schema(
  {
    buildingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Building',
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['energy', 'water', 'air', 'carbon', 'behaviour', 'infrastructure', 'waste'],
      required: true,
    },
    impact: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    source: {
      type: String,
      enum: ['rule', 'ai'],
      default: 'rule',
    },
    status: {
      type: String,
      enum: ['proposed', 'in_progress', 'completed', 'dismissed'],
      default: 'proposed',
    },
  },
  {
    timestamps: true,
  }
);

const Recommendation = mongoose.model('Recommendation', recommendationSchema);
export default Recommendation;
