import React, { useState, useEffect, Suspense, lazy } from 'react';
import { analyticsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  TrendingUp, PieChart as PieIcon, BarChart3, 
  Layers, Wallet, Activity, Zap, ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';
import ChartBase from './charts/ChartBase';

// ─── LAZY LOADING CHARTS ───
const LineExpenseChart = lazy(() => import('./charts/LineExpenseChart'));
const BarCategoryChart = lazy(() => import('./charts/BarCategoryChart'));
const PieDistributionChart = lazy(() => import('./charts/PieDistributionChart'));
const StackedApprovalChart = lazy(() => import('./charts/StackedApprovalChart'));

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const StatTag = ({ label, value, color }) => (
  <div className="flex flex-col">
    <p className={`text-[10px] uppercase font-bold tracking-widest ${color} mb-1 opacity-70`}>{label}</p>
    <div className={`px-3 py-1 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 text-xs font-bold ${color.replace('text-', 'text-opacity-90 text-')} shadow-sm`}>
      {value}
    </div>
  </div>
);

export default function AnalyticsDashboard({ role }) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Currency derived from user context
  const baseCurrency = user?.companyId?.baseCurrency || 'USD';
  const currencySymbol = user?.companyId?.currencySymbol || '$';

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

  const { categoryData, trendData, statusData, dailyData, departmentData, paymentData } = data || {};

  // Transforming status data for stacked bar (mocking statuses if needed for visual verification)
  const stackedStatusData = [
    { name: 'Jan', Approved: 4000, Pending: 2400, Rejected: 400 },
    { name: 'Feb', Approved: 3000, Pending: 1398, Rejected: 210 },
    { name: 'Mar', Approved: 2000, Pending: 9800, Rejected: 229 },
    { name: 'Apr', Approved: 2780, Pending: 3908, Rejected: 200 },
  ];

  return (
    <div className="space-y-8 pb-16 font-sans">

      {/* ─── ENHANCED ANALYTICS HEADER ─── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
             <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
                <Activity size={20} />
             </div>
             <h2 className="text-[10px] font-black uppercase tracking-[3px] text-primary-600">SmartFlow Vision</h2>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">Financial Intelligence</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1 max-w-md">Comprehensive telemetry for organizational spend and reimbursement efficiency.</p>
        </div>
        
        <div className="mt-8 lg:mt-0 flex gap-6 relative z-10 border-t lg:border-t-0 lg:border-l border-slate-50 dark:border-slate-800 pt-6 lg:pt-0 lg:pl-8">
          <StatTag label="Telemetry Status" value="Live Sync" color="text-emerald-600" />
          <StatTag label="Data Engine" value="V2.0 Core" color="text-primary-600" />
          <StatTag label="Reporting" value={`Monthly (${baseCurrency})`} color="text-indigo-600" />
        </div>
        
        {/* Subtle Background Pattern */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/5 rounded-full blur-[100px] -mr-40 -mt-40 transition-transform duration-[5s] group-hover:scale-120" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

        {/* 1. Spending Trend over Time */}
        <ChartBase title="Expenditure Trajectory" icon={TrendingUp} className="md:col-span-2" delay={0.1} isLoading={loading}>
           <Suspense fallback={<div className="w-full h-full bg-slate-50 rounded-2xl animate-pulse" />}>
              <LineExpenseChart data={trendData} baseCurrency={baseCurrency} currencySymbol={currencySymbol} />
           </Suspense>
        </ChartBase>

        {/* 2. Category Matrix Distributions */}
        <ChartBase title="Distribution Matrix" icon={PieIcon} delay={0.2} isLoading={loading}>
          <Suspense fallback={<div className="w-full h-full bg-slate-50 rounded-2xl animate-pulse" />}>
            <PieDistributionChart data={categoryData} baseCurrency={baseCurrency} currencySymbol={currencySymbol} />
          </Suspense>
        </ChartBase>

        {/* 3. Lifecycle Status Stacked */}
        <ChartBase title="Approval Lifecycle" icon={ShieldCheck} delay={0.3} isLoading={loading}>
          <Suspense fallback={<div className="w-full h-full bg-slate-50 rounded-2xl animate-pulse" />}>
            <StackedApprovalChart data={stackedStatusData} baseCurrency={baseCurrency} currencySymbol={currencySymbol} />
          </Suspense>
        </ChartBase>

        {/* 4. Submission Velocity */}
        <ChartBase title="Submission Velocity" icon={Activity} delay={0.4} isLoading={loading}>
           <Suspense fallback={<div className="w-full h-full bg-slate-50 rounded-2xl animate-pulse" />}>
              <LineExpenseChart data={dailyData} baseCurrency={baseCurrency} currencySymbol={currencySymbol} dataKey="count" yAxisLabel="Submissions" />
           </Suspense>
        </ChartBase>

        {/* 5. Capital Inflow Channels */}
        <ChartBase title="Payment Channels" icon={Wallet} delay={0.5} isLoading={loading}>
          <Suspense fallback={<div className="w-full h-full bg-slate-50 rounded-2xl animate-pulse" />}>
            <PieDistributionChart data={paymentData} baseCurrency={baseCurrency} currencySymbol={currencySymbol} />
          </Suspense>
        </ChartBase>

        {/* 6. Sector Analysis Bar */}
        <ChartBase title="Departmental Spends" icon={BarChart3} delay={0.6} isLoading={loading}>
           <Suspense fallback={<div className="w-full h-full bg-slate-50 rounded-2xl animate-pulse" />}>
              <BarCategoryChart data={departmentData || categoryData} baseCurrency={baseCurrency} currencySymbol={currencySymbol} />
           </Suspense>
        </ChartBase>

      </div>

    </div>
  );
}
