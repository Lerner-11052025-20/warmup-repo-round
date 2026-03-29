const mongoose = require('mongoose');

const approvalRuleSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },
    ruleName: { 
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    isActive: { 
      type: Boolean,
      default: true
    },
    
    // ─── TARGETING LOGIC ───
    targetCategory: { 
      type: String,
      default: 'all'
    },

    // ─── DIRECT APPROVER CONFIG ───
    isManagerApprover: {
      type: Boolean,
      default: true
    },
    approverId: { 
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
