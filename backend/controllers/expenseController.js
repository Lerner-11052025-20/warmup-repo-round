const Expense = require('../models/Expense');

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Private (Employee mostly, though anyone logged in could technically create)
exports.createExpense = async (req, res, next) => {
  try {
    const {
      description,
      category,
      expenseDate,
      paidBy,
      currency,
      amount,
      remarks,
      receiptUrl,
      status // optional override, default is 'draft' or 'pending' depending on form
    } = req.body;

    const expense = await Expense.create({
      userId: req.user._id,
      companyId: req.user.companyId,
      description,
      category,
      expenseDate,
      paidBy,
      currency,
      amount,
      remarks,
      receiptUrl,
      status: status || 'pending' // Let form explicitly set draft if they want auto-save
    });

    res.status(201).json({
      success: true,
      expense
    });
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
