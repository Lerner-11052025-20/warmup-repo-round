const User = require('../models/User');
const Company = require('../models/Company');
const sendEmail = require('../utils/sendEmail');
const bcrypt = require('bcryptjs');

// Helper: Send JWT token in cookie + response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.generateToken();
  const cookieOptions = {
    expires: new Date(Date.now() + (parseInt(process.env.COOKIE_EXPIRE) || 7) * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  };

  res.status(statusCode).cookie('token', token, cookieOptions).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      avatar: user.avatar
    }
  });
};

// @desc    Signup — creates Company + Admin
// @route   POST /api/auth/signup
exports.signup = async (req, res, next) => {
  try {
    const { name, email, password, country, baseCurrency, currencySymbol, companyName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    // Create company
    const company = await Company.create({
      name: companyName || `${name}'s Company`,
      country,
      baseCurrency,
      currencySymbol: currencySymbol || ''
    });

    // Create admin user
    const user = await User.create({
      name, email, password,
      role: 'admin',
      companyId: company._id
    });

    company.createdBy = user._id;
    await company.save();

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password +tempPassword');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if temp password is being used
    if (user.tempPassword && user.tempPasswordExpire > Date.now()) {
      const isTempMatch = await bcrypt.compare(password, user.tempPassword);
      if (isTempMatch) {
        user.password = password;
        user.tempPassword = undefined;
        user.tempPasswordExpire = undefined;
        await user.save();
        return sendTokenResponse(user, 200, res);
      }
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Logout
// @route   POST /api/auth/logout
exports.logout = async (req, res, next) => {
  try {
    res.cookie('token', 'none', { expires: new Date(Date.now() + 5000), httpOnly: true });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('companyId', 'name country baseCurrency currencySymbol');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password — sends temp password via email
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email' });
    }

    const tempPassword = user.generateTempPassword();
    const salt = await bcrypt.genSalt(12);
    user.tempPassword = await bcrypt.hash(tempPassword, salt);
    user.tempPasswordExpire = Date.now() + 15 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const html = `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
        <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6,#a78bfa);padding:40px 32px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:28px">🔐 Password Reset</h1>
          <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:14px">SmartFlow Reimburse AI</p>
        </div>
        <div style="padding:32px">
          <p style="color:#374151;font-size:16px">Hi <strong>${user.name}</strong>,</p>
          <p style="color:#6b7280;font-size:14px">Here's your temporary password:</p>
          <div style="background:#f3f4f6;border:2px dashed #6366f1;border-radius:12px;padding:20px;text-align:center;margin:24px 0">
            <p style="margin:0 0 4px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:1px">Temporary Password</p>
            <p style="margin:0;color:#1f2937;font-size:24px;font-weight:700;letter-spacing:2px">${tempPassword}</p>
          </div>
          <div style="background:#fef3c7;border-radius:8px;padding:12px 16px;margin:16px 0">
            <p style="color:#92400e;font-size:13px;margin:0">⚠️ Expires in <strong>15 minutes</strong>. Login and change your password immediately.</p>
          </div>
        </div>
      </div>`;

    try {
      await sendEmail({ to: user.email, subject: 'SmartFlow Reimburse AI - Password Reset', html });
      res.status(200).json({ success: true, message: 'Temporary password sent to your email' });
    } catch (emailError) {
      user.tempPassword = undefined;
      user.tempPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, message: 'Email could not be sent' });
    }
  } catch (error) {
    next(error);
  }
};
