import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, PieChart, Pie, Cell,
  BarChart, Bar, Legend, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
import { analyticsAPI } from '../services/api';
import {
  TrendingUp, PieChart as PieIcon, BarChart3, Calendar,
  Layers, Wallet, Activity, Zap, CreditCard, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AnalyticsDashboard({ role }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { data } = await analyticsAPI.getCharts();
      setData(data);
    } catch (error) {
      console.error('Failed to load analytics charts', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const socket = io(SOCKET_URL, { withCredentials: true });
    socket.on('expense_updated', fetchAnalytics);
    return () => socket.disconnect();
  }, []);

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="h-[350px] bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl animate-pulse" />
      ))}
    </div>
  );

  const { categoryData, trendData, statusData, dailyData, departmentData, paymentData } = data || {};

  const ChartCard = ({ title, icon: Icon, children, className, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay }}
      className={`group relative overflow-hidden bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 transition-all hover:shadow-primary-500/10 hover:border-primary-500/30 ${className}`}
    >
      {/* 3D Background Effect */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-primary-500/5 rounded-full blur-3xl pointer-events-none transition-all group-hover:bg-primary-500/10" />

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/40 transform group-hover:rotate-6 transition-transform">
            <Icon size={20} />
          </div>
          <h3 className="font-black text-slate-800 dark:text-slate-100 tracking-tight uppercase text-sm">{title}</h3>
        </div>
        <Zap size={14} className="text-slate-300 dark:text-slate-700 animate-pulse" />
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </motion.div>
  );

  // ─── 3D BAR COMPONENT ───
  const Render3DBar = () => (
    <BarChart data={statusData}>
      <defs>
        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
          <stop offset="100%" stopColor="#6366f1" stopOpacity={0.8} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
      <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '1.5rem', border: 'none', background: '#ffffffcc', backdropFilter: 'blur(8px)', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
      <Bar dataKey="count" fill="url(#barGradient)" radius={[10, 10, 0, 0]} barSize={35} />
    </BarChart>
  );

  // ─── 3D AREA CHART ───
  const Render3DTrend = () => (
    <AreaChart data={trendData}>
      <defs>
        <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
          <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="5 5" stroke="#94a3b8" strokeOpacity={0.1} vertical={false} />
      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
      <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
      <Tooltip contentStyle={{ borderRadius: '1.5rem', border: 'none', background: '#0f172acc', color: '#fff', backdropFilter: 'blur(8px)' }} />
      <Area type="monotoneX" dataKey="amount" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#trendGradient)" />
    </AreaChart>
  );

  // ─── NEON PIE CHART ───
  const RenderNeonPie = ({ dataset }) => (
    <PieChart>
      <Tooltip contentStyle={{ borderRadius: '1.5rem' }} />
      <Pie
        data={dataset}
        cx="50%" cy="50%"
        innerRadius={65} outerRadius={85}
        paddingAngle={8}
        dataKey="value"
        stroke="none"
      >
        {dataset?.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} className="drop-shadow-lg" />)}
      </Pie>
    </PieChart>
  );

  return (
    <div className="space-y-8 pb-12">

      {/* Top Welcome Title - Light White Theme */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-black tracking-tight leading-none mb-2 text-slate-900 dark:text-white">DYNAMIC ANALYTICS</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-bold opacity-80">Real-time financial intelligence visualised in 3D Space.</p>
        </div>
        <div className="hidden md:flex gap-6 relative z-10">
          <div className="text-center">
            <p className="text-[10px] uppercase font-black tracking-widest text-primary-600 mb-1">Status</p>
            <div className="px-3 py-1 bg-primary-50 dark:bg-primary-500/10 rounded-lg border border-primary-200 dark:border-primary-500/30 text-xs font-bold text-primary-700 dark:text-primary-400">LIVE SYNC</div>
          </div>
          <div className="text-center">
            <p className="text-[10px] uppercase font-black tracking-widest text-emerald-600 mb-1">Engine</p>
            <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-200 dark:border-emerald-500/30 text-xs font-bold text-emerald-700 dark:text-emerald-400">MERN 3.0</div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 rounded-full blur-[120px] -mr-48 -mt-48" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

        {/* 1. Spending Trend (Wide) */}
        <ChartCard title="Capital Flow Trend" icon={TrendingUp} className="md:col-span-2" delay={0.1}>
          <Render3DTrend />
        </ChartCard>

        {/* 2. Category Breakdown */}
        <ChartCard title="Category Matrix" icon={PieIcon} delay={0.2}>
          <RenderNeonPie dataset={categoryData} />
        </ChartCard>

        {/* 3. Status Overview */}
        <ChartCard title="Lifecycle Pipeline" icon={ShieldCheck} delay={0.3}>
          <Render3DBar />
        </ChartCard>

        {/* 4. Daily Submissions */}
        <ChartCard title="Submission Velocity" icon={Activity} delay={0.4}>
          <LineChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: '1.5rem', border: 'none' }} />
            <Line type="basis" dataKey="count" stroke="#10b981" strokeWidth={4} dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} />
          </LineChart>
        </ChartCard>

        {/* 5. Payment Methods (Added for Employees too!) */}
        <ChartCard title="Funding Channels" icon={Wallet} delay={0.5}>
          <RenderNeonPie dataset={paymentData} />
        </ChartCard>

        {/* 6. Radar Profile (Special for Visual Depth) */}
        <ChartCard title="Profile Entropy" icon={Layers} delay={0.6}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={categoryData?.slice(0, 5)}>
            <PolarGrid stroke="#94a3b8" strokeOpacity={0.2} />
            <PolarAngleAxis dataKey="name" fontSize={9} />
            <Radar name="Spent" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
            <Tooltip />
          </RadarChart>
        </ChartCard>

        {/* Extra for Admin: Department Data */}
        {role === 'admin' && (
          <ChartCard title="Corporate Hierarchy Spends" icon={BarChart3} className="md:col-span-3" delay={0.7}>
            <BarChart data={departmentData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} />
              <Tooltip cursor={{ fill: 'transparent' }} />
              <Bar dataKey="value" fill="#6366f1" radius={[0, 15, 15, 0]} barSize={30} />
            </BarChart>
          </ChartCard>
        )}
      </div>

    </div>
  );
}
