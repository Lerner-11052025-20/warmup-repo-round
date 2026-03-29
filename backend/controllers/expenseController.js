const Expense = require('../models/Expense');
const User = require('../models/User');
const ApprovalRule = require('../models/ApprovalRule');
const socketUtil = require('../utils/socketUtil');

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Private (Employee)
exports.createExpense = async (req, res, next) => {
  try {
    const { 
      description, amount, currency, category, expenseDate, 
      paidBy, remarks, receiptUrl, status: inputStatus 
    } = req.body;

    const user = await User.findById(req.user._id);

    // Initial state
    let approvalFlow = [];
    let currentStep = 0;
    let currentApproverId = null;
    let currentApproverIds = [];
    let approvalType = 'sequential';
    let minApprovalPercentage = 100;
    let specificApproverId = null;
    
    let finalStatus = inputStatus === 'draft' ? 'draft' : 'pending';

    // ─── 1. DYNAMIC APPROVAL FLOW BUILDING ───
    if (finalStatus === 'pending') {
      const rule = await ApprovalRule.findOne({ 
        companyId: user.companyId,
        $or: [
          { isActive: true, targetEmployeeIds: user._id },
          { isActive: true, targetCategory: category },
          { isActive: true, targetEmployeeIds: { $size: 0 }, targetCategory: { $in: [null, '', 'all'] } } // Default rule
        ]
      }).sort({ targetEmployeeIds: -1, targetCategory: -1 }); // Priority: Specific Employee > Specific Category > Default

      if (rule) {
        console.log(`[DEBUG] Rule Found: ${rule.ruleName} for ${user.name}`);
        
        approvalType = rule.approvalType || 'sequential';
        minApprovalPercentage = rule.minApprovalPercentage || 100;
        specificApproverId = rule.specificApproverId || null;

        let stepIndex = 0;

        // Step A: Manager (if required by rule)
        if (rule.isManagerApprover && user.managerId) {
          approvalFlow.push({
            approverId: user.managerId,
            step: 1,
            status: 'pending',
            isRequired: true
          });
          stepIndex++;
        }

        // Step B: Additional Approvers (Finance, Director, etc.)
        if (rule.approvers && rule.approvers.length > 0) {
          rule.approvers.forEach(app => {
            approvalFlow.push({
              approverId: app.approverId,
              step: approvalType === 'sequential' ? ++stepIndex : 1, // If sequential, increment. If parallel, all at step 1.
              status: 'pending',
              isRequired: app.isRequired !== false
            });
          });
        }
      }

      // ─── 2. Pointers initialization ───
      if (approvalFlow.length > 0) {
        if (approvalType === 'sequential') {
          currentApproverId = approvalFlow[0].approverId;
          currentApproverIds = [currentApproverId];
        } else {
          // Parallel/Hybrid: Notify everyone at once or first batch
          currentApproverIds = approvalFlow.map(f => f.approverId);
          currentApproverId = null; // No single pointer
        }
      } else {
        // No rule found or no approvers? Auto-approve or fallback to Admin
        finalStatus = 'approved';
      }
    }

    const expense = await Expense.create({
      userId: req.user._id,
      companyId: req.user.companyId,
      description,
      amount,
      currency,
      category,
      expenseDate,
      paidBy,
      remarks,
      receiptUrl,
      status: finalStatus,
      approvalFlow,
      currentStep: 0,
      currentApproverId,
      currentApproverIds,
      approvalType,
      minApprovalPercentage,
      specificApproverId
    });

    console.log(`[DEBUG] Expense Created: ${expense._id} | Status: ${expense.status} | First Approver: ${expense.currentApproverId}`);

    const populatedExpense = await Expense.findById(expense._id)
      .populate('userId', 'name role managerId')
      .populate('approvalFlow.approverId', 'name');

    // Emit event for real-time dashboards
    socketUtil.emitToCompany(req.user.companyId, 'expense_updated', {
      message: `New expense request from ${req.user.name}`,
      expenseId: expense._id,
      newExpense: true,
      updatedData: populatedExpense
    });

    res.status(201).json({
      success: true,
      message: finalStatus === 'draft' ? 'Draft saved' : 'Expense submitted for approval',
      expense
    });

  } catch (error) {
    console.error('[ERROR] Expense Creation:', error);
    next(error);
  }
};

// @desc    Get user's expenses
// @route   GET /api/expenses/my
// @access  Private (Employee)
exports.getMyExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id })
      .sort('-createdAt')
      .populate('approvalFlow.approverId', 'name email');

    res.status(200).json({
      success: true,
      count: expenses.length,
      expenses
    });
  } catch (error) {
    next(error);
  }
};
