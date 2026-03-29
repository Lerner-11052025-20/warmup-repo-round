const express = require('express');
const { 
  getApprovalRules, 
  createApprovalRule, 
  updateApprovalRule, 
  deleteApprovalRule 
} = require('../controllers/approvalRuleController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin')); // Only admins can access approval rules

router.route('/')
  .get(getApprovalRules)
  .post(createApprovalRule);

router.route('/:id')
  .put(updateApprovalRule)
  .delete(deleteApprovalRule);

module.exports = router;
