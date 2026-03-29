const Expense = require('../models/Expense');
const User = require('../models/User');
const Company = require('../models/Company');
const ApprovalRule = require('../models/ApprovalRule');
const socketUtil = require('../utils/socketUtil');

// @desc    Create new expense (Simple Flow)
// @route   POST /api/expenses
// @access  Private (Employee/Manager)
exports.createExpense = async (req, res, next) => {
  try {
    const { 
      description, amount, currency, category, expenseDate, 
      paidBy, remarks, receiptUrl, status: inputStatus 
    } = req.body;

    const user = await User.findById(req.user._id);

    let finalStatus = (inputStatus === 'draft') ? 'draft' : 'pending';
    let currentApproverId = null;

    // ─── 1. SIMPLIFIED DIRECT APPROVER SELECTION ───
    if (finalStatus === 'pending') {
      const rule = await ApprovalRule.findOne({ 
        companyId: user.companyId,
        isActive: true,
        $or: [
          { targetCategory: category },
          { targetCategory: 'all' }
        ]
      }).sort({ targetCategory: -1 }); // Category-specific takes priority over 'all'

      if (rule) {
        if (rule.isManagerApprover && user.managerId) {
          currentApproverId = user.managerId;
        } else if (rule.approverId) {
          currentApproverId = rule.approverId;
        }
      }

      // Fallback: If no rule or no rule-approver, use direct manager or admin
      if (!currentApproverId) {
        if (user.managerId) {
          currentApproverId = user.managerId;
        } else {
          // If no manager, find first admin in company
          const admin = await User.findOne({ companyId: user.companyId, role: 'admin' });
          if (admin) {
             currentApproverId = admin._id;
          } else {
             // Emergency auto-approval if literally NO ONE can approve
             finalStatus = 'approved';
          }
        }
      }
    }

    const expense = await Expense.create({
      userId: req.user._id,
      companyId: req.user.companyId,
      description,
      amount,
      currency: currency || 'INR',
      category,
      expenseDate,
      paidBy,
      remarks,
      receiptUrl,
      status: finalStatus,
      currentApproverId
    });

    const populatedExpense = await Expense.findById(expense._id)
      .populate('userId', 'name role managerId email')
      .populate('currentApproverId', 'name email');

    // Emit event for real-time notifications
    socketUtil.emitToCompany(req.user.companyId, 'expense_updated', {
      message: `New expense request from ${req.user.name}`,
      expenseId: expense._id,
      newExpense: true,
      updatedData: populatedExpense
    });

    res.status(201).json({
      success: true,
      message: finalStatus === 'draft' ? 'Draft saved' : 'Expense submitted for approval',
      expense: populatedExpense
    });

  } catch (error) {
    console.error('[ERROR] createExpense (Simple Flow):', error);
    next(error);
  }
};

// @desc    Get current user's expenses
// @route   GET /api/expenses/my
// @access  Private (All Roles)
exports.getMyExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id })
      .sort('-createdAt')
      .populate('currentApproverId', 'name email');

    res.status(200).json({
      success: true,
      count: expenses.length,
      expenses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get team expenses (History for Manager/Admin)
// @route   GET /api/expenses/team
// @access  Private (Manager/Admin)
exports.getTeamExpenses = async (req, res, next) => {
  try {
    let query = { companyId: req.user.companyId };

    if (req.user.role === 'manager') {
      const team = await User.find({ managerId: req.user._id }).select('_id');
      const teamIds = team.map(u => u._id);
      // Show reports + self (since history can contain both)
      query.userId = { $in: [...teamIds, req.user._id] };
    }

    const expenses = await Expense.find(query)
      .sort('-createdAt')
      .populate('userId', 'name role email')
      .populate('currentApproverId', 'name')
      .populate('approvedById', 'name');

    res.status(200).json({
      success: true,
      count: expenses.length,
      expenses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all company expenses (Admin History)
// @route   GET /api/expenses/all
// @access  Private (Admin)
exports.getAllCompanyExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ companyId: req.user.companyId })
      .sort('-createdAt')
      .populate('userId', 'name role email text')
      .populate('currentApproverId', 'name')
      .populate('approvedById', 'name');

    res.status(200).json({
      success: true,
      count: expenses.length,
      expenses
    });
  } catch (error) {
    next(error);
  }
};
