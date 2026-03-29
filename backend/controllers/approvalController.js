const Expense = require('../models/Expense');
const socketUtil = require('../utils/socketUtil');
const mongoose = require('mongoose');

// @desc    Get pending approvals for manager/admin (Simple One-Level)
// @route   GET /api/approvals/pending
// @access  Private (Manager/Admin)
exports.getPendingApprovals = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const query = {
      companyId: req.user.companyId,
      status: 'pending'
    };

    if (req.user.role !== 'admin') {
      // Must be the assigned person
      query.currentApproverId = userId;
    }

    const expenses = await Expense.find(query)
      .populate('userId', 'name role email')
      .populate('currentApproverId', 'name')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: expenses.length,
      expenses
    });

  } catch (error) {
    console.error('[ERROR] getPendingApprovals:', error);
    next(error);
  }
};

// @desc    Direct Approve or Reject an expense (Simple One-Level)
// @route   POST /api/approvals/action
// @access  Private (Manager/Admin)
exports.actionApproval = async (req, res, next) => {
  try {
    const { expenseId, action, comment } = req.body;
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const expense = await Expense.findById(expenseId);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    // Validate if the user is the authorized approver (Admins can override)
    const isAdmin = req.user.role === 'admin';
    const isApprover = expense.currentApproverId && expense.currentApproverId.toString() === userId.toString();

    if (!isApprover && !isAdmin) {
      return res.status(403).json({ message: 'You are not the authorized approver for this request' });
    }

    // Direct Move to Terminal Status
    expense.status = action === 'approve' ? 'approved' : 'rejected';
    expense.approvedById = userId;
    expense.approverComment = comment || '';
    expense.actedAt = Date.now();
    expense.currentApproverId = null; // No one left to approve

    await expense.save();

    const populatedExpense = await Expense.findById(expense._id)
      .populate('userId', 'name role managerId email')
      .populate('approvedById', 'name');

    // Real-time notification for company
    socketUtil.emitToCompany(req.user.companyId, 'expense_updated', {
      message: `Expense "${expense.description}" ${action}d by ${req.user.name}`,
      expenseId: expense._id,
      updatedData: populatedExpense
    });
    
    // Notify the submitter
    socketUtil.emitToUser(expense.userId.toString(), 'status_change', {
      message: `Your request was ${expense.status}`,
      status: expense.status
    });

    res.status(200).json({
      success: true,
      message: `Request ${action}d successfully`,
      expense: populatedExpense
    });

  } catch (error) {
    console.error('[ERROR] actionApproval (Simple Flow):', error);
    next(error);
  }
};
