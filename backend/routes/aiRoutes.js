const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getAIChatResponse } = require('../controllers/aiController');

// All AI routes are protected by authentication logic
router.post('/chat', protect, getAIChatResponse);

module.exports = router;
