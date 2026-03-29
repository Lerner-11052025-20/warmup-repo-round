import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { userAPI } from '../services/api'
import DashboardLayout from '../layouts/DashboardLayout'
import CreateUserModal from '../components/CreateUserModal'
import EmployeeDashboard from '../components/EmployeeDashboard'
import {
  Users, UserPlus, Shield, User, Receipt, TrendingUp,
  Mail, Calendar, MoreVertical
} from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [companyUsers, setCompanyUsers] = useState([])
  const [stats, setStats] = useState({ total: 0, admins: 0, managers: 0, employees: 0 })
  const [loadingUsers, setLoadingUsers] = useState(false)

  const fetchUsers = useCallback(async () => {
    if (user?.role !== 'admin') return
    setLoadingUsers(true)
    try {
      const { data } = await userAPI.getUsers()
      setCompanyUsers(data.users)
      setStats(data.stats)
    } catch {
      // handled silently
    } finally {
      setLoadingUsers(false)
    }
  }, [user?.role])

  useEffect(() => {
    if (user?.role === 'admin') fetchUsers()
  }, [user?.role, fetchUsers])

  const handleUserCreated = () => {
    fetchUsers()
  }

  const renderContent = () => {
    if (user?.role === 'admin') {
      if (activeTab === 'users') return renderUserManagement()
      return renderAdminDashboard()
    }
    if (user?.role === 'manager') return renderManagerDashboard()
    return <EmployeeDashboard />
  }

  // ─── ADMIN DASHBOARD ───
  const renderAdminDashboard = () => (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-1">Welcome, {user?.name}! 👋</h1>
          <p className="text-white/80 text-sm">Here's your company overview</p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.total, icon: Users, color: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400', border: 'border-blue-100 dark:border-blue-900' },
          { label: 'Admins', value: stats.admins, icon: Shield, color: 'bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400', border: 'border-violet-100 dark:border-violet-900' },
          { label: 'Managers', value: stats.managers, icon: Users, color: 'bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400', border: 'border-cyan-100 dark:border-cyan-900' },
          { label: 'Employees', value: stats.employees, icon: User, color: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-900' }
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border ${stat.border} hover:shadow-lg transition-all duration-300`}
          >
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon size={20} />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setShowCreateModal(true)}
          className="p-5 rounded-2xl border-2 border-dashed border-primary-300 dark:border-primary-700 hover:border-primary-500 bg-primary-50/50 dark:bg-primary-950/20 text-left transition-all group"
        >
          <UserPlus className="w-8 h-8 text-primary-500 mb-2 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold text-slate-900 dark:text-white">Create New User</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Add a manager or employee to your company</p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setActiveTab('users')}
          className="p-5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-slate-400 bg-white dark:bg-slate-900 text-left transition-all group"
        >
          <Users className="w-8 h-8 text-slate-400 mb-2 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold text-slate-900 dark:text-white">Manage Users</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">View and manage all users in your company</p>
        </motion.button>
      </div>
    </div>
  )

  // ─── USER MANAGEMENT TAB ───
  const renderUserManagement = () => (
    <div className="space-y-6">
      {/* Header with create button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Company Users</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{stats.total} total members</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-primary-500/25 btn-glow"
        >
          <UserPlus size={18} /> Add User
        </motion.button>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {loadingUsers ? (
          <div className="p-8 space-y-3">
            {[1,2,3,4].map(i => <div key={i} className="h-14 skeleton rounded-xl" />)}
          </div>
        ) : companyUsers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">No users yet</p>
            <p className="text-slate-400 dark:text-slate-500 text-sm">Create your first team member</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Manager</th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody>
                {companyUsers.map((u, i) => (
                  <motion.tr
                    key={u._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${
                          u.role === 'admin' ? 'bg-gradient-to-br from-violet-500 to-purple-600' :
                          u.role === 'manager' ? 'bg-gradient-to-br from-blue-500 to-cyan-600' :
                          'bg-gradient-to-br from-emerald-500 to-teal-600'
                        }`}>
                          {u.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{u.name}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${
                        u.role === 'admin' ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300' :
                        u.role === 'manager' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' :
                        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {u.managerId ? u.managerId.name || '—' : '—'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )

  // ─── MANAGER DASHBOARD ───
  const renderManagerDashboard = () => (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-1">Welcome, {user?.name}! 👋</h1>
          <p className="text-white/80 text-sm">Manager Dashboard — Approval Center</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { icon: Receipt, title: 'Pending Approvals', desc: 'Review and approve team expenses', count: '0', color: 'text-amber-500' },
          { icon: Users, title: 'My Team', desc: 'View your team members', count: '0', color: 'text-blue-500' }
        ].map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <card.icon className={`w-8 h-8 ${card.color}`} />
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{card.count}</span>
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">{card.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{card.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
        <Receipt className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <h3 className="font-semibold text-slate-900 dark:text-white mb-1">No pending approvals</h3>
        <p className="text-sm text-slate-400">Expenses submitted by your team will appear here</p>
      </div>
    </div>
  )

  // ─── EMPLOYEE DASHBOARD ───
  // Moved to separate component: EmployeeDashboard.jsx

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
      {/* Create User Modal — Admin only */}
      {user?.role === 'admin' && (
        <CreateUserModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onUserCreated={handleUserCreated}
        />
      )}
    </DashboardLayout>
  )
}
