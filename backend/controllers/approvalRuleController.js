const ApprovalRule = require('../models/ApprovalRule');

exports.getApprovalRules = async (req, res, next) => {
  try {
    const rules = await ApprovalRule.find({ companyId: req.user.companyId })
      .populate('targetEmployee', 'name email role')
      .populate('sequence.userId', 'name role email')
      .populate('vipApprover', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: rules.length, rules });
  } catch (error) {
    console.error('--- APPROVAL RULES FETCH ERROR ---');
    console.error(error);
    next(error);
  }
};

exports.createApprovalRule = async (req, res, next) => {
  try {
    const ruleData = { ...req.body, companyId: req.user.companyId };
    
    // Validate targeting logic if needed
    // In new schema, we allow many rules, targeting logic takes care of priority
    const rule = await ApprovalRule.create(ruleData);
    
    res.status(201).json({ success: true, rule });
  } catch (error) {
    console.error('[ERROR] createApprovalRule:', error);
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
