import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { approvalAPI } from '../services/api';
import toast from 'react-hot-toast';
import { 
  Search, CheckCircle2, XCircle, Clock, FileText, 
  ChevronRight, Check, X, Building, User, Calendar, Receipt
} from 'lucide-react';

export default function ManagerDashboard() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Table tools
  const [search, setSearch] = useState('');
  const [exchangeRates, setExchangeRates] = useState(null);
  
  // Selection & Actions
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [actionModal, setActionModal] = useState({ isOpen: false, type: null }); // 'approve' | 'reject'
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchApprovals();
    fetchExchangeRates();
  }, []);

  const fetchApprovals = async () => {
    try {
      const { data } = await approvalAPI.getPendingApprovals();
      setApprovals(data.expenses || []);
    } catch (error) {
      toast.error('Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  };

  const fetchExchangeRates = async () => {
    try {
      const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await res.json();
      setExchangeRates(data.rates);
    } catch (e) {
      console.error('Exchange rates blocked or failed', e);
    }
  };

  // Derived state
  const filteredApprovals = useMemo(() => {
    let result = [...approvals];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(a => 
        a.description.toLowerCase().includes(q) || 
        a.userId?.name.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [approvals, search]);

  const handleAction = async () => {
    if (!selectedExpense || !actionModal.type) return;
    setIsSubmitting(true);
    try {
      await approvalAPI.actionApproval({
        expenseId: selectedExpense._id,
        action: actionModal.type,
        comment
      });
      toast.success(actionModal.type === 'approve' ? 'Expense Approved!' : 'Expense Rejected');
      // Remove from list
      setApprovals(prev => prev.filter(a => a._id !== selectedExpense._id));
      setSelectedExpense(null);
      setActionModal({ isOpen: false, type: null });
      setComment('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process action');
    } finally {
      setIsSubmitting(false);
    }
  };

  const convertToCompanyCurrency = (amount, fromCurrency) => {
    const COMPANY_BASE = 'INR'; // Assuming Indian company as requested
    if (fromCurrency === COMPANY_BASE) return `₹ ${amount.toLocaleString()}`;
    
    if (exchangeRates && exchangeRates[fromCurrency] && exchangeRates[COMPANY_BASE]) {
      const inUsd = amount / exchangeRates[fromCurrency];
      const inBase = inUsd * exchangeRates[COMPANY_BASE];
      return `≈ ₹ ${Math.round(inBase).toLocaleString()}`;
    }
    return 'Converting...';
  };

  const getStatusColor = (status) => {
    if (status === 'approved') return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-400';
    if (status === 'rejected') return 'text-red-600 bg-red-100 dark:bg-red-900/40 dark:text-red-400';
    return 'text-amber-600 bg-amber-100 dark:bg-amber-900/40 dark:text-amber-400';
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 w-full max-w-7xl mx-auto items-start">
      
      {/* ─── LEFT: APPROVALS TABLE (65%) ─── */}
      <div className="w-full xl:w-[65%] space-y-4">
        
        {/* Header Map */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 size={24} className="text-emerald-500" /> Pending Approvals
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Review and action requested team expenses.</p>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by employee, description..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Table Area */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm relative min-h-[400px]">
          {loading ? (
            <div className="p-8 space-y-4">
              {[1,2,3,4].map(i => <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}
            </div>
          ) : filteredApprovals.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 mb-4 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                <Check size={40} className="text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">You're all caught up!</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                There are no pending approvals requiring your attention at this moment.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-50/90 dark:bg-slate-800/90 backdrop-blur-md z-10 shadow-sm">
                  <tr>
                    <th className="py-4 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Requested By</th>
                    <th className="py-4 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject & Category</th>
                    <th className="py-4 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount </th>
                    <th className="py-4 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredApprovals.map((item, i) => (
                      <motion.tr 
                        key={item._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        onClick={() => setSelectedExpense(item)}
                        className={`border-b last:border-0 border-slate-100 dark:border-slate-800/60 cursor-pointer transition-colors group
                          ${selectedExpense?._id === item._id 
                            ? 'bg-blue-50/50 dark:bg-blue-900/10' 
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'}`}
                      >
                        <td className="py-4 px-5 align-middle">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0 shadow-inner">
                              {item.userId?.name?.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">{item.userId?.name}</p>
                              <p className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-5 align-middle">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">{item.description}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs rounded-md">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-4 px-5 align-middle">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">
                            {item.amount.toLocaleString()} {item.currency}
                          </p>
                          {item.currency !== 'INR' && (
                            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                              {convertToCompanyCurrency(item.amount, item.currency)}
                            </p>
                          )}
                        </td>
                        <td className="py-4 px-5 align-middle text-right">
                          <ChevronRight className={`inline-block text-slate-300 ${selectedExpense?._id === item._id ? 'text-primary-500 rotate-90' : 'group-hover:text-primary-400 group-hover:translate-x-1'} transition-all`} />
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ─── RIGHT: DETAILS SIDE PANEL (35%) ─── */}
      <div className="w-full xl:w-[35%] space-y-4 xl:sticky xl:top-24">
        <AnimatePresence mode="wait">
          {!selectedExpense ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-10 flex flex-col items-center justify-center min-h-[500px] text-center"
            >
              <FileText size={48} className="text-slate-200 dark:text-slate-700 mb-4" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Select an Request</h3>
              <p className="text-sm text-slate-500 mt-2">Click on any pending item from the list to view its full details and take action.</p>
            </motion.div>
          ) : (
            <motion.div 
              key="detail-panel"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col max-h-[calc(100vh-120px)]"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shrink-0">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 rounded-md">
                      Needs Approval
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2 leading-tight">
                      {selectedExpense.description}
                    </h3>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {selectedExpense.amount.toLocaleString()} <span className="text-sm text-slate-500 font-medium">{selectedExpense.currency}</span>
                  </h3>
                </div>

                <div className="flex gap-2 w-full mt-4">
                  <button 
                    onClick={() => setActionModal({ isOpen: true, type: 'reject' })}
                    className="flex-1 py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-800/50 rounded-xl transition-colors flex justify-center items-center gap-2"
                  >
                    <X size={16} /> Reject
                  </button>
                  <button 
                    onClick={() => setActionModal({ isOpen: true, type: 'approve' })}
                    className="flex-1 py-2.5 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 rounded-xl transition-all active:scale-95 flex justify-center items-center gap-2"
                  >
                    <Check size={16} /> Approve
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                
                {/* Employee / Meta */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><User size={12}/> Employee</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{selectedExpense.userId?.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><Calendar size={12}/> Date</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{new Date(selectedExpense.expenseDate).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><Building size={12}/> Paid By</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white capitalize">{selectedExpense.paidBy}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><Receipt size={12}/> Category</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{selectedExpense.category}</p>
                  </div>
                </div>

                {/* Receipt Preview */}
                {selectedExpense.receiptUrl && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Receipt Document</p>
                    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                      {selectedExpense.receiptUrl.endsWith('.pdf') ? (
                        <div className="p-6 text-center">
                          <FileText size={40} className="mx-auto text-primary-500 mb-2" />
                          <a href={selectedExpense.receiptUrl} target="_blank" rel="noreferrer" className="text-sm font-bold text-primary-500 hover:underline">
                            View PDF Document
                          </a>
                        </div>
                      ) : (
                        <a href={selectedExpense.receiptUrl} target="_blank" rel="noreferrer" className="block relative group">
                          <img src={selectedExpense.receiptUrl} alt="Receipt" className="w-full object-contain max-h-48" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-white text-sm font-bold bg-black/50 px-3 py-1.5 rounded-lg">Click to Enlarge</span>
                          </div>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Remarks */}
                {selectedExpense.remarks && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">User Remarks</p>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-sm text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                      {selectedExpense.remarks}
                    </div>
                  </div>
                )}

                {/* Workflow Logs */}
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approval Workflow</p>
                  <div className="space-y-4">
                    {selectedExpense.approvalFlow?.map((step, idx) => (
                      <div key={idx} className="relative pl-6">
                        <div className="absolute left-1.5 top-2 bottom-[-20px] w-px bg-slate-200 dark:bg-slate-700 last:hidden" />
                        <div className={`absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 
                          ${step.status === 'pending' ? 'bg-amber-400' : step.status === 'approved' ? 'bg-emerald-500' : 'bg-red-500'}`} 
                        />
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Step {step.step}: {step.approverId?.name || 'Approver'}</p>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase mt-1 inline-block ${getStatusColor(step.status)}`}>
                          {step.status}
                        </span>
                        {step.comment && <p className="text-xs text-slate-500 mt-1 italic">"{step.comment}"</p>}
                        {step.actionDate && <p className="text-[10px] text-slate-400 mt-0.5">{new Date(step.actionDate).toLocaleString()}</p>}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── MODAL FOR ACTION CONFIRMATION ─── */}
      <AnimatePresence>
        {actionModal.isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setActionModal({ isOpen: false, type: null })}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl z-50 overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className={`p-5 text-white ${actionModal.type === 'approve' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  {actionModal.type === 'approve' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                  Confirm {actionModal.type === 'approve' ? 'Approval' : 'Rejection'}
                </h2>
              </div>
              <div className="p-6">
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                  You are about to <strong>{actionModal.type}</strong> this expense for {selectedExpense?.amount} {selectedExpense?.currency}.
                </p>
                
                <div className="space-y-2 mb-6">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Optional Comment</label>
                  <textarea 
                    value={comment} onChange={(e) => setComment(e.target.value)}
                    placeholder="E.g., Looks good, or Need a better receipt..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 outline-none resize-none"
                    rows="3"
                  />
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setActionModal({ isOpen: false, type: null })}
                    className="flex-1 py-2.5 rounded-xl font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAction}
                    disabled={isSubmitting}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-white transition-all active:scale-95 flex items-center justify-center
                      ${actionModal.type === 'approve' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/30' : 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30'}
                    `}
                  >
                    {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirm Action'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
