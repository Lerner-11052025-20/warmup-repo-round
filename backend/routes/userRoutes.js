const express = require('express');
const router = express.Router();
const { createUser, getCompanyUsers, getManagers, getProfile, updateProfile } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// All routes require authentication
router.use(protect);

// Personal Profile Routes (All roles)
router.get('/profile', getProfile);
router.put('/profile', upload.single('profileImage'), updateProfile);

// Company Management Routes (Admin only)
router.use(authorize('admin'));

router.post('/', createUser);
router.get('/', getCompanyUsers);
router.get('/managers', getManagers);

module.exports = router;
