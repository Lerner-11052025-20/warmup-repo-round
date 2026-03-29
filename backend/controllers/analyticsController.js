const Expense = require('../models/Expense');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Get analytics for current employee
// @route   GET /api/analytics/employee
exports.getEmployeeAnalytics = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);

    // 1. Monthly spending (Line/Area Chart)
    const monthlySpending = await Expense.aggregate([
      { $match: { userId, status: 'approved' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          amount: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', amount: 1, _id: 0 } }
    ]);

    // 2. Category distribution (Pie Chart)
    const categoryBreakdown = await Expense.aggregate([
      { $match: { userId, status: 'approved' } },
      {
        $group: {
          _id: '$category',
          amount: { $sum: '$amount' }
        }
      },
      { $project: { name: '$_id', value: '$amount', _id: 0 } }
    ]);

    // 3. Status breakdown (Stacked Bar)
    const statusCounts = await Expense.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      { $project: { status: '$_id', count: 1, _id: 0 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        monthlySpending,
        categoryBreakdown,
        statusCounts
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get analytics for manager's team
// @route   GET /api/analytics/manager
exports.getManagerAnalytics = async (req, res, next) => {
  try {
    const managerId = req.user._id;
    const teamEmployees = await User.find({ managerId }).select('_id');
    const teamIds = teamEmployees.map(u => u._id);

    // 1. Team spending trends (Line Chart)
    const teamTrends = await Expense.aggregate([
      { $match: { userId: { $in: teamIds }, status: 'approved' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          amount: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', amount: 1, _id: 0 } }
    ]);

    // 2. Portfolio by Team Member (Bar Chart)
    const teamMemberSpending = await Expense.aggregate([
      { $match: { userId: { $in: teamIds }, status: 'approved' } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: '$user.name',
          amount: { $sum: '$amount' }
        }
      },
      { $project: { name: '$_id', amount: 1, _id: 0 } }
    ]);

    // 3. Approval Stats (Pie)
    const approvalStats = await Expense.aggregate([
      { $match: { userId: { $in: teamIds } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      { $project: { name: '$_id', value: '$count', _id: 0 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        teamTrends,
        teamMemberSpending,
        approvalStats
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get company-wide analytics
// @route   GET /api/analytics/admin
exports.getAdminAnalytics = async (req, res, next) => {
  try {
    const companyId = new mongoose.Types.ObjectId(req.user.companyId);

    // 1. Total spending over time (Area Chart)
    const totalTrends = await Expense.aggregate([
      { $match: { companyId, status: 'approved' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          amount: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', amount: 1, _id: 0 } }
    ]);

    // 2. Overall Category distribution (Donut)
    const globalCategoryDistribution = await Expense.aggregate([
      { $match: { companyId, status: 'approved' } },
      {
        $group: {
          _id: '$category',
          amount: { $sum: '$amount' }
        }
      },
      { $project: { name: '$_id', value: '$amount', _id: 0 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalTrends,
        globalCategoryDistribution
      }
    });
  } catch (error) {
    next(error);
  }
};
