const ApprovalRule = require('../models/ApprovalRule');

exports.getApprovalRules = async (req, res, next) => {
  try {
    const rules = await ApprovalRule.find({ companyId: req.user.companyId })
      .populate('userId', 'name email role')
      .populate('approvers.approverId', 'name role email')
      .populate('specificApproverId', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: rules.length, rules });
  } catch (error) {
    next(error);
  }
};

exports.createApprovalRule = async (req, res, next) => {
  try {
    const ruleData = { ...req.body, companyId: req.user.companyId };
    
    // Check if rule for user exists, replace it
    if (ruleData.userId) {
      const existing = await ApprovalRule.findOne({ companyId: req.user.companyId, userId: ruleData.userId });
      if (existing) {
        return res.status(400).json({ message: 'A rule already exists for this user. Please update it instead.' });
      }
    }

    const rule = await ApprovalRule.create(ruleData);
    res.status(201).json({ success: true, rule });
  } catch (error) {
    next(error);
  }
};

exports.updateApprovalRule = async (req, res, next) => {
  try {
    let rule = await ApprovalRule.findOne({ _id: req.params.id, companyId: req.user.companyId });
    if (!rule) {
      return res.status(404).json({ message: 'Rule not found' });
    }

    rule = await ApprovalRule.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, rule });
  } catch (error) {
    next(error);
  }
};

exports.deleteApprovalRule = async (req, res, next) => {
  try {
    const rule = await ApprovalRule.findOneAndDelete({ _id: req.params.id, companyId: req.user.companyId });
    if (!rule) {
      return res.status(404).json({ message: 'Rule not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
