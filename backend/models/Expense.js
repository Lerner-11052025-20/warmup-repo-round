const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
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
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Category is required']
    },
    expenseDate: {
      type: Date,
      required: [true, 'Expense Date is required']
    },
    paidBy: {
      type: String,
      enum: ['self', 'company'],
      default: 'self'
    },
    currency: {
      type: String,
      default: 'USD'
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: 0
    },
    remarks: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'rejected'],
      default: 'draft'
    },
    receiptUrl: {
      type: String
    },
    currentApproverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    currentApproverIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    isSequential: { type: Boolean, default: true },
    minApprovalPercentage: { type: Number, default: 0 },
    specificApproverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvalFlow: [
      {
        step: Number,
        approverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        required: { type: Boolean, default: true },
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
        comment: String,
        actionDate: Date
      }
    ]
  },
  { timestamps: true }
);

// Indexes to speed up queries for a user, company, and filters
expenseSchema.index({ userId: 1, createdAt: -1 });
expenseSchema.index({ companyId: 1, status: 1 });
expenseSchema.index({ companyId: 1, category: 1 });
expenseSchema.index({ companyId: 1, userId: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
