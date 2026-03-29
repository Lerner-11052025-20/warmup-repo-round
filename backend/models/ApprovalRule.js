const mongoose = require('mongoose');

const approvalRuleSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },
    ruleName: { // Added for easier identification
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    isActive: { // Added for switching rules on/off
      type: Boolean,
      default: true
    },
    
    // ─── TARGETING LOGIC ───
    targetEmployeeIds: [{ // Supporting multiple specific employees
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    targetCategory: { // 'Travel', 'Meals', etc. or 'all'
      type: String,
      default: 'all'
    },

    // ─── APPROVER CONFIG ───
    isManagerApprover: {
      type: Boolean,
      default: true
    },
    approvers: [
      {
        approverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        step: Number,
        isRequired: { type: Boolean, default: true }
      }
    ],

    // ─── LOGIC CONFIG ───
    approvalType: { // 'sequential' | 'parallel' | 'hybrid'
      type: String,
      enum: ['sequential', 'parallel', 'hybrid'],
      default: 'sequential'
    },
    minApprovalPercentage: {
      type: Number,
      default: 100, // Default to 100% for parallel/hybrid
      min: 0,
      max: 100
    },
    specificApproverId: { // CFO Override
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

// Compound index for fast rule matching
approvalRuleSchema.index({ companyId: 1, isActive: 1, targetCategory: 1 });

module.exports = mongoose.model('ApprovalRule', approvalRuleSchema);
