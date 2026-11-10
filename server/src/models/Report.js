import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      default: 'Campus Sustainability Performance Report',
    },
    filePath: {
      type: String,
      required: true,
    },
    campus: {
      type: String,
      default: 'Main Campus',
    },
    summary: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const Report = mongoose.model('Report', reportSchema);
export default Report;
