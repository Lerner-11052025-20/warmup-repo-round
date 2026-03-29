const User = require('../models/User');

// @desc    Create a new user (Employee or Manager)
// @route   POST /api/users
// @access  Admin only
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, managerId } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, password, and role' });
    }

    // Only allow manager or employee roles
    if (!['manager', 'employee'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be either "manager" or "employee"' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'A user with this email already exists' });
    }

    // If employee, managerId is required and must be a valid manager in same company
    if (role === 'employee') {
      if (!managerId) {
        return res.status(400).json({ success: false, message: 'Manager is required for Employee role' });
      }

      const manager = await User.findOne({
        _id: managerId,
        companyId: req.user.companyId,
        role: 'manager'
      });

      if (!manager) {
        return res.status(400).json({ success: false, message: 'Invalid manager. Must be a Manager in your company.' });
      }
    }

    // Create user — companyId is always the admin's company
    const user = await User.create({
      name,
      email,
      password,
      role,
      companyId: req.user.companyId,
      managerId: managerId || null,
      isManagerApprover: role === 'manager'
    });

    // Return user without password
    const userResponse = await User.findById(user._id).select('-password -tempPassword -resetPasswordToken');

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: userResponse
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users in admin's company
// @route   GET /api/users
// @access  Admin only
exports.getCompanyUsers = async (req, res, next) => {
  try {
    const users = await User.find({ companyId: req.user.companyId })
      .select('-password -tempPassword -resetPasswordToken')
      .populate('managerId', 'name email')
      .sort({ createdAt: -1 });

    // Count stats
    const stats = {
      total: users.length,
      admins: users.filter(u => u.role === 'admin').length,
      managers: users.filter(u => u.role === 'manager').length,
      employees: users.filter(u => u.role === 'employee').length
    };

    res.status(200).json({ success: true, stats, users });
  } catch (error) {
    next(error);
  }
};

// @desc    Get managers in admin's company (for dropdown)
// @route   GET /api/users/managers
// @access  Admin only
exports.getManagers = async (req, res, next) => {
  try {
    const managers = await User.find({
      companyId: req.user.companyId,
      role: 'manager'
    }).select('name email');

    res.status(200).json({ success: true, managers });
  } catch (error) {
    next(error);
  }
};
// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -tempPassword -resetPasswordToken')
      .populate('companyId', 'name')
      .populate('managerId', 'name email');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, bio } = req.body;
    let updateData = { name, phone, bio };

    // If file uploaded, update image URL
    if (req.file) {
      updateData.profileImage = req.file.path || req.file.secure_url;
    }

    // Filter out undefined fields
    Object.keys(updateData).forEach(key => 
      (updateData[key] === undefined || updateData[key] === '') && delete updateData[key]
    );

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password -tempPassword -resetPasswordToken')
     .populate('companyId', 'name');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};
