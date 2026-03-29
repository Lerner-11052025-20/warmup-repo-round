import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { analyticsAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import {
  TrendingUp, BarChart3, PieChart as PieIcon, Activity,
  Filter, Calendar, RefreshCw
} from 'lucide-react'

// ─── STYLES & THEME ───
const COLORS = {
  blue: ['#6366f1', '#818cf8', '#a5b4fc'],
  emerald: ['#10b981', '#34d399', '#6ee7b7'],
  violet: ['#8b5cf6', '#a78bfa', '#c4b5fd'],
  amber: ['#f59e0b', '#fbbf24', '#fcd34d'],
  rose: ['#f43f5e', '#fb7185', '#fda4af'],
  cyan: ['#06b6d4', '#22d3ee', '#67e8f9']
}

const NEON_COLORS = {
  blue: '#00f2ff',
  green: '#00ff9d',
  purple: '#bc13fe',
  pink: '#ff0055',
  yellow: '#fff01f'
}

// ─── CUSTOM COMPONENTS ───
const ChartCard = ({ title, icon: Icon, children, className = "" }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })
  const { darkMode } = useTheme()

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className={`relative overflow-hidden p-6 rounded-3xl border ${
        darkMode
          ? 'bg-slate-900/40 border-slate-800/50 backdrop-blur-xl shadow-2xl shadow-indigo-500/10'
          : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50'
      } ${className}`}
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${
            darkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
          }`}>
            <Icon size={18} />
          </div>
          <h3 className={`font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
        </div>
      </div>
      <div className="h-[300px] w-full">
        {inView ? children : <div className="h-full w-full flex items-center justify-center">Loading...</div>}
      </div>
    </motion.div>
  )
}

const CustomTooltip = ({ active, payload, label, darkMode, currency = "$" }) => {
  if (active && payload && payload.length) {
    return (
      <div className={`p-4 rounded-xl shadow-2xl border ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
      }`}>
        <p className={`text-xs font-bold mb-1 uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
        <p className="text-lg font-black bg-gradient-to-r from-primary-500 to-indigo-500 bg-clip-text text-transparent">
          {currency}{payload[0].value.toLocaleString()}
        </p>
      </div>
    )
  }
  return null
}

import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

// ─── MAIN COMPONENT ───
export default function AnalyticsDashboard() {
  const { user } = useAuth()
  const { darkMode } = useTheme()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [timeRange, setTimeRange] = useState('all')

  const fetchAnalytics = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true)
      let res
      if (user.role === 'admin') res = await analyticsAPI.getAdminAnalytics()
      else if (user.role === 'manager') res = await analyticsAPI.getManagerAnalytics()
      else res = await analyticsAPI.getEmployeeAnalytics()

      if (res.data.success) setData(res.data.data)
    } catch (err) {
      console.error('Failed to fetch analytics', err)
    } finally {
      if (!isSilent) setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()

    // Socket for real-time analytics updates
    const socket = io(SOCKET_URL, { withCredentials: true })
    
    socket.on('connect', () => {
      if (user?.companyId) socket.emit('join_company', user.companyId)
    })

    socket.on('analytics_update', () => {
      console.log('Real-time analytics update received')
      fetchAnalytics(true) // Silent reload to avoid UI flicker
    })

    return () => {
      socket.disconnect()
    }
  }, [user.role, user.companyId])

  if (loading) return (
    <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
      <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
      <p className="text-slate-500 font-medium">Crunching the numbers...</p>
    </div>
  )

  if (!data) return (
    <div className="p-12 text-center">
      <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
        <Activity className="w-10 h-10 text-slate-400" />
      </div>
      <h3 className="text-xl font-bold dark:text-white mb-2">No analytics data available</h3>
      <p className="text-slate-500 dark:text-slate-400">Submit some expenses to see trends and insights.</p>
    </div>
  )

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 dark:bg-slate-900/50 p-6 rounded-3xl backdrop-blur-md border border-white/20 dark:border-slate-800/20">
        <div>
          <h2 className="text-2xl font-black dark:text-white flex items-center gap-3">
            <TrendingUp className="text-primary-500" /> Real-time Analytics
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Insights and metrics for your business</p>
        </div>
        <div className="flex items-center gap-2">
          {['7D', '1M', '1Y', 'All'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range.toLowerCase())}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                timeRange === range.toLowerCase()
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trend Chart (Line/Area) */}
        <ChartCard title="Spending Trends" icon={TrendingUp} className="lg:col-span-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.totalTrends || data.monthlySpending || data.teamTrends}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={darkMode ? NEON_COLORS.blue : COLORS.blue[0]} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={darkMode ? NEON_COLORS.blue : COLORS.blue[0]} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 11, fontWeight: 'bold' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 11 }}
              />
              <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
              <Area
                type="monotone"
                dataKey="amount"
                stroke={darkMode ? NEON_COLORS.blue : COLORS.blue[0]}
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#colorValue)"
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Category breakdown (Pie) */}
        <ChartCard title="Category Distribution" icon={PieIcon}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.categoryBreakdown || data.globalCategoryDistribution || data.approvalStats}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={8}
                dataKey="value"
                animationBegin={200}
                animationDuration={1500}
              >
                {Object.values(COLORS).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={darkMode ? Object.values(NEON_COLORS)[index % 5] : entry[0]} stroke="none" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', paddingTop: '20px' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Status/Team breakdown (Bar) */}
        <ChartCard title={user.role === 'manager' ? "Team Performance" : "Approval Lifecycle"} icon={BarChart3}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.teamMemberSpending || data.statusCounts || data.categoryBreakdown}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 11, fontWeight: 'bold' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: darkMode ? '#94a3b8' : '#64748b', fontSize: 11 }}
              />
              <Tooltip content={<CustomTooltip darkMode={darkMode} />} />
              <Bar
                dataKey={user.role === 'employee' ? 'count' : 'amount'}
                radius={[12, 12, 0, 0]}
                animationDuration={1800}
              >
                {data.statusCounts?.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.status === 'approved' ? COLORS.emerald[0] : entry.status === 'rejected' ? COLORS.rose[0] : COLORS.amber[0]}
                  />
                )) || <Cell fill={darkMode ? NEON_COLORS.purple : COLORS.violet[0]} />}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Mini Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Volume', value: '$12,450', change: '+12%', icon: TrendingUp, color: 'text-indigo-500' },
          { label: 'Pending Audit', value: '45', change: '-5', icon: Activity, color: 'text-amber-500' },
          { label: 'Avg. Decision', value: '1.2 Days', change: 'Optimized', icon: Calendar, color: 'text-emerald-500' },
          { label: 'Reject Rate', value: '8.4%', change: 'Low', icon: BarChart3, color: 'text-rose-500' }
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`p-6 rounded-3xl border ${
              darkMode ? 'bg-slate-900/60 border-slate-800 shadow-2xl' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/40'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <stat.icon size={20} className={stat.color} />
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                stat.change.startsWith('+') ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
              }`}>
                {stat.change}
              </span>
            </div>
            <p className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{stat.value}</p>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wide uppercase">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
