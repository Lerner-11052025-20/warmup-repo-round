import React, { useState, useEffect, useMemo } from 'react';
import { 
  History, Search, Filter, ChevronDown, ChevronUp, 
  CheckCircle2, Clock, XCircle, FileText, 
  DollarSign, Download, ArrowRight, User, Info, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const ExpenseHistory = ({ user }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [socket, setSocket] = useState(null);

  // Identify endpoint based on role
  const getEndpoint = () => {
    if (user.role === 'admin') return '/expenses/all';
    if (user.role === 'manager') return '/expenses/team';
    return '/expenses/my';
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}${getEndpoint()}`, { withCredentials: true });
      if (res.data.success) {
        setExpenses(res.data.expenses);
      }
    } catch (error) {
      toast.error('Failed to load history');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Socket Connection
  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket']
    });

    newSocket.on('connect', () => {
      console.log('Connected to socket');
      if (user?.companyId) {
        newSocket.emit('join_company', user.companyId);
      }
    });

    newSocket.on('expense_updated', (data) => {
      if (data.newExpense) {
        // If it's a new expense and applicable to current role view
        const isApplicable = (user.role === 'admin') || 
                            (user.role === 'employee' && data.updatedData.userId?._id === user._id);
        
        // Use user.role check to satisfy requirement "FOR MANAGERSS SIDEBAR: HISTORY NO REAL TIME DISPLACEMENT"
        if (isApplicable) {
          setExpenses(prev => [data.updatedData, ...prev]);
        }
      } else {
        setExpenses(prev => prev.map(e => e._id === data.expenseId ? { ...e, ...data.updatedData } : e));
      }
      toast.success('History update synced');
    });

    setSocket(newSocket);
    fetchHistory();

    return () => newSocket.close();
  }, [user]);

  // Filters & Search Logic
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const matchesSearch = 
        exp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || exp.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || exp.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [expenses, searchQuery, statusFilter, categoryFilter]);

  const getStatusRef = (status) => {
    switch (status) {
      case 'approved': return { color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20', icon: CheckCircle2, label: 'Approved' };
      case 'rejected': return { color: 'text-rose-600 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20', icon: XCircle, label: 'Rejected' };
      case 'pending': return { color: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20', icon: Clock, label: 'Pending' };
      default: return { color: 'text-slate-600 bg-slate-50 dark:bg-slate-500/10 border-slate-200 dark:border-slate-500/20', icon: FileText, label: 'Draft' };
    }
  };

  const categories = ['all', ...new Set(expenses.map(e => e.category))];

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
            <History size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Expense History</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Track and monitor all reimbursement requests</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search description or name..."
              className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 w-full md:w-64 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <select 
              className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm py-2 px-3 focus:ring-2 focus:ring-indigo-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="draft">Draft</option>
            </select>

            <select 
              className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm py-2 px-3 focus:ring-2 focus:ring-indigo-500 capitalize"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map(c => (
                <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="grid gap-4">
        <AnimatePresence mode='popLayout'>
          {loading ? (
            [1,2,3].map(i => (
              <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse" />
            ))
          ) : filteredExpenses.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <Info size={40} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No expenses found</h3>
              <p className="text-sm text-slate-500 max-w-xs">Adjust your filters or submit a new expense to see it here.</p>
            </motion.div>
          ) : (
            filteredExpenses.map((expense) => {
              const status = getStatusRef(expense.status);
              const isExpanded = expandedId === expense._id;

              return (
                <motion.div
                  key={expense._id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className={`bg-white dark:bg-slate-900 border overflow-hidden rounded-2xl transition-all duration-300
                    ${isExpanded ? 'border-indigo-500 shadow-lg ring-1 ring-indigo-500/20' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}
                >
                  {/* Summary Bar */}
                  <div 
                    className="p-4 flex items-center justify-between cursor-pointer group"
                    onClick={() => setExpandedId(isExpanded ? null : expense._id)}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <User className="text-slate-400" size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900 dark:text-white truncate">
                            {user.role !== 'employee' ? expense.userId?.name : expense.description}
                          </p>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1 font-medium italic"><Calendar size={12} /> {new Date(expense.expenseDate).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 rounded-md capitalize font-bold text-slate-600 dark:text-slate-400">{expense.category}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-900 dark:text-white">
                          {expense.currency} {expense.amount.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">TOTAL CLAIM</p>
                      </div>
                      <div className={`p-1.5 rounded-lg transition-colors ${isExpanded ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-slate-200'}`}>
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Timeline */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/50"
                      >
                        <div className="p-6">
                          <div className="flex flex-col md:flex-row gap-8">
                            {/* Detailed Info */}
                            <div className="flex-1 space-y-4">
                              <div>
                                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                  <FileText size={12} /> Transaction Details
                                </h4>
                                <p className="text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm leading-relaxed">
                                  {expense.description}
                                  {expense.remarks && <span className="block mt-2 pt-2 border-t border-slate-100 dark:border-slate-700 italic opacity-70">"{expense.remarks}"</span>}
                                </p>
                              </div>
                              {expense.receiptUrl && (
                                <button className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:underline">
                                  <Download size={14} /> Download Receipt Proof
                                </button>
                              )}
                            </div>

                            {/* Approval Timeline */}
                            <div className="md:w-72">
                              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Clock size={12} /> Approval Lifecycle
                              </h4>
                              <div className="space-y-4 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                                {/* Submission Step */}
                                <div className="relative pl-8">
                                  <div className="absolute left-0 top-1.5 w-[24px] h-[24px] rounded-full bg-emerald-500 border-4 border-white dark:border-slate-900 flex items-center justify-center text-white scale-75" />
                                  <p className="text-xs font-bold text-slate-900 dark:text-white">Expense Submitted</p>
                                  <p className="text-[10px] text-slate-400">{new Date(expense.createdAt).toLocaleString()}</p>
                                </div>

                                {/* Flow Steps */}
                                {expense.approvalFlow?.map((step, idx) => {
                                  let stepStatus = step.status;
                                  const IconComp = stepStatus === 'approved' ? CheckCircle2 : stepStatus === 'rejected' ? XCircle : Clock;
                                  const iconColor = stepStatus === 'approved' ? 'text-emerald-500' : stepStatus === 'rejected' ? 'text-rose-500' : 'text-amber-500';
                                  const bgColor = stepStatus === 'approved' ? 'bg-emerald-500' : stepStatus === 'rejected' ? 'bg-rose-500' : 'bg-slate-200 dark:bg-slate-700';

                                  return (
                                    <div key={idx} className="relative pl-8">
                                      <div className={`absolute left-0 top-1.5 w-[24px] h-[24px] rounded-full ${bgColor} border-4 border-white dark:border-slate-900 flex items-center justify-center text-white scale-75 shadow-sm`} />
                                      <div className="flex items-center gap-2">
                                        <p className="text-xs font-bold text-slate-900 dark:text-white">Step {step.step}: Approver</p>
                                        <span className={`text-[9px] font-black uppercase tracking-tighter ${iconColor}`}>{step.status}</span>
                                      </div>
                                      <p className="text-[10px] text-slate-500 font-medium">
                                        {step.approverId?.name || 'Assigned Officer'}
                                      </p>
                                      {step.comment && (
                                        <p className="text-[10px] mt-1 italic text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded inline-block">
                                          "{step.comment}"
                                        </p>
                                      )}
                                      {step.actedAt && (
                                        <p className="text-[9px] text-slate-400 mt-0.5">{new Date(step.actedAt).toLocaleTimeString()}</p>
                                      )}
                                    </div>
                                  );
                                })}

                                {/* Final Status */}
                                {expense.status !== 'pending' && (
                                  <div className="relative pl-8 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <div className={`absolute left-0 top-5.5 w-[24px] h-[24px] rounded-full ${expense.status === 'approved' ? 'bg-emerald-600' : 'bg-rose-600'} border-4 border-white dark:border-slate-900 flex items-center justify-center text-white scale-90 shadow-lg`} />
                                    <p className="text-xs font-black uppercase text-slate-900 dark:text-white flex items-center gap-2">
                                      {expense.status === 'approved' ? 'PASS COMPLETED' : 'CLAIM REJECTED'}
                                      <ArrowRight size={10} />
                                    </p>
                                    <p className="text-[10px] text-slate-400 leading-tight">System finalized decision on {new Date(expense.updatedAt).toLocaleDateString()}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ExpenseHistory;
