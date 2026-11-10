import mongoose from 'mongoose';

const aiPlanSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    scope: {
      buildingIds: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Building',
        },
      ],
      from: { type: Date },
      to: { type: Date },
      goals: [{ type: String }],
      budget: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
      constraints: { type: String },
    },
    model: {
      type: String,
      required: true,
    },
    summaryStats: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    plan: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

aiPlanSchema.index({ createdAt: -1 });

const AiPlan = mongoose.model('AiPlan', aiPlanSchema);
export default AiPlan;
