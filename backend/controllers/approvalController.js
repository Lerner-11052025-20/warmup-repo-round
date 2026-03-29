const Expense = require('../models/Expense');
const User = require('../models/User');

// @desc    Get pending approvals for the current manager/admin
// @route   GET /api/approvals/pending
// @access  Private (Manager/Admin)
exports.getPendingApprovals = async (req, res, next) => {
  try {
    // Managers see what's assigned to them OR orphaned expenses. Admins see EVERYTHING pending.
    const query = {
      companyId: req.user.companyId,
      status: 'pending'
    };

    if (req.user.role !== 'admin') {
      query.$or = [
        { currentApproverId: req.user._id },
        { currentApproverId: { $in: [null, undefined] } } // orphans
      ];
    }

    const expenses = await Expense.find(query)
      .populate('userId', 'name email avatar role')
      .populate('approvalFlow.approverId', 'name role')
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

// @desc    Approve or reject an expense
// @route   POST /api/approvals/action
// @access  Private (Manager/Admin)
exports.actionApproval = async (req, res, next) => {
  try {
    const { expenseId, action, comment } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Must be approve or reject' });
    }

    const expense = await Expense.findById(expenseId);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (expense.status !== 'pending') {
      return res.status(400).json({ message: 'Expense is no longer pending' });
    }

    // Security Check
    if (expense.currentApproverId && expense.currentApproverId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to approve this expense at this step' });
    }

    // Find current step index if this is a structured workflow
    let currentStepIndex = -1;
    if (expense.approvalFlow && expense.approvalFlow.length > 0) {
      currentStepIndex = expense.approvalFlow.findIndex(
        flow => flow.status === 'pending' && (flow.approverId.toString() === req.user._id.toString() || req.user.role === 'admin')
      );
    }

    if (currentStepIndex !== -1) {
      // 1. STRUCTURED WORKFLOW LOGIC
      expense.approvalFlow[currentStepIndex].status = action === 'approve' ? 'approved' : 'rejected';
      expense.approvalFlow[currentStepIndex].comment = comment || '';
      expense.approvalFlow[currentStepIndex].actionDate = Date.now();
      
      // Also update the actual approver ID if an Admin overrides it
      expense.approvalFlow[currentStepIndex].approverId = req.user._id; 

      if (action === 'reject') {
        expense.status = 'rejected';
        expense.currentApproverId = null;
      } else {
        const nextStepIndex = currentStepIndex + 1;
        if (nextStepIndex < expense.approvalFlow.length) {
          expense.currentApproverId = expense.approvalFlow[nextStepIndex].approverId;
        } else {
          expense.status = 'approved';
          expense.currentApproverId = null;
        }
      }
    } else {
      // 2. LEGACY ORPHANED LOGIC (Before workflow engine was added)
      expense.status = action === 'approve' ? 'approved' : 'rejected';
      
      if (!expense.approvalFlow) expense.approvalFlow = [];
      expense.approvalFlow.push({
        step: 1,
        approverId: req.user._id,
        status: action === 'approve' ? 'approved' : 'rejected',
        comment: comment || (action === 'approve' ? 'Approved by Manager' : 'Rejected by Manager'),
        actionDate: Date.now()
      });
      expense.currentApproverId = null;
    }

    await expense.save();

    res.status(200).json({
      success: true,
      message: `Expense ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      expense
    });
  } catch (error) {
    next(error);
  }
};
