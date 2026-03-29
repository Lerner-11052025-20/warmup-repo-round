const express = require('express');
const router = express.Router();
const { createUser, getCompanyUsers, getManagers } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication + admin role
router.use(protect);
router.use(authorize('admin'));

router.post('/', createUser);
router.get('/', getCompanyUsers);
router.get('/managers', getManagers);

module.exports = router;
