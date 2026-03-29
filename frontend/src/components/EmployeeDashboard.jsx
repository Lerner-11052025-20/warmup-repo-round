import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { expenseAPI, uploadAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, Search, Filter, Paperclip, CheckCircle2, 
  Clock, XCircle, FileText, Upload, Trash2, ArrowRight, Receipt
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_FLOW = [
  { id: 'draft', label: 'Draft' },
  { id: 'pending', label: 'Waiting Approval' },
  { id: 'approved', label: 'Approved' }
];

export default function EmployeeDashboard({ hideHistory = false }) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Table filters & sort
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');

  // Form state
  const initialForm = {
    description: '',
    category: 'Travel',
    expenseDate: new Date().toISOString().split('T')[0],
    paidBy: 'self',
    currency: 'USD',
    amount: '',
    remarks: '',
    receiptUrl: ''
  };
  const [formData, setFormData] = useState(initialForm);
  const [selectedExpense, setSelectedExpense] = useState(null); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Load expenses
  useEffect(() => {
    if (!hideHistory) fetchExpenses();
  }, [hideHistory]);

  const fetchExpenses = async () => {
    try {
      const { data } = await expenseAPI.getMyExpenses();
      setExpenses(data.expenses);
    } catch (error) {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  // Derived state for table
  const filteredExpenses = useMemo(() => {
    let result = [...expenses];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(e => 
        e.description.toLowerCase().includes(q) || 
        e.category.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter(e => e.status === statusFilter);
    }
    
    result.sort((a, b) => {
      if (sortBy === 'date_desc') return new Date(b.expenseDate) - new Date(a.expenseDate);
      if (sortBy === 'date_asc') return new Date(a.expenseDate) - new Date(b.expenseDate);
      if (sortBy === 'amount_desc') return b.amount - a.amount;
      if (sortBy === 'amount_asc') return a.amount - b.amount;
      return 0;
    });

    return result;
  }, [expenses, search, statusFilter, sortBy]);

  // Handlers
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRowClick = (val) => {
    setSelectedExpense(val);
    setReceiptFile(null);
    setFormData({
      description: val.description,
      category: val.category,
      expenseDate: new Date(val.expenseDate).toISOString().split('T')[0],
      paidBy: val.paidBy,
      currency: val.currency || 'USD',
      amount: val.amount,
      remarks: val.remarks || '',
      receiptUrl: val.receiptUrl || ''
    });
  };

  const handleAddNew = () => {
    setSelectedExpense(null);
    setFormData(initialForm);
    setReceiptFile(null);
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => { setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) setReceiptFile(e.dataTransfer.files[0]);
  };
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) setReceiptFile(e.target.files[0]);
  };

  const handleSubmit = async (e, forceStatus) => {
    e.preventDefault();
    if (!formData.description || !formData.amount || !formData.expenseDate) {
      toast.error('Please fill required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalReceiptUrl = formData.receiptUrl;

      if (receiptFile) {
        toast.loading('Uploading receipt...', { id: 'upload_toast' });
        const { data: uploadData } = await uploadAPI.uploadReceipt(receiptFile);
        finalReceiptUrl = uploadData.url;
        toast.success('Receipt uploaded!', { id: 'upload_toast' });
      }

      const payload = {
        ...formData,
        receiptUrl: finalReceiptUrl,
        status: forceStatus || (selectedExpense ? selectedExpense.status : 'pending')
      };
      
      await expenseAPI.createExpense(payload);
      toast.success(forceStatus === 'draft' ? 'Saved as Draft' : 'Expense Submitted');
      if (!hideHistory) fetchExpenses();
      setFormData(initialForm);
      setSelectedExpense(null);
      setReceiptFile(null);
    } catch (error) {
      toast.dismiss('upload_toast');
      toast.error(error.response?.data?.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Status visual helpers
  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'approved': return <CheckCircle2 size={14} className="mr-1" />;
      case 'rejected': return <XCircle size={14} className="mr-1" />;
      case 'pending': return <Clock size={14} className="mr-1" />;
      default: return <FileText size={14} className="mr-1" />;
    }
  };

  const activeStatusIndex = selectedExpense 
    ? STATUS_FLOW.findIndex(s => s.id === selectedExpense.status)
    : 0;

  const isReadOnly = selectedExpense && selectedExpense.status !== 'draft';

  return (
    <div className={`flex flex-col ${hideHistory ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-6 w-full max-w-7xl mx-auto items-start`}>
      
      {/* ─── LEFT: EXPENSE TABLE (70%) ─── */}
      {!hideHistory && (
        <div className="w-full lg:w-[70%] space-y-4">
          
          {/* Top Progress / Action Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  <Receipt size={24} className="text-primary-500" /> Expense History
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage and track your reimbursement claims.</p>
              </div>
              
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddNew}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-primary-500/30 flex items-center gap-2 transition-colors w-full md:w-auto justify-center"
              >
                <Plus size={18} /> New Expense
              </motion.button>
            </div>

            {/* Tools: Search & Filter */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search by description or category..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 outline-none transition-all"
                />
              </div>
              <select 
                value={statusFilter} 
                onChange={e => setStatusFilter(e.target.value)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Table Area */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm relative min-h-[400px]">
            {loading ? (
              <div className="p-8 space-y-4">
                {[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}
              </div>
            ) : filteredExpenses.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                <FileText size={48} className="text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">No expenses found</h3>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800">
                    <tr>
                      <th className="py-4 px-5 text-xs font-semibold text-slate-500 tracking-wider">DATE</th>
                      <th className="py-4 px-5 text-xs font-semibold text-slate-500 tracking-wider">DESCRIPTION</th>
                      <th className="py-4 px-5 text-xs font-semibold text-slate-500 tracking-wider">AMOUNT</th>
                      <th className="py-4 px-5 text-xs font-semibold text-slate-500 tracking-wider">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExpenses.map((exp) => (
                      <tr 
                        key={exp._id}
                        onClick={() => handleRowClick(exp)}
                        className={`border-b border-slate-100 dark:border-slate-800 cursor-pointer transition-colors
                          ${selectedExpense?._id === exp._id ? 'bg-primary-50 dark:bg-primary-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}
                      >
                        <td className="py-4 px-5 text-sm text-slate-600 dark:text-slate-300">
                          {new Date(exp.expenseDate).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-5">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{exp.description}</p>
                          <p className="text-xs text-slate-500">{exp.category}</p>
                        </td>
                        <td className="py-4 px-5 text-sm font-bold text-slate-900 dark:text-white">
                          {exp.currency} {exp.amount.toLocaleString()}
                        </td>
                        <td className="py-4 px-5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase ${getStatusColor(exp.status)}`}>
                            {getStatusIcon(exp.status)} {exp.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── RIGHT: EXPENSE FORM (30% or Full) ─── */}
      <div className={`w-full ${hideHistory ? 'lg:w-full max-w-2xl mx-auto' : 'lg:w-[30%]'} space-y-4 lg:sticky lg:top-24`}>
        
        {/* Progress Flow visualization if editing */}
        <AnimatePresence mode="wait">
          {selectedExpense && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm overflow-hidden"
            >
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Flow Context</h3>
              <div className="space-y-4">
                {STATUS_FLOW.map((step, idx) => {
                  const isActive = idx === activeStatusIndex;
                  return (
                    <div key={step.id} className="flex gap-4 items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold
                        ${idx <= activeStatusIndex ? 'bg-primary-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                        {idx + 1}
                      </div>
                      <p className={`text-sm ${isActive ? 'font-bold text-primary-500' : 'text-slate-500'}`}>{step.label}</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              {selectedExpense ? 'Expense Details' : 'New Expense'}
            </h3>
            {selectedExpense && (
              <button onClick={handleAddNew} className="text-primary-500 text-sm font-semibold hover:underline">Clear</button>
            )}
          </div>

          <div className="p-5">
            <form id="expenseForm" onSubmit={(e) => handleSubmit(e, 'pending')} className="space-y-4">
              
              {/* Receipt Upload UI */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Receipt</label>
                {!isReadOnly ? (
                  <label 
                    onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors cursor-pointer
                      ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100'}`}
                  >
                    <input type="file" className="hidden" onChange={handleFileChange} />
                    <Upload size={20} className="text-primary-500 mb-2" />
                    <p className="text-xs font-semibold">{receiptFile ? receiptFile.name : 'Upload Receipt'}</p>
                  </label>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500">Receipt Locked</div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                <input 
                  type="text" name="description" required disabled={isReadOnly}
                  value={formData.description} onChange={handleFormChange}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
                  <select 
                    name="category" value={formData.category} onChange={handleFormChange} disabled={isReadOnly}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none"
                  >
                    <option>Travel</option><option>Meals</option><option>Supplies</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</label>
                  <input 
                    type="number" name="amount" required disabled={isReadOnly}
                    value={formData.amount} onChange={handleFormChange}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date</label>
                <input 
                  type="date" name="expenseDate" required disabled={isReadOnly}
                  value={formData.expenseDate} onChange={handleFormChange}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none"
                />
              </div>

            </form>
          </div>

          <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex gap-3">
             {(!selectedExpense || selectedExpense.status === 'draft') ? (
               <>
                 <button onClick={(e) => handleSubmit(e, 'draft')} disabled={isSubmitting} className="flex-1 py-2 rounded-xl font-bold bg-slate-100 text-slate-600">Draft</button>
                 <button type="submit" form="expenseForm" disabled={isSubmitting} className="flex-2 py-2 px-4 rounded-xl font-bold bg-primary-600 text-white">
                   {isSubmitting ? '...' : 'Submit'}
                 </button>
               </>
             ) : (
               <div className="w-full text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Read Only</div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
