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
    targetEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },

    // ─── SEQUENCE & LOGIC (V2.0) ───
    autoManager: {
      type: Boolean,
      default: true
    },
    sequence: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        required: { type: Boolean, default: true }
      }
    ],
    isStrict: {
      type: Boolean,
      default: true
    },
    threshold: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    },
    vipApprover: {
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
