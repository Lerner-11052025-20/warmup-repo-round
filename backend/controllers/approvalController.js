const Expense = require('../models/Expense');
const User = require('../models/User');
const socketUtil = require('../utils/socketUtil');
const mongoose = require('mongoose');

// @desc    Get pending approvals for manager/admin
// @route   GET /api/approvals/pending
// @access  Private (Manager/Admin)
exports.getPendingApprovals = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    // ─── CRITICAL VISIBILITY QUERY ───
    const query = {
      companyId: req.user.companyId,
      status: 'pending'
    };

    if (req.user.role !== 'admin') {
      // Must be the assigned person or in the assigned list
      query.$or = [
        { currentApproverId: userId },
        { currentApproverIds: { $in: [userId] } }
      ];
    }

    const expenses = await Expense.find(query)
      .populate('userId', 'name role')
      .populate('approvalFlow.approverId', 'name')
      .sort('-createdAt');

    console.log(`[DEBUG] Pending approvals for user: ${userId} (${req.user.role}) | Found: ${expenses.length}`);

    res.status(200).json({
      success: true,
      count: expenses.length,
      expenses
    });

  } catch (error) {
    console.error('[ERROR] Fetching Approvals:', error);
    next(error);
  }
};

// @desc    Approve or Reject an expense
// @route   POST /api/approvals/action
// @access  Private (Manager/Admin)
exports.actionApproval = async (req, res, next) => {
  try {
    const { expenseId, action, comment } = req.body;
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const expense = await Expense.findById(expenseId);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    // ─── 0. Admin Override ───
    const isAdmin = req.user.role === 'admin';

    // ─── 1. Identify User in Flow ───
    // Find EVERY step this person is assigned to (could be same person in multi-steps)
    const activeStepIndex = expense.approvalFlow.findIndex(
      step => step.status === 'pending' && step.approverId.toString() === userId.toString()
    );

    if (activeStepIndex === -1 && !isAdmin) {
      return res.status(403).json({ message: 'You are not an authorized approver for this request right now' });
    }

    const targetStepIndex = activeStepIndex === -1 && isAdmin 
      ? expense.approvalFlow.findIndex(s => s.status === 'pending') // Admin picks first pending step
      : activeStepIndex;

    const targetStep = expense.approvalFlow[targetStepIndex];
    if (!targetStep && isAdmin) {
       // If no steps left but still pending, Admin decides
       expense.status = action === 'approve' ? 'approved' : 'rejected';
    } else {
       // Update the step
       targetStep.status = action === 'approve' ? 'approved' : 'rejected';
       targetStep.comment = comment || '';
       targetStep.actedAt = Date.now();
    }

    // ─── 2. REJECTION LOGIC (Immediate Stop) ───
    if (action === 'reject') {
      expense.status = 'rejected';
      expense.currentApproverId = null;
      expense.currentApproverIds = [];
      console.log(`[DEBUG] Expense REJECTED: ${expense._id} by ${userId}`);
    } else {
      // ─── 3. APPROVAL FLOW LOGIC ───
      
      // Case A: Specific Approver (CFO Override)
      if (expense.specificApproverId && expense.specificApproverId.toString() === userId.toString()) {
        expense.status = 'approved';
        expense.currentApproverId = null;
        expense.currentApproverIds = [];
        console.log(`[DEBUG] CEO/CFO OVERRRIDE APPROVAL: ${expense._id}`);
      } else {
        // Case B: Sequential Flow
        if (expense.approvalType === 'sequential') {
          const nextStepIndex = targetStepIndex + 1;
          if (nextStepIndex < expense.approvalFlow.length) {
            expense.currentStep = nextStepIndex;
            expense.currentApproverId = expense.approvalFlow[nextStepIndex].approverId;
            expense.currentApproverIds = [expense.currentApproverId];
            console.log(`[DEBUG] Moved to next step: ${nextStepIndex} | Next Approver: ${expense.currentApproverId}`);
          } else {
            expense.status = 'approved';
            expense.currentApproverId = null;
            expense.currentApproverIds = [];
            console.log(`[DEBUG] Last step approved: ${expense._id}`);
          }
        } 
        // Case C: Parallel / Percentage check
        else {
          const totalSteps = expense.approvalFlow.length;
          const approvedSteps = expense.approvalFlow.filter(s => s.status === 'approved').length;
          const currentPercentage = (approvedSteps / totalSteps) * 100;

          if (currentPercentage >= expense.minApprovalPercentage) {
            expense.status = 'approved';
            expense.currentApproverId = null;
            expense.currentApproverIds = [];
            console.log(`[DEBUG] Percentage criteria met: ${currentPercentage}% | Approved: ${expense._id}`);
          } else {
            // Keep current status and allow others to approve
             console.log(`[DEBUG] Percentage pending: ${currentPercentage}% < ${expense.minApprovalPercentage}%`);
          }
        }
      }
    }

    await expense.save();

    const populatedExpense = await Expense.findById(expense._id)
      .populate('userId', 'name role managerId')
      .populate('approvalFlow.approverId', 'name');

    // ─── 4. NOTIFY ───
    socketUtil.emitToCompany(req.user.companyId, 'expense_updated', {
      message: `Expense ${expense.description} ${action === 'approve' ? 'Approved' : 'Rejected'} by ${req.user.name}`,
      expenseId: expense._id,
      updatedData: populatedExpense
    });
    
    // Notify the specific employee
    socketUtil.emitToUser(expense.userId.toString(), 'status_change', {
      message: `Your expense request was ${expense.status}`,
      status: expense.status
    });

    res.status(200).json({
      success: true,
      message: `Request ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      expense
    });

  } catch (error) {
    console.error('[ERROR] Approval Action:', error);
    next(error);
  }
};
