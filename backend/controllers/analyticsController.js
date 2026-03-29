const Expense = require('../models/Expense');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Get Stats for Dashboards (KPI Cards + Recent Logs)
// @route   GET /api/analytics/summary
// @access  Private (All Roles)
exports.getSummary = async (req, res, next) => {
  try {
    const { role, companyId, _id: userId } = req.user;
    const companyIdObj = new mongoose.Types.ObjectId(companyId);

    let kpis = {};
    let logs = [];

    // ─── ADMIN: Full Company Summary ───
    if (role === 'admin') {
      const userStats = await User.aggregate([
        { $match: { companyId: companyIdObj } },
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]);

      const expenseStats = await Expense.aggregate([
        { $match: { companyId: companyIdObj } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]);

      kpis = {
        totalUsers: userStats.reduce((sum, s) => sum + s.count, 0),
        managers: userStats.find(s => s._id === 'manager')?.count || 0,
        employees: userStats.find(s => s._id === 'employee')?.count || 0,
        totalExpenses: expenseStats[0]?.total || 0,
        expenseCount: expenseStats[0]?.count || 0
      };

      logs = await Expense.find({ companyId: companyIdObj })
        .sort('-updatedAt')
        .limit(10)
        .populate('userId', 'name')
        .select('description status updatedAt amount');
    }

    // ─── MANAGER: Team Summary ───
    else if (role === 'manager') {
      const managedUsers = await User.find({ managerId: userId }).select('_id');
      const managedUserIds = managedUsers.map(u => u._id);

      const teamStats = await Expense.aggregate([
        { $match: { userId: { $in: managedUserIds }, status: { $ne: 'draft' } } },
        { $group: { _id: '$status', total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]);

      kpis = {
        teamSize: managedUserIds.length,
        pendingApprovals: teamStats.find(s => s._id === 'pending')?.count || 0,
        approvedTotal: teamStats.find(s => s._id === 'approved')?.total || 0,
        rejectedCount: teamStats.find(s => s._id === 'rejected')?.count || 0
      };

      logs = await Expense.find({ userId: { $in: managedUserIds }, status: { $ne: 'draft' } })
        .sort('-updatedAt')
        .limit(10)
        .populate('userId', 'name')
        .select('description status updatedAt amount');
    }

    // ─── EMPLOYEE: Personal Summary ───
    else {
      const personalStats = await Expense.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: '$status', total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]);

      kpis = {
        totalSpent: personalStats.filter(s => s._id === 'approved').reduce((sum, s) => sum + s.total, 0),
        pendingClaims: personalStats.find(s => s._id === 'pending')?.count || 0,
        drafts: personalStats.find(s => s._id === 'draft')?.count || 0,
        rejectedCount: personalStats.find(s => s._id === 'rejected')?.count || 0
      };

      logs = await Expense.find({ userId: userId })
        .sort('-updatedAt')
        .limit(10)
        .select('description status updatedAt amount');
    }

    res.status(200).json({ success: true, kpis, logs });

  } catch (error) {
    console.error('[ERROR] Analytics Summary:', error);
    next(error);
  }
};

// @desc    Get Charts for Analytics Page
// @route   GET /api/analytics/charts
// @access  Private (All Roles)
exports.getCharts = async (req, res, next) => {
  try {
    const { role, companyId, _id: userId } = req.user;
    const companyIdObj = new mongoose.Types.ObjectId(companyId);

    let matchQuery = { companyId: companyIdObj };
    if (role === 'employee') matchQuery.userId = new mongoose.Types.ObjectId(userId);
    if (role === 'manager') {
       const team = await User.find({ managerId: userId }).select('_id');
       matchQuery.userId = { $in: team.map(u => u._id) };
    }

    // ─── 1. Category Breakdown (Pie) ───
    const categoryData = await Expense.aggregate([
      { $match: { ...matchQuery, status: { $ne: 'draft' } } },
      { $group: { _id: '$category', value: { $sum: '$amount' } } },
      { $project: { name: '$_id', value: 1, _id: 0 } }
    ]);

    // ─── 2. Monthly Trend (Line/Area) ───
    const trendData = await Expense.aggregate([
      { $match: { ...matchQuery, status: { $ne: 'draft' } } },
      { $group: { 
        _id: { $dateToString: { format: '%Y-%m', date: '$expenseDate' } }, 
        amount: { $sum: '$amount' } 
      } },
      { $sort: { _id: 1 } },
      { $project: { name: '$_id', amount: 1, _id: 0 } }
    ]);

    // Role-specific additional charts
    let extraCharts = {};

    if (role === 'admin' || role === 'manager') {
       // ─── 3. Approval Stats (Bar) ───
       const statusData = await Expense.aggregate([
         { $match: matchQuery },
         { $group: { _id: '$status', count: { $sum: 1 } } },
         { $project: { name: '$_id', count: 1, _id: 0 } }
       ]);
       extraCharts.statusData = statusData;
    }

    if (role === 'admin') {
      // ─── 4. Department Spend ───
      // Simulating departments by categories if dept field not in User model
      extraCharts.departmentData = categoryData.slice(0, 5); 
      
      // ─── 5. Daily Activity ───
      const dailyData = await Expense.aggregate([
        { $match: { ...matchQuery, createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: { $dateToString: { format: '%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $project: { name: '$_id', count: 1, _id: 0 } }
      ]);
      extraCharts.dailyData = dailyData;
    }

    res.status(200).json({
      success: true,
      categoryData,
      trendData,
      ...extraCharts
    });

  } catch (error) {
    console.error('[ERROR] Analytics Charts:', error);
    next(error);
  }
};
