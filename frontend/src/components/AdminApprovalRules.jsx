import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { approvalRuleAPI, userAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  Settings2, UserCheck, Shuffle, ShieldCheck, Plus, Trash2,
  ArrowRight, Save, User as UserIcon, ListOrdered, SlidersHorizontal, ArrowUp, ArrowDown, ChevronDown, CheckCircle2, XCircle, Clock
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
  const [targetEmployeeIds, setTargetEmployeeIds] = useState([]);
  const [targetCategory, setTargetCategory] = useState('all');

  const [isManagerApprover, setIsManagerApprover] = useState(true);
  const [approvers, setApprovers] = useState([]); 
  const [approvalType, setApprovalType] = useState('sequential');
  const [minApprovalPercentage, setMinApprovalPercentage] = useState(100);
  const [specificApproverId, setSpecificApproverId] = useState('');

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
      toast.error('Failed to load configuration data');
    } finally {
      setLoading(false);
    }
  };

  const loadRule = (rule) => {
    setSelectedRuleId(rule._id);
    setRuleName(rule.ruleName || '');
    setIsActive(rule.isActive ?? true);
    setTargetEmployeeIds(rule.targetEmployeeIds?.map(u => u._id || u) || []);
    setTargetCategory(rule.targetCategory || 'all');
    setIsManagerApprover(rule.isManagerApprover ?? true);
    setApprovers(rule.approvers?.map(a => ({
      approverId: a.approverId?._id || a.approverId,
      step: a.step,
      isRequired: a.isRequired ?? true
    })) || []);
    setApprovalType(rule.approvalType || 'sequential');
    setMinApprovalPercentage(rule.minApprovalPercentage ?? 100);
    setSpecificApproverId(rule.specificApproverId?._id || rule.specificApproverId || '');
  };

  const resetForm = () => {
    setSelectedRuleId(null);
    setRuleName('');
    setIsActive(true);
    setTargetEmployeeIds([]);
    setTargetCategory('all');
    setIsManagerApprover(true);
    setApprovers([]);
    setApprovalType('sequential');
    setMinApprovalPercentage(100);
    setSpecificApproverId('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!ruleName) return toast.error('Rule Name is required');

    setSaving(true);
    try {
      const payload = {
        ruleName,
        isActive,
        targetEmployeeIds,
        targetCategory,
        isManagerApprover,
        approvers: approvers.map((a, idx) => ({ 
          ...a, step: approvalType === 'sequential' ? idx + 1 : 1 
        })),
        approvalType,
        minApprovalPercentage,
        specificApproverId: specificApproverId || null
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

  // ─── Approver Helpers ───
  const addApprover = (uId) => {
    if (!uId) return;
    if (approvers.some(a => a.approverId === uId)) return toast.error('Already added');
    setApprovers(prev => [...prev, { approverId: uId, step: prev.length + 1, isRequired: true }]);
  };

  // ─── Target Helpers ───
  const addTargetUser = (uId) => {
    if (!uId || targetEmployeeIds.includes(uId)) return;
    setTargetEmployeeIds(prev => [...prev, uId]);
  };

  return (
    <div className="flex flex-col space-y-6 w-full max-w-[1400px] mx-auto pb-10 px-4">
      {/* ─── HEADER ─── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <Settings2 size={26} className="text-primary-500" /> Approval Rules Engine Pro
          </h2>
          <p className="text-sm text-slate-500">Define multi-step sequences with percentage logic and VIP overrides.</p>
        </div>
        <button onClick={resetForm} className="px-5 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold flex items-center gap-2">
          <Plus size={18} /> Create New Rule
        </button>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* ─── LEFT: FORM ─── */}
        <form onSubmit={handleSave} className="w-full xl:w-8/12 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-8 space-y-8">
              {/* Section 1: Identity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rule Name</label>
                  <input 
                    type="text" value={ruleName} onChange={e => setRuleName(e.target.value)}
                    placeholder="e.g. Sales Team Sequential Flow"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category Scope</label>
                  <select 
                    value={targetCategory} onChange={e => setTargetCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none"
                  >
                    {expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Section 2: Flow Type */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'sequential', label: 'Sequential', desc: 'Linear (1 → 2 → 3)', icon: ListOrdered },
                  { id: 'parallel', label: 'Parallel', desc: 'Simultaneous (1 & 2 & 3)', icon: Shuffle },
                  { id: 'hybrid', label: 'Hybrid', desc: 'Group with VIP Override', icon: ShieldCheck }
                ].map(type => (
                  <button 
                    key={type.id} type="button" 
                    onClick={() => setApprovalType(type.id)}
                    className={`p-4 rounded-2xl border text-left transition-all ${approvalType === type.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'border-slate-100 dark:border-slate-800'}`}
                  >
                    <type.icon size={20} className={approvalType === type.id ? 'text-primary-500' : 'text-slate-400'} />
                    <p className="font-bold text-sm mt-2">{type.label}</p>
                    <p className="text-[10px] text-slate-500">{type.desc}</p>
                  </button>
                ))}
              </div>

              {/* Section 3: Approvers */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Approval Sequence</label>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={isManagerApprover} onChange={e => setIsManagerApprover(e.target.checked)} />
                    Always Include Manager
                  </label>
                </div>

                <div className="space-y-2 min-h-[50px]">
                  {approvers.map((app, idx) => {
                    const u = users.find(usr => usr._id === app.approverId);
                    return (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="w-5 h-5 flex items-center justify-center bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded text-[10px] font-bold">
                          {approvalType === 'sequential' ? (isManagerApprover ? idx + 2 : idx + 1) : 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-xs font-bold">{u?.name || 'User'}</p>
                          <p className="text-[10px] text-slate-500">{u?.role}</p>
                        </div>
                        <button type="button" onClick={() => setApprovers(prev => prev.filter((_, i) => i !== idx))}><Trash2 size={14} className="text-red-400"/></button>
                      </div>
                    )
                  })}
                </div>

                <div className="flex gap-2">
                  <select id="user-sel" className="flex-1 px-4 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl">
                    <option value="">-- Add Officer --</option>
                    {users.filter(u => u.role !== 'employee').map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                  </select>
                  <button type="button" onClick={() => { addApprover(document.getElementById('user-sel').value); document.getElementById('user-sel').value = ''; }} className="bg-slate-800 text-white px-4 rounded-xl text-xs font-bold">+</button>
                </div>
              </div>

              {/* Section 4: VIP Override */}
              <div className="p-4 bg-violet-50 dark:bg-violet-900/10 rounded-2xl border border-violet-100 dark:border-violet-800/50 space-y-3">
                 <div className="flex items-center gap-2"><ShieldCheck size={18} className="text-violet-500"/><h4 className="text-xs font-bold text-violet-700 dark:text-violet-300">VIP / CFO Override</h4></div>
                 <select 
                    value={specificApproverId} onChange={e => setSpecificApproverId(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-violet-200 dark:border-violet-800 rounded-xl p-2.5 text-xs"
                 >
                    <option value="">None (Standard Flow)</option>
                    {users.filter(u => u.role !== 'employee').map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                 </select>
                 <p className="text-[10px] text-violet-600/70">If this specific person approves, the entire claim is auto-finalized instantly.</p>
              </div>

            </div>
            
            <div className="p-6 bg-slate-50 dark:bg-slate-950/20 border-t border-slate-100 dark:border-slate-800">
               <button 
                  type="submit" disabled={saving}
                  className="w-full bg-primary-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
               >
                  {saving ? 'Saving...' : <><Save size={18}/> Commit Approval Rule</>}
               </button>
            </div>
          </div>
        </form>

        {/* ─── RIGHT: LIST ─── */}
        <div className="w-full xl:w-4/12 space-y-6">
           <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex justify-between">
                Active Rules Registry <span className="text-primary-500">{rules.length}</span>
              </h3>
              <div className="space-y-3">
                {rules.map(r => (
                  <div key={r._id} onClick={() => loadRule(r)} className={`p-4 rounded-2xl border cursor-pointer group transition-all ${selectedRuleId === r._id ? 'border-primary-500 bg-primary-50/20' : 'border-slate-100 dark:border-slate-800'}`}>
                     <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-bold truncate max-w-[180px]">{r.ruleName}</p>
                          <p className="text-[10px] font-black uppercase text-primary-500 tracking-tighter mt-1">{r.approvalType} • {r.targetCategory}</p>
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
