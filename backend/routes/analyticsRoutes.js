const express = require('express');
const router = express.Router();
const {
  getSummary,
  getCharts
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/summary', getSummary);
router.get('/charts', getCharts);

module.exports = router;
