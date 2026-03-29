import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { approvalRuleAPI, userAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  Settings2, UserCheck, Shuffle, ShieldCheck, Plus, Trash2,
  ArrowRight, Save, User as UserIcon, ListOrdered, SlidersHorizontal, ArrowUp, ArrowDown, ChevronDown, CheckCircle2, XCircle, Clock,
  Send
} from 'lucide-react';

export default function AdminApprovalRules() {
  const [rules, setRules] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ─── Form State ───
  const [selectedRuleId, setSelectedRuleId] = useState(null);
  const [ruleName, setRuleName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [targetCategory, setTargetCategory] = useState('all');

  const [isManagerApprover, setIsManagerApprover] = useState(true);
  const [approverId, setApproverId] = useState('');

  const expenseCategories = ['all', 'Travel', 'Meals', 'Supplies', 'Marketing', 'Software', 'Other'];

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [{ data: rulesData }, { data: usersData }] = await Promise.all([
        approvalRuleAPI.getRules(),
        userAPI.getUsers()
      ]);
      setRules(rulesData.rules || []);
      setUsers(usersData.users || []);
    } catch (error) {
      // toast.error('Failed to load configuration data');
    } finally {
      setLoading(false);
    }
  };

  const loadRule = (rule) => {
    setSelectedRuleId(rule._id);
    setRuleName(rule.ruleName || '');
    setIsActive(rule.isActive ?? true);
    setTargetCategory(rule.targetCategory || 'all');
    setIsManagerApprover(rule.isManagerApprover ?? true);
    setApproverId(rule.approverId?._id || rule.approverId || '');
  };

  const resetForm = () => {
    setSelectedRuleId(null);
    setRuleName('');
    setIsActive(true);
    setTargetCategory('all');
    setIsManagerApprover(true);
    setApproverId('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!ruleName) return toast.error('Rule Name is required');

    setSaving(true);
    try {
      const payload = {
        ruleName,
        isActive,
        targetCategory,
        isManagerApprover,
        approverId: approverId || null
      };

      if (selectedRuleId) {
        await approvalRuleAPI.updateRule(selectedRuleId, payload);
        toast.success('Rule updated!');
      } else {
        await approvalRuleAPI.createRule(payload);
        toast.success('Rule created!');
      }

      fetchData();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this rule?')) return;
    try {
      await approvalRuleAPI.deleteRule(id);
      toast.success('Rule deleted');
      if (selectedRuleId === id) resetForm();
      fetchData();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="flex flex-col space-y-6 w-full max-w-[1200px] mx-auto pb-10 px-4">
      {/* ─── HEADER ─── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <Settings2 size={26} className="text-primary-500" /> Dynamic Approval Rules (Direct)
          </h2>
          <p className="text-sm text-slate-500">Configure where requests are directed for immediate action.</p>
        </div>
        <button onClick={resetForm} className="px-5 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold flex items-center gap-2">
          <Plus size={18} /> Create New Rule
        </button>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* ─── LEFT: FORM ─── */}
        <form onSubmit={handleSave} className="w-full xl:w-7/12 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-8 space-y-8">
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rule Identification</label>
                  <input 
                    type="text" value={ruleName} onChange={e => setRuleName(e.target.value)}
                    placeholder="e.g. Sales Team Approval"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Category</label>
                  <select 
                    value={targetCategory} onChange={e => setTargetCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none"
                  >
                    {expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-5">
                 <h4 className="text-xs font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                   <Send size={16} className="text-primary-500"/> Direct Approver Assignment
                 </h4>
                 
                 <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                    <input 
                      type="checkbox" checked={isManagerApprover} onChange={e => setIsManagerApprover(e.target.checked)} 
                      className="w-4 h-4 rounded-md border-slate-300 text-primary-600 focus:ring-primary-500"
                    />
                    <div className="flex-1">
                       <p className="text-xs font-bold">Assign to Direct Manager</p>
                       <p className="text-[10px] text-slate-500">The request will automatically go to the requester's assigned manager.</p>
                    </div>
                 </div>

                 {!isManagerApprover && (
                   <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Specific Officer</p>
                      <select 
                        value={approverId} onChange={e => setApproverId(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm"
                      >
                        <option value="">-- Choose Approver --</option>
                        {users.filter(u => u.role !== 'employee').map(u => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
                      </select>
                   </div>
                 )}
              </div>

            </div>
            
            <div className="p-6 bg-slate-50 dark:bg-slate-950/20 border-t border-slate-100 dark:border-slate-800">
               <button 
                  type="submit" disabled={saving}
                  className="w-full bg-primary-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
               >
                  {saving ? 'Saving...' : <><Save size={18}/> Save Approval Logic</>}
               </button>
            </div>
          </div>
        </form>

        {/* ─── RIGHT: LIST ─── */}
        <div className="w-full xl:w-5/12 space-y-6">
           <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex justify-between">
                Configured Rules <span className="text-primary-500">{rules.length}</span>
              </h3>
              <div className="space-y-3">
                {rules.map(r => (
                  <div key={r._id} onClick={() => loadRule(r)} className={`p-4 rounded-2xl border cursor-pointer group transition-all ${selectedRuleId === r._id ? 'border-primary-500 bg-primary-50/20' : 'border-slate-100 dark:border-slate-800'}`}>
                     <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-bold">{r.ruleName}</p>
                          <p className="text-[10px] font-black uppercase text-primary-500 tracking-tighter mt-1">
                            {r.targetCategory} • {r.isManagerApprover ? 'Direct Manager' : 'Specific Officer'}
                          </p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(r._id); }} className="p-1.5 opacity-0 group-hover:opacity-100 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={14}/></button>
                     </div>
                  </div>
                ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
