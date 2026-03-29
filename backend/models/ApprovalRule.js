const mongoose = require('mongoose');

const approvalRuleSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null // if null, it's a global company rule
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    isManagerApprover: {
      type: Boolean,
      default: true
    },
    approvers: [
      {
        approverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        step: Number,
        required: { type: Boolean, default: true }
      }
    ],
    isSequential: {
      type: Boolean,
      default: true
    },
    minApprovalPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    specificApproverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ApprovalRule', approvalRuleSchema);
