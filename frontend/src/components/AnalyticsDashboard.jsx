import React, { useState, useEffect, useMemo } from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, PieChart, Pie, Cell, 
  BarChart, Bar, Legend, LineChart, Line
} from 'recharts';
import { analyticsAPI } from '../services/api';
import { TrendingUp, PieChart as PieIcon, BarChart3, Calendar, Layers } from 'lucide-react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AnalyticsDashboard({ role }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
      {[1,2,3,4].map(i => <div key={i} className="h-[350px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm" />)}
    </div>
  );

  const { categoryData, trendData, statusData, dailyData, departmentData } = data || {};

  const ChartCard = ({ title, icon: Icon, children, className }) => (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 overflow-hidden ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-500">
          <Icon size={18} />
        </div>
        <h3 className="font-bold text-slate-800 dark:text-slate-100">{title}</h3>
      </div>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );

  // ─── Chart Definitions ───
  const RenderTrendChart = () => (
    <AreaChart data={trendData}>
      <defs>
        <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
      <Tooltip 
        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
        labelStyle={{ fontWeight: 'bold' }}
      />
      <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorTrend)" />
    </AreaChart>
  );

  const RenderCategoryChart = () => (
    <PieChart>
      <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
        {categoryData?.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
      </Pie>
      <Tooltip contentStyle={{ borderRadius: '12px' }} />
      <Legend iconType="circle" />
    </PieChart>
  );

  const RenderStatusChart = () => (
    <BarChart data={statusData}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
      <Tooltip contentStyle={{ borderRadius: '12px' }} />
      <Bar dataKey="count" fill="#ec4899" radius={[4, 4, 0, 0]} barSize={40} />
    </BarChart>
  );

  const RenderDailyChart = () => (
    <LineChart data={dailyData}>
       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
       <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
       <YAxis stroke="#94a3b8" fontSize={11} />
       <Tooltip contentStyle={{ borderRadius: '12px' }} />
       <Line type="stepAfter" dataKey="count" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
    </LineChart>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
       {/* ALWAYS SHOW: Expense Trend */}
       <ChartCard title="Monthly Expense Trend" icon={TrendingUp} className="md:col-span-2">
         <RenderTrendChart />
       </ChartCard>

       {/* ALWAYS SHOW: Category Breakdown */}
       <ChartCard title="Category Distribution" icon={PieIcon}>
         <RenderCategoryChart />
       </ChartCard>

       {/* CONDITIONAL: Role Based Visibility */}
       
       {/* EMPLOYEE Specific: Uses Trend + Category + maybe Daily/Status for a total of 3 */}
       {role === 'employee' && (
         <ChartCard title="Personal Submission Activity" icon={Layers}>
            <RenderStatusChart />
         </ChartCard>
       )}

       {/* MANAGER Specific: Trend + Category for a total of 2 (User requested 2) */}
       {/* Already rendered by Trend+Category */}

       {/* ADMIN Specific: Needs 5 total */}
       {role === 'admin' && (
        <>
           <ChartCard title="Request Status Overview" icon={BarChart3}>
             <RenderStatusChart />
           </ChartCard>
           <ChartCard title="New Requests (Last 7 Days)" icon={Calendar}>
             <RenderDailyChart />
           </ChartCard>
           <ChartCard title="Top Department Budgets" icon={Layers}>
             <BarChart data={departmentData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: '12px' }} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
             </BarChart>
           </ChartCard>
        </>
       )}
    </div>
  );
}
