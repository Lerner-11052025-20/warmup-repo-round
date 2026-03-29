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
    }
  },
  { timestamps: true }
);

// Indexes to speed up queries for a user or company
expenseSchema.index({ userId: 1, createdAt: -1 });
expenseSchema.index({ companyId: 1, status: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
