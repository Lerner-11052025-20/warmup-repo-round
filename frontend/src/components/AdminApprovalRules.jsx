import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { approvalRuleAPI, userAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  Settings2, UserCheck, Shuffle, ShieldCheck, Plus, Trash2,
  ArrowRight, Save, User as UserIcon, ListOrdered, SlidersHorizontal, ArrowUp, ArrowDown, ChevronDown
} from 'lucide-react';

export default function AdminApprovalRules() {
  const [rules, setRules] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [selectedRuleId, setSelectedRuleId] = useState(null); // null = create new
  const [userId, setUserId] = useState(''); // Empty means 'Company Default'
  const [description, setDescription] = useState('');
  const [isManagerApprover, setIsManagerApprover] = useState(true);
  const [approvers, setApprovers] = useState([]); // { approverId, step, required }
  const [isSequential, setIsSequential] = useState(true);
  const [minApprovalPercentage, setMinApprovalPercentage] = useState(0);
  const [specificApproverId, setSpecificApproverId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

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
    setUserId(rule.userId?._id || '');
    setDescription(rule.description || '');
    setIsManagerApprover(rule.isManagerApprover ?? true);
    setApprovers(rule.approvers.map(a => ({
      approverId: a.approverId?._id || a.approverId,
      step: a.step,
      required: a.required
    })));
    setIsSequential(rule.isSequential ?? true);
    setMinApprovalPercentage(rule.minApprovalPercentage || 0);
    setSpecificApproverId(rule.specificApproverId?._id || rule.specificApproverId || '');
  };

  const resetForm = () => {
    setSelectedRuleId(null);
    setUserId('');
    setDescription('');
    setIsManagerApprover(true);
    setApprovers([]);
    setIsSequential(true);
    setMinApprovalPercentage(0);
    setSpecificApproverId('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!description) return toast.error('Rule Description is required');

    setSaving(true);
    try {
      // Re-normalize steps
      const normalizedApprovers = approvers.map((a, idx) => ({ ...a, step: idx + 1 }));

      const payload = {
        userId: userId || null, // null for company default
        description,
        isManagerApprover,
        approvers: normalizedApprovers,
        isSequential,
        minApprovalPercentage,
        specificApproverId: specificApproverId || null
      };

      if (selectedRuleId) {
        await approvalRuleAPI.updateRule(selectedRuleId, payload);
        toast.success('Rule updated successfully!');
      } else {
        await approvalRuleAPI.createRule(payload);
        toast.success('Rule created successfully!');
      }

      fetchData();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save rule');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this rule?')) return;
    try {
      await approvalRuleAPI.deleteRule(id);
      toast.success('Rule deleted');
      if (selectedRuleId === id) resetForm();
      fetchData();
    } catch (error) {
      toast.error('Failed to delete rule');
    }
  };

  // Approver List Helpers
  const addApprover = (uId) => {
    if (!uId) return;
    if (approvers.some(a => a.approverId === uId)) return toast.error('User already in approval list');
    setApprovers(prev => [...prev, { approverId: uId, step: prev.length + 1, required: true }]);
  };

  const removeApprover = (idx) => setApprovers(prev => prev.filter((_, i) => i !== idx));

  const moveApprover = (idx, dir) => {
    if ((dir === -1 && idx === 0) || (dir === 1 && idx === approvers.length - 1)) return;
    const newArr = [...approvers];
    const temp = newArr[idx];
    newArr[idx] = newArr[idx + dir];
    newArr[idx + dir] = temp;
    setApprovers(newArr);
  };

  // Dynamic Preview Graph
  const selectedUserObj = useMemo(() => users.find(u => u._id === userId), [users, userId]);

  return (
    <div className="flex flex-col space-y-6 w-full max-w-[1400px] mx-auto pb-10">

      {/* ─── HEADER ─── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Settings2 size={26} className="text-primary-500" />
            Approval Rules Engine
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure multi-level sequences and conditional logic for expense reports.
          </p>
        </div>
        <button
          onClick={resetForm}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl transition-all flex items-center gap-2"
        >
          <Plus size={18} /> New Rule
        </button>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">

        {/* ─── LEFT: MAIN CONFIG FORM ─── */}
        <div className="w-full xl:w-8/12 space-y-6">
          <form id="rule-form" onSubmit={handleSave} className="space-y-6">

            {/* Basic Info */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <UserCheck size={18} className="text-indigo-500" /> Rule Scope & Trigger
                </h3>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rule Name / Description</label>
                  <input
                    type="text" required
                    value={description} onChange={e => setDescription(e.target.value)}
                    placeholder="e.g., Marketing Team Default Flow"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/50 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target Employee (Optional)</label>
                  <select
                    value={userId} onChange={e => setUserId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/50 text-slate-900 dark:text-white"
                  >
                    <option value="">-- Apply as Company Default --</option>
                    {users.map(u => (
                      <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Workflow Approvers */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <ListOrdered size={18} className="text-amber-500" /> Approvers Configuration
                </h3>
              </div>

              <div className="p-6 space-y-6">
                {/* Manager Toggle */}
                <label className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 transition-colors">
                  <input
                    type="checkbox"
                    checked={isManagerApprover} onChange={e => setIsManagerApprover(e.target.checked)}
                    className="w-5 h-5 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                  />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Auto-assign Direct Manager</p>
                    <p className="text-sm text-slate-500">Automatically include the employee's assigned manager as Step 1.</p>
                  </div>
                </label>

                {/* Approvers List */}
                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Additional Approvers Flow</p>
                  {approvers.map((app, idx) => {
                    const usr = users.find(u => u._id === app.approverId);
                    return (
                      <div key={idx} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex flex-col gap-1 items-center bg-slate-200 dark:bg-slate-700 rounded-md">
                          <button type="button" onClick={() => moveApprover(idx, -1)} disabled={idx === 0} className="text-slate-500 hover:text-slate-800 dark:hover:text-white disabled:opacity-30"><ArrowUp size={14} /></button>
                          <button type="button" onClick={() => moveApprover(idx, 1)} disabled={idx === approvers.length - 1} className="text-slate-500 hover:text-slate-800 dark:hover:text-white disabled:opacity-30"><ArrowDown size={14} /></button>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 text-sm">
                          {idx + (isManagerApprover ? 2 : 1)}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-slate-900 dark:text-white">{usr?.name || 'Unknown'}</p>
                          <p className="text-xs text-slate-500">{usr?.role}</p>
                        </div>
                        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 font-semibold cursor-pointer mr-2">
                          <input type="checkbox" checked={app.required} onChange={e => {
                            const n = [...approvers]; n[idx].required = e.target.checked; setApprovers(n);
                          }} />
                          Required
                        </label>
                        <button type="button" onClick={() => removeApprover(idx)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )
                  })}

                  {/* Select Approver */}
                  <div className="flex gap-2">
                    <select id="add-approver-select" className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl outline-none dark:text-white">
                      <option value="">-- Add Approver to Sequence --</option>
                      {users.filter(u => u.role !== 'employee').map(u => (
                        <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                      ))}
                    </select>
                    <button type="button" onClick={() => {
                      const sel = document.getElementById('add-approver-select');
                      addApprover(sel.value);
                      sel.value = '';
                    }} className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold flex items-center gap-2">
                      <Plus size={16} /> Add
                    </button>
                  </div>
                </div>

                {/* Sequence Toggle */}
                <label className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-slate-900 transition-colors">
                  <div 
                    className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${isSequential ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`} 
                    onClick={() => setIsSequential(!isSequential)}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-300 ${isSequential ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
                  <div>
                    <p className={`font-bold flex items-center gap-2 transition-colors duration-300 ${isSequential ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                      Strict Approval Sequence 
                      {isSequential ? (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400">ON</span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">OFF</span>
                      )}
                    </p>
                    <p className="text-sm text-slate-500">Wait for Step 1 to approve before notifying Step 2.</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Conditional Logic */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <SlidersHorizontal size={18} className="text-emerald-500" /> Conditional Logic (Optional)
                </h3>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-5">
                      Minimum Approval threshold ({minApprovalPercentage}%)
                    </label>
                    <div className="relative w-full h-2">
                      {/* Track Background */}
                      <div className="absolute top-0 left-0 w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full" />
                      {/* Active Fill */}
                      <div 
                        className="absolute top-0 left-0 h-2 bg-primary-500 rounded-full pointer-events-none transition-all duration-150"
                        style={{ width: `${minApprovalPercentage}%` }}
                      />
                      {/* Native Range Slider (Transparent Track) */}
                      <input 
                        type="range" min="0" max="100" step="10"
                        value={minApprovalPercentage} onChange={e => setMinApprovalPercentage(parseInt(e.target.value))}
                        className="absolute top-0 left-0 w-full h-2 appearance-none bg-transparent cursor-pointer z-10 outline-none
                          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform hover:[&::-webkit-slider-thumb]:scale-110 
                          [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary-500 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:shadow-md hover:[&::-moz-range-thumb]:scale-110"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    If set, the expense will auto-approve once X% of the assigned non-sequential approvers say yes. (0 = require all)
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    VIP Auto-Approver
                  </label>
                  <div className="relative">
                    <select
                      value={specificApproverId}
                      onChange={(e) => setSpecificApproverId(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    >
                      <option value="">-- None --</option>
                      {users.map((usr) => (
                        <option key={usr._id} value={usr._id}>{usr.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    If this specific user approves, the expense will instantly auto-approve, bypassing the percentage rule.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="sticky bottom-4 z-20 flex gap-4 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
              <button
                type="submit" disabled={saving} form="rule-form"
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition-transform active:scale-95 flex justify-center items-center gap-2"
              >
                {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={20} /> Save Flow Configuration</>}
              </button>
            </div>

          </form>
        </div>

        {/* ─── RIGHT: LIVE PREVIEW & RULES LIST ─── */}
        <div className="w-full xl:w-4/12 space-y-6">

          {/* Live Preview */}
          <div className="bg-white dark:bg-gradient-to-b dark:from-slate-950 dark:to-slate-900 rounded-2xl p-6 shadow-sm dark:shadow-xl border border-slate-200 dark:border-slate-700 relative overflow-hidden text-slate-900 dark:text-white transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <h3 className="font-bold flex items-center gap-2 mb-6">
              <ShieldCheck size={20} className="text-emerald-500 dark:text-emerald-400" /> Flow Preview
            </h3>

            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Trigger</span>
                <div className="bg-slate-50 dark:bg-white/10 p-3 rounded-lg border border-slate-200 dark:border-white/5 flex items-center gap-3">
                  <UserIcon size={18} className="text-blue-500 dark:text-blue-400" />
                  <span className="text-sm font-semibold">{selectedUserObj ? selectedUserObj.name : 'All Company Employees'}</span>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center"><ArrowDown size={20} className="text-slate-300 dark:text-slate-600" /></div>

              {isManagerApprover && (
                <>
                  <div className="bg-primary-50 dark:bg-white/10 p-3 rounded-lg border border-primary-200 dark:border-primary-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-bold">1</div>
                      <span className="text-sm font-semibold">Direct Manager</span>
                    </div>
                    <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded text-slate-700 dark:text-slate-300 font-bold uppercase">Required</span>
                  </div>
                  {(approvers.length > 0) && <div className="flex justify-center"><ArrowDown size={20} className="text-slate-300 dark:text-slate-600" /></div>}
                </>
              )}

              {approvers.map((app, idx) => {
                const usr = users.find(u => u._id === app.approverId);
                return (
                  <React.Fragment key={idx}>
                    <div className={`bg-slate-50 dark:bg-white/10 p-3 rounded-lg border flex items-center justify-between ${app.required ? 'border-primary-200 dark:border-primary-500/30 bg-primary-50/50 dark:bg-primary-500/5' : 'border-slate-200 dark:border-white/5'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-white">{idx + (isManagerApprover ? 2 : 1)}</div>
                        <span className="text-sm font-semibold text-slate-800 dark:text-white">{usr?.name || 'User'} <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">({usr?.role})</span></span>
                      </div>
                      <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${app.required ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300' : 'bg-slate-100 text-slate-400 dark:bg-slate-800/50 dark:text-slate-500'}`}>
                        {app.required ? 'Required' : 'Optional'}
                      </span>
                    </div>
                    {idx < approvers.length - 1 && <div className="flex justify-center"><ArrowDown size={20} className="text-slate-300 dark:text-slate-600" /></div>}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Conditionals Footer */}
            {(minApprovalPercentage > 0 || specificApproverId) && (
              <div className="mt-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                <p className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider mb-2">Conditions Applied</p>
                <ul className="text-xs space-y-2 text-slate-700 dark:text-slate-300">
                  {minApprovalPercentage > 0 && <li>• Auto-approve if {minApprovalPercentage}% of assigned users agree.</li>}
                  {specificApproverId && <li>• {minApprovalPercentage > 0 ? 'OR ' : ''}Auto-approve immediately if approved by VIP: {users.find(u => u._id === specificApproverId)?.name}</li>}
                </ul>
              </div>
            )}
          </div>

          {/* Existing Rules List */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Saved Rules ({rules.length})</h3>
            {loading ? (
              <p className="text-sm text-slate-500">Loading...</p>
            ) : rules.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No custom rules configured yet.</p>
            ) : (
              <div className="space-y-3">
                {rules.map(rule => (
                  <div key={rule._id}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all group relative overflow-hidden
                      ${selectedRuleId === rule._id 
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10 shadow-md ring-1 ring-indigo-500/20' 
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm'}`}
                    onClick={() => loadRule(rule)}
                  >
                    <div className="flex justify-between items-start mb-2 relative z-10">
                      <div>
                        <p className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{rule.description}</p>
                        <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 tracking-wide uppercase mt-0.5">
                          {rule.userId ? `User: ${rule.userId.name}` : 'Global Company Rule'}
                        </p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(rule._id); }} 
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3 relative z-10">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tighter shadow-sm
                        ${rule.isSequential ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'}`}>
                        {rule.isSequential ? 'Strict Sequence' : 'Parallel Flow'}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md text-[10px] font-bold uppercase tracking-tighter">
                        {rule.approvers?.length + (rule.isManagerApprover ? 1 : 0)} STEP{rule.approvers?.length + (rule.isManagerApprover ? 1 : 0) !== 1 ? 'S' : ''}
                      </span>
                      {rule.specificApproverId && (
                        <span className="px-2 py-0.5 bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-400 rounded-md text-[10px] font-bold uppercase tracking-tighter flex items-center gap-1">
                          <ShieldCheck size={10} /> VIP Rule
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
