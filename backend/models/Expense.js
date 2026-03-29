const mongoose = require('mongoose');

const approvalStepSchema = new mongoose.Schema({
  approverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  step: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  isRequired: {
    type: Boolean,
    default: true
  },
  comment: {
    type: String,
    default: ''
  },
  actedAt: {
    type: Date
  }
});

const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: 'USD'
  },
  category: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  expenseDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected'],
    default: 'pending'
  },
  receiptUrl: {
    type: String
  },
  remarks: {
     type: String
  },

  // ─── NEW APPROVAL ENGINE FIELDS ───
  approvalFlow: [approvalStepSchema],
  
  currentStep: {
    type: Number,
    default: 0 // Index of the current step in the approvalFlow array
  },
  currentApproverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  currentApproverIds: [{ // For parallel/percentage rules
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  approvalType: {
    type: String,
    enum: ['sequential', 'parallel', 'hybrid'],
    default: 'sequential'
  },
  minApprovalPercentage: {
    type: Number,
    default: 100
  },
  specificApproverId: { // VIP/CFO Approver for override logic
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Indexes for performance
expenseSchema.index({ companyId: 1, status: 1 });
expenseSchema.index({ currentApproverId: 1, status: 1 });
expenseSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
