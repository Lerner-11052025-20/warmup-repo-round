const Expense = require('../models/Expense');

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
    const user = await User.findById(req.user._id);
    
    // Build approval flow if not a draft
    let approvalFlow = [];
    let currentApproverId = null;
    let finalStatus = status || 'draft';

    if (finalStatus === 'pending') {
      let stepCounter = 1;
      
      // Step 1: Direct Manager
      if (user.managerId) {
        approvalFlow.push({ step: stepCounter++, approverId: user.managerId, status: 'pending' });
      }
      
      // Step 2: An Admin in the company (Finance / Director representation)
      const companyAdmin = await User.findOne({ companyId: req.user.companyId, role: 'admin' }).select('_id');
      if (companyAdmin && companyAdmin._id.toString() !== user.managerId?.toString()) {
        approvalFlow.push({ step: stepCounter++, approverId: companyAdmin._id, status: 'pending' });
      }
      
      // If no approvers exist, auto-approve for simplicity, or just fail
      if (approvalFlow.length > 0) {
        currentApproverId = approvalFlow[0].approverId;
      } else {
        finalStatus = 'approved'; // Edge case: admin submits or no hierarchy
      }
    }

    const expense = await Expense.create({
      userId: req.user._id,
      companyId: req.user.companyId,
      description, category, expenseDate, paidBy,
      currency, amount, remarks, receiptUrl,
      status: finalStatus,
      approvalFlow,
      currentApproverId
    });

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
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: expenses.length,
      expenses
    });
  } catch (error) {
    next(error);
  }
};
