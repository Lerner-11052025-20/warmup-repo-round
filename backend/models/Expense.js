const mongoose = require('mongoose');

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
    default: 'INR'
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

  // ─── SIMPLE APPROVAL FIELDS ───
  currentApproverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedById: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approverComment: {
    type: String,
    default: ''
  },
  actedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for performance
expenseSchema.index({ companyId: 1, status: 1 });
expenseSchema.index({ currentApproverId: 1, status: 1 });
expenseSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
