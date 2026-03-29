import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { approvalAPI } from '../services/api';
import { 
  CheckCircle2, XCircle, Clock, Search, Filter, 
  ChevronDown, ChevronUp, FileText, User, Receipt, 
  MessageSquare, History, ArrowRight, TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export default function ManagerDashboard() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [actioningId, setActioningId] = useState(null);
  const [comment, setComment] = useState('');

  const fetchPending = async () => {
    try {
      setLoading(true);
      const { data } = await approvalAPI.getPendingApprovals();
      setPending(data.expenses);
    } catch (error) {
       console.error('Failed to load pending approvals', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
    const socket = io(SOCKET_URL, { withCredentials: true });
    socket.on('expense_updated', fetchPending);
    return () => socket.disconnect();
  }, []);

  const handleAction = async (expenseId, action) => {
    if (!comment && action === 'reject') {
      toast.error('Comment is required for rejection');
      return;
    }

    setActioningId(expenseId);
    try {
      await approvalAPI.actionApproval({ expenseId, action, comment });
      toast.success(`Request ${action}ed`);
      setComment('');
      setExpandedId(null);
      fetchPending();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setActioningId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-amber-500">
            <Receipt size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Active Approvals Queue</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Review and action pending reimbursement requests.</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700">
          <TrendingUp size={16} className="text-primary-500" />
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{pending.length} Pending</span>
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />)
        ) : pending.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
             <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
               <CheckCircle2 size={32} className="text-slate-300" />
             </div>
             <h3 className="text-lg font-bold text-slate-900 dark:text-white">All caught up!</h3>
             <p className="text-sm text-slate-500 max-w-xs px-4">No pending requests require your attention at this moment.</p>
          </div>
        ) : (
          <AnimatePresence>
            {pending.map((exp) => (
              <motion.div 
                key={exp._id} layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                className={`bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden transition-all duration-300 shadow-sm 
                  ${expandedId === exp._id ? 'border-primary-500 shadow-xl' : 'border-slate-200 dark:border-slate-800'}`}
              >
                <div onClick={() => setExpandedId(expandedId === exp._id ? null : exp._id)} className="p-4 flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-primary-500">
                      {exp.userId?.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900 dark:text-white truncate">{exp.userId?.name}</p>
                        <span className="px-2 py-0.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{exp.category}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate max-w-sm italic">"{exp.description}"</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900 dark:text-white">₹{exp.amount.toLocaleString()}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 justify-end mt-0.5">
                        <Clock size={10} /> Pending
                      </p>
                    </div>
                    <div className={`p-1.5 rounded-lg ${expandedId === exp._id ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-slate-200'}`}>
                      {expandedId === exp._id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>
                </div>

                {expandedId === exp._id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20 p-6">
                    <div className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div>
                             <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><FileText size={12}/> Request Details</h4>
                             <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-sm">
                                <div className="grid grid-cols-2 gap-y-3">
                                   <div><p className="text-[10px] text-slate-400 font-bold uppercase">Date submitted</p><p className="font-semibold">{new Date(exp.createdAt).toLocaleDateString()}</p></div>
                                   <div><p className="text-[10px] text-slate-400 font-bold uppercase">Requester ID</p><p className="font-semibold truncate">#{exp.userId?._id?.toString().slice(-6)}</p></div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                                   <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">"{exp.description}"</p>
                                </div>
                             </div>
                           </div>

                           <div className="space-y-3">
                              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><MessageSquare size={12}/> Decision / Comments</h4>
                              <textarea 
                                placeholder="Add a reason for your decision..."
                                value={comment} onChange={e => setComment(e.target.value)}
                                className="w-full h-24 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-primary-500/50"
                              />
                              <div className="flex gap-3 pt-1">
                                 <button 
                                   onClick={() => handleAction(exp._id, 'reject')} disabled={actioningId}
                                   className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-red-500 font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
                                 >
                                   <XCircle size={18} /> Reject
                                 </button>
                                 <button 
                                   onClick={() => handleAction(exp._id, 'approve')} disabled={actioningId}
                                   className="flex-2 py-3 px-8 rounded-xl bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 hover:bg-emerald-600 transition-all"
                                 >
                                   <CheckCircle2 size={18} /> Approve
                                 </button>
                              </div>
                           </div>
                        </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
