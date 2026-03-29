const Expense = require('../models/Expense');
const User = require('../models/User');
const socketUtil = require('../utils/socket');

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
        { currentApproverIds: req.user._id },
        { currentApproverId: { $in: [null, undefined] }, currentApproverIds: { $exists: false } }, // legacy orphans
        { currentApproverId: { $in: [null, undefined] }, currentApproverIds: { $size: 0 } } // new orphans
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
    const isDirectMatch = expense.currentApproverId && expense.currentApproverId.toString() === req.user._id.toString();
    const isArrayMatch = expense.currentApproverIds && expense.currentApproverIds.some(id => id.toString() === req.user._id.toString());
    const isLegacyOrphan = (!expense.currentApproverId && (!expense.currentApproverIds || expense.currentApproverIds.length === 0));

    if (!isDirectMatch && !isArrayMatch && !isLegacyOrphan && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to approve this expense at this step' });
    }

    // Find current step index if this is a structured workflow
    let currentStepIndex = -1;
    if (expense.approvalFlow && expense.approvalFlow.length > 0) {
      if (expense.isSequential !== false) {
        currentStepIndex = expense.approvalFlow.findIndex(
          flow => flow.status === 'pending' && (flow.approverId.toString() === req.user._id.toString() || req.user.role === 'admin')
        );
      } else {
        // Non-sequential loop
        currentStepIndex = expense.approvalFlow.findIndex(
          flow => flow.status === 'pending' && flow.approverId.toString() === req.user._id.toString()
        );
        if (currentStepIndex === -1 && req.user.role === 'admin') {
           currentStepIndex = expense.approvalFlow.findIndex(flow => flow.status === 'pending');
        }
      }
    }

    // Determine logic type and process
    if (expense.approvalFlow && expense.approvalFlow.length > 0) {
      // ─── 1. STRUCTURED WORKFLOW LOGIC ───
      
      // Safety: If no step found for this user, they shouldn't be here (redundant check)
      if (currentStepIndex === -1) {
        return res.status(403).json({ 
          message: 'Could not identify your current position in the approval flow. Please contact Admin.' 
        });
      }

      const activeStep = expense.approvalFlow[currentStepIndex];
      activeStep.status = action === 'approve' ? 'approved' : 'rejected';
      activeStep.comment = comment || '';
      activeStep.actionDate = Date.now();
      
      // Link the actual user ID who took the action (Admin override support)
      activeStep.approverId = req.user._id;

      if (action === 'reject') {
        expense.status = 'rejected';
        expense.currentApproverId = null;
        expense.currentApproverIds = [];
      } else {
        // ACTION: APPROVE
        if (expense.isSequential !== false) {
          // ─── Case A: Sequential Flow ───
          const nextStepIndex = currentStepIndex + 1;
          
          if (nextStepIndex < expense.approvalFlow.length) {
            // Move to next specific person
            const nextApprover = expense.approvalFlow[nextStepIndex].approverId;
            expense.currentApproverId = nextApprover;
            expense.currentApproverIds = [nextApprover];
            // status remains 'pending'
          } else {
            // End of chain reached
            expense.status = 'approved';
            expense.currentApproverId = null;
            expense.currentApproverIds = [];
          }
        } else {
          // ─── Case B: Non-sequential / Hybrid Flow ───
          const requiredApprovers = expense.approvalFlow.filter(f => f.required !== false);
          const totalRequired = requiredApprovers.length > 0 ? requiredApprovers.length : expense.approvalFlow.length;
          
          const approvedCount = expense.approvalFlow.filter(f => f.status === 'approved' && (f.required !== false || requiredApprovers.length === 0)).length;
          const currentPercentage = (approvedCount / totalRequired) * 100;
          const targetPercent = expense.minApprovalPercentage > 0 ? expense.minApprovalPercentage : 100;
          
          // VIP OR Logic Check
          let isVIPApproved = false;
          if (expense.specificApproverId) {
            const vipStep = expense.approvalFlow.find(f => f.approverId?.toString() === expense.specificApproverId?.toString());
            if (vipStep && vipStep.status === 'approved') {
              isVIPApproved = true;
            }
          }

          if (currentPercentage >= targetPercent || isVIPApproved) {
            expense.status = 'approved';
            expense.currentApproverId = null;
            expense.currentApproverIds = [];
          } else {
            // Still waiting for others in the pool
            // Remove current user from the 'waiting' array
            if (expense.currentApproverIds && expense.currentApproverIds.length > 0) {
              expense.currentApproverIds = expense.currentApproverIds.filter(id => id.toString() !== req.user._id.toString());
            }
            // If they were the last one and threshold not met? 
            // We keep it pending until either threshold met or specifically rejected/expired.
          }
        }
      }
    } else {
      // ─── 2. LEGACY ORPHANED LOGIC (Fallback) ───
      expense.status = action === 'approve' ? 'approved' : 'rejected';
      expense.currentApproverId = null;
      expense.currentApproverIds = [];
      
      // Backfill flow for history records
      expense.approvalFlow = [{
        step: 1,
        approverId: req.user._id,
        status: action === 'approve' ? 'approved' : 'rejected',
        comment: comment || `Action taken by ${req.user.role}`,
        actionDate: Date.now()
      }];
    }

    await expense.save();

    socketUtil.emitToCompany(req.user.companyId, 'expense_updated', {
      expenseId: expense._id,
      status: expense.status,
      updatedData: expense
    });
    socketUtil.emitToCompany(req.user.companyId, 'analytics_update', { action: 'approval' });

    res.status(200).json({
      success: true,
      message: `Expense ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      expense
    });
  } catch (error) {
    next(error);
  }
};
