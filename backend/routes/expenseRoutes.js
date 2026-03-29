const express = require('express');
const { createExpense, getMyExpenses } = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all expense routes
router.use(protect);

router.post('/', createExpense);
router.get('/my', getMyExpenses);

module.exports = router;
