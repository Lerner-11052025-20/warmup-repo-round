import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { userAPI } from '../services/api'
import DashboardLayout from '../layouts/DashboardLayout'
import CreateUserModal from '../components/CreateUserModal'
import EmployeeDashboard from '../components/EmployeeDashboard'
import ManagerDashboard from '../components/ManagerDashboard'
import AdminApprovalRules from '../components/AdminApprovalRules'
import ExpenseHistory from '../components/ExpenseHistory'
import AnalyticsDashboard from '../components/AnalyticsDashboard'
import RoleDashboardSummary from '../components/RoleDashboardSummary'
import ProfilePage from './ProfilePage'
import {
  Users, UserPlus, Shield, User, Receipt, TrendingUp,
  Mail, Calendar, MoreVertical, History, LayoutDashboard
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
    // 1. Common Tab: History
    if (activeTab === 'history') return <ExpenseHistory user={user} />
    
    // 2. Tab: Analytics (All Roles) - Now dedicated for graphs
    if (activeTab === 'analytics') return <AnalyticsDashboard role={user?.role} />

    // 3. Tab: Profile
    if (activeTab === 'profile') return <ProfilePage hideNavbar={true} />

    // 4. Tab: Dashboard (Role-specific Summary)
    if (activeTab === 'dashboard') {
      return (
        <div className="space-y-10">
          <RoleDashboardSummary role={user?.role} />
          {['employee', 'manager'].includes(user?.role) && (
            <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-10">
               <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Create New Reimbursement</h3>
               <EmployeeDashboard hideHistory={true} /> 
            </div>
          )}
        </div>
      )
    }
    
    // 4. Admin Specific Tabs
    if (user?.role === 'admin') {
      if (activeTab === 'users') return renderUserManagement()
      if (activeTab === 'rules') return <AdminApprovalRules />
      if (activeTab === 'approvals') return <ManagerDashboard />
    }
    
    // 5. Manager Specific Tabs
    if (user?.role === 'manager') {
      if (activeTab === 'approvals') return <ManagerDashboard />
    }

    // Default Fallback
    return <RoleDashboardSummary role={user?.role} />
  }

  // ─── ADMIN SPECIFIC: USER MANAGEMENT TAB ───
  const renderUserManagement = () => (
    <div className="space-y-6">
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

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {loadingUsers ? (
          <div className="p-8 space-y-3">
            {[1,2,3,4].map(i => <div key={i} className="h-14 skeleton rounded-xl" />)}
          </div>
        ) : companyUsers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">No users yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody>
                {companyUsers.map((u, i) => (
                  <tr key={u._id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold ${
                          u.role === 'admin' ? 'bg-violet-500' : u.role === 'manager' ? 'bg-blue-500' : 'bg-emerald-500'
                        }`}>
                          {u.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{u.name}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="text-xs font-medium px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">{u.role}</span>
                    </td>
                    <td className="py-3.5 px-5 text-sm text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
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
