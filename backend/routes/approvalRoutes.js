const express = require('express');
const { getPendingApprovals, actionApproval } = require('../controllers/approvalController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Only managers and admins can access approval routes
router.use(protect);
router.use(authorize('manager', 'admin'));

router.get('/pending', getPendingApprovals);
router.post('/action', actionApproval);

module.exports = router;
