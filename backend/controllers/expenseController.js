const Expense = require('../models/Expense');
const socketUtil = require('../utils/socket');

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Private (Employee mostly, though anyone logged in could technically create)
exports.createExpense = async (req, res, next) => {
  try {
    const {
      description, category, expenseDate, paidBy,
      currency, amount, remarks, receiptUrl, status
    } = req.body;

    const User = require('../models/User');
    const ApprovalRule = require('../models/ApprovalRule');
    const user = await User.findById(req.user._id);

    // Build automated workflow
    let approvalFlow = [];
    let currentApproverIds = [];
    let currentApproverId = null;
    let finalStatus = status || 'draft';
    let isSequential = true;
    let minApprovalPercentage = 0;
    let specificApproverId = null;

    if (finalStatus === 'pending') {
      // 1. Try to find a custom rule for the user, otherwise find company default
      let rule = await ApprovalRule.findOne({ companyId: req.user.companyId, userId: req.user._id });
      if (!rule) {
        rule = await ApprovalRule.findOne({ companyId: req.user.companyId, userId: null });
      }

      let stepCounter = 1;

      if (rule) {
        isSequential = rule.isSequential;
        minApprovalPercentage = rule.minApprovalPercentage || 0;
        specificApproverId = rule.specificApproverId || null;

        // Auto-assign direct Manager first if toggled
        if (rule.isManagerApprover && user.managerId) {
          approvalFlow.push({ 
            step: stepCounter++, 
            approverId: user.managerId, 
            status: 'pending', 
            required: true 
          });
        }

        // Add the custom approvers from the rule config
        if (rule.approvers && rule.approvers.length > 0) {
          rule.approvers.forEach(app => {
            approvalFlow.push({
              step: isSequential ? stepCounter++ : 1, // If not sequential, all share same relative step
              approverId: app.approverId,
              status: 'pending',
              required: app.required
            });
          });
        }
      } else {
        // Fallback older hardcoded logic if NO RULES exist at all
        if (user.managerId) {
          approvalFlow.push({ step: stepCounter++, approverId: user.managerId, status: 'pending', required: true });
        }
        const companyAdmin = await User.findOne({ companyId: req.user.companyId, role: 'admin' }).select('_id');
        if (companyAdmin && companyAdmin._id.toString() !== user.managerId?.toString()) {
          approvalFlow.push({ step: stepCounter++, approverId: companyAdmin._id, status: 'pending', required: true });
        }
      }

      // Finalize the routing pointers based on sequential vs non-sequential logic
      if (approvalFlow.length > 0) {
        if (isSequential) {
          currentApproverIds = [approvalFlow[0].approverId];
          currentApproverId = approvalFlow[0].approverId; // legacy variable
        } else {
          // Send to ALL approvers simultaneously
          currentApproverIds = approvalFlow.map(flow => flow.approverId);
          currentApproverId = null; // No single direct step
        }
      } else {
        finalStatus = 'approved'; // Edge case: admin submits or missing workflow setup
      }
    }

    const expense = await Expense.create({
      userId: req.user._id,
      companyId: req.user.companyId,
      description, category, expenseDate, paidBy,
      currency, amount, remarks, receiptUrl,
      status: finalStatus,
      approvalFlow,
      currentApproverId,
      currentApproverIds,
      isSequential,
      minApprovalPercentage,
      specificApproverId
    });

    socketUtil.emitToCompany(req.user.companyId, 'expense_updated', {
      expenseId: expense._id,
      status: finalStatus,
      updatedData: expense
    });
    socketUtil.emitToCompany(req.user.companyId, 'analytics_update', { role: req.user.role });

    res.status(201).json({ success: true, expense });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's own expenses
// @route   GET /api/expenses/my
// @access  Private
exports.getMyExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id })
      .populate('userId', 'name email role avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: expenses.length, expenses });
  } catch (error) {
    next(error);
  }
};

// @desc    Get whole team expenses (for Managers)
// @route   GET /api/expenses/team
// @access  Private (Manager)
exports.getTeamExpenses = async (req, res, next) => {
  try {
    // 1. First find all users where this person is the manager
    const User = require('../models/User');
    const teamEmployees = await User.find({ managerId: req.user._id }).select('_id');
    const teamIds = teamEmployees.map(u => u._id);

    // 2. Find expenses for these users
    const expenses = await Expense.find({ 
      userId: { $in: teamIds },
      companyId: req.user.companyId 
    })
    .populate('userId', 'name email role avatar')
    .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: expenses.length, expenses });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all company expenses (for Admins)
// @route   GET /api/expenses/all
// @access  Private (Admin)
exports.getAllCompanyExpenses = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can view all history' });
    }

    const expenses = await Expense.find({ companyId: req.user.companyId })
      .populate('userId', 'name email role avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: expenses.length, expenses });
  } catch (error) {
    next(error);
  }
};
