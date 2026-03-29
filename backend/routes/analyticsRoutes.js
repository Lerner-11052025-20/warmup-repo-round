const express = require('express');
const router = express.Router();
const {
  getEmployeeAnalytics,
  getManagerAnalytics,
  getAdminAnalytics
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/employee', getEmployeeAnalytics);
router.get('/manager', authorize('manager'), getManagerAnalytics);
router.get('/admin', authorize('admin'), getAdminAnalytics);

module.exports = router;
