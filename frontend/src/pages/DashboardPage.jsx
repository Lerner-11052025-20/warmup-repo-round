import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import ThemeToggle from '../components/ThemeToggle'
import { LogOut, Sparkles, Shield, Users, Receipt, Settings } from 'lucide-react'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const { theme } = useTheme()

  const roleConfig = {
    admin: { color: 'from-violet-500 to-purple-600', badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300', icon: Shield },
    manager: { color: 'from-blue-500 to-cyan-600', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', icon: Users },
    employee: { color: 'from-emerald-500 to-teal-600', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', icon: Receipt }
  }

  const config = roleConfig[user?.role] || roleConfig.employee
  const RoleIcon = config.icon

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-lg">SmartFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={logout}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800 font-medium text-sm flex items-center gap-2 transition-all"
            >
              <LogOut size={16} /> Logout
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Welcome Card */}
          <div className={`rounded-2xl bg-gradient-to-r ${config.color} p-8 mb-8 text-white relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-1/3 w-32 h-32 rounded-full bg-white/5" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <RoleIcon className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Welcome, {user?.name}! 👋</h1>
                  <p className="text-white/80 text-sm">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium capitalize">
                  {user?.role}
                </span>
                <span className="text-white/60 text-sm">•</span>
                <span className="text-white/80 text-sm">Authentication Successful ✅</span>
              </div>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'Role-Based Access', desc: `You are logged in as ${user?.role}. Access level permissions are active.`, color: 'text-violet-500' },
              { icon: Settings, title: 'System Ready', desc: 'Auth system fully operational. Expense management modules coming next.', color: 'text-blue-500' },
              { icon: Receipt, title: 'Coming Soon', desc: 'Expense submission, multi-level approvals, OCR scanning, and more.', color: 'text-emerald-500' }
            ].map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 transition-all duration-300"
              >
                <card.icon className={`w-8 h-8 ${card.color} mb-3`} />
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{card.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  )
}
