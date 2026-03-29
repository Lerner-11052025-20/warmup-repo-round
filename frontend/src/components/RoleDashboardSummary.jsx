import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { analyticsAPI } from '../services/api';
import { 
  Users, UserCheck, UserPlus, CreditCard, 
  Clock, CheckCircle2, XCircle, TrendingUp,
  Activity, ArrowRight
} from 'lucide-react';

export default function RoleDashboardSummary({ role }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const { data } = await analyticsAPI.getSummary();
        setData(data);
      } catch (e) {
        console.error('Failed to fetch summary', e);
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, []);

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {[1,2,3,4].map(i => <div key={i} className="h-28 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800" />)}
    </div>
  );

  const kpis = data?.kpis || {};
  const logs = data?.logs || [];

  const adminKpis = [
    { label: 'Total Users', value: kpis.totalUsers, icon: Users, color: 'text-violet-500 bg-violet-50' },
    { label: 'Managers', value: kpis.managers, icon: UserCheck, color: 'text-blue-500 bg-blue-50' },
    { label: 'Employees', value: kpis.employees, icon: UserPlus, color: 'text-emerald-500 bg-emerald-50' },
    { label: 'Total Spend', value: `₹${kpis.totalExpenses?.toLocaleString()}`, icon: CreditCard, color: 'text-amber-500 bg-amber-50' }
  ];

  const managerKpis = [
    { label: 'Team Members', value: kpis.teamSize, icon: Users, color: 'text-blue-500 bg-blue-50' },
    { label: 'Pending Approvals', value: kpis.pendingApprovals, icon: Clock, color: 'text-amber-500 bg-amber-50' },
    { label: 'Team Spend', value: `₹${kpis.approvedTotal?.toLocaleString()}`, icon: CreditCard, color: 'text-emerald-500 bg-emerald-50' },
    { label: 'Rejections', value: kpis.rejectedCount, icon: XCircle, color: 'text-red-500 bg-red-50' }
  ];

  const employeeKpis = [
    { label: 'Total Reimbursed', value: `₹${kpis.totalSpent?.toLocaleString()}`, icon: CreditCard, color: 'text-emerald-500 bg-emerald-50' },
    { label: 'Pending Claims', value: kpis.pendingClaims, icon: Clock, color: 'text-amber-500 bg-amber-50' },
    { label: 'Active Drafts', value: kpis.drafts, icon: Activity, color: 'text-blue-500 bg-blue-50' },
    { label: 'Rejected', value: kpis.rejectedCount, icon: XCircle, color: 'text-red-500 bg-red-50' }
  ];

  const currentKpis = role === 'admin' ? adminKpis : role === 'manager' ? managerKpis : employeeKpis;

  return (
    <div className="space-y-8">
      {/* ─── KPI CARDS ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {currentKpis.map((kpi, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center ${kpi.color}`}>
              <kpi.icon size={20} />
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 capitalize">{kpi.label}</p>
            <h4 className="text-2xl font-bold text-slate-900 dark:text-white mt-1 leading-none">{kpi.value}</h4>
          </motion.div>
        ))}
      </div>

      {/* ─── RECENT ACTIVITY LOGS ─── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity size={18} className="text-primary-500" /> Recent Activity Logs
          </h3>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{role} VIEW</span>
        </div>
        
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {logs.length === 0 ? (
            <div className="p-10 text-center text-slate-400">No recent activity detected.</div>
          ) : logs.map((log, idx) => (
            <div key={idx} className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 
                ${log.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : log.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                {log.status === 'approved' ? <CheckCircle2 size={16} /> : log.status === 'rejected' ? <XCircle size={16} /> : <Clock size={16} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[70%]">
                    {role === 'admin' || role === 'manager' ? `${log.userId?.name}: ` : ''}{log.description}
                  </p>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">₹{log.amount?.toLocaleString()}</p>
                </div>
                <div className="flex justify-between items-center mt-0.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded
                    ${log.status === 'approved' ? 'bg-emerald-50 text-emerald-500' : log.status === 'rejected' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
                    {log.status}
                  </span>
                  <p className="text-[10px] text-slate-400">{new Date(log.updatedAt).toLocaleString()}</p>
                </div>
              </div>
              <ArrowRight size={14} className="text-slate-300 ml-2" />
            </div>
          ))}
        </div>

        {logs.length > 0 && (
          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 text-center">
             <button className="text-xs font-bold text-primary-500 hover:underline flex items-center gap-1 mx-auto group">
               View Full History <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
             </button>
          </div>
        )}
      </div>
    </div>
  );
}
