import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { approvalRuleAPI, userAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  Settings2, Plus, Trash2, ArrowDown, Save, User as UserIcon, 
  CheckCircle2, Info, Users, ShieldCheck, ListOrdered, 
  ChevronDown, UserCheck, Briefcase, Zap, AlertCircle, SlidersHorizontal
} from 'lucide-react';

export default function AdminApprovalRules() {
  const [rules, setRules] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ─── Form State (V2.0 Engine) ───
  const [selectedRuleId, setSelectedRuleId] = useState(null);
  const [ruleName, setRuleName] = useState('');
  const [targetEmployee, setTargetEmployee] = useState('');
  const [autoManager, setAutoManager] = useState(true);
  const [sequence, setSequence] = useState([]);
  const [isStrict, setIsStrict] = useState(true);
  const [threshold, setThreshold] = useState(100);
  const [vipApprover, setVipApprover] = useState('');

  // ─── Dropdown state ───
  const [newApproverId, setNewApproverId] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [{ data: rulesRes }, { data: usersRes }] = await Promise.all([
        approvalRuleAPI.getRules(),
        userAPI.getUsers()
      ]);
      setRules(rulesRes.rules || []);
      setUsers(usersRes.users || []);
    } catch (error) {
      toast.error('Failed to sync engine data');
    } finally {
      setLoading(false);
    }
  };

  const addApprover = () => {
    if (!newApproverId) return;
    const userToAdd = users.find(u => u._id === newApproverId);
    if (!userToAdd) return;
    
    if (sequence.find(s => s.userId === newApproverId)) {
      return toast.error('User already in sequence');
    }

    setSequence([...sequence, { userId: userToAdd._id, name: userToAdd.name, role: userToAdd.role, required: true }]);
    setNewApproverId('');
  };

  const removeApprover = (idx) => {
    setSequence(sequence.filter((_, i) => i !== idx));
  };

  const toggleRequired = (idx) => {
    const newSeq = [...sequence];
    newSeq[idx].required = !newSeq[idx].required;
    setSequence(newSeq);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!ruleName) return toast.error('Rule Name is required');

    setSaving(true);
    try {
      const payload = {
        ruleName,
        targetEmployee: targetEmployee || null,
        autoManager,
        sequence: sequence.map(s => ({ userId: s.userId, required: s.required })),
        isStrict,
        threshold,
        vipApprover: vipApprover || null
      };

      if (selectedRuleId) {
        await approvalRuleAPI.updateRule(selectedRuleId, payload);
        toast.success('Workflow engine updated!');
      } else {
        await approvalRuleAPI.createRule(payload);
        toast.success('Multi-stage workflow created!');
      }

      fetchData();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save logic');
    } finally {
      setSaving(false);
    }
  };

  const loadRule = (rule) => {
    setSelectedRuleId(rule._id);
    setRuleName(rule.ruleName || '');
    setTargetEmployee(rule.targetEmployee?._id || rule.targetEmployee || '');
    setAutoManager(rule.autoManager ?? true);
    setIsStrict(rule.isStrict ?? true);
    setThreshold(rule.threshold ?? 100);
    setVipApprover(rule.vipApprover?._id || rule.vipApprover || '');
    
    // Map sequence back with user details
    const mappedSeq = (rule.sequence || []).map(s => {
      const u = users.find(usr => usr._id === (s.userId?._id || s.userId));
      return {
        userId: u?._id,
        name: u?.name || 'Unknown User',
        role: u?.role || 'user',
        required: s.required
      };
    });
    setSequence(mappedSeq);
  };

  const resetForm = () => {
    setSelectedRuleId(null);
    setRuleName('');
    setTargetEmployee('');
    setAutoManager(true);
    setSequence([]);
    setIsStrict(true);
    setThreshold(100);
    setVipApprover('');
  };

  if (loading) return <div className="flex justify-center p-20 animate-pulse">Initializing Workflow Engine...</div>;

  return (
    <div className="flex flex-col space-y-6 w-full max-w-[1400px] mx-auto pb-20 px-4 font-sans select-none">
      
      {/* ─── HEADER ─── */}
      <div className="bg-white/80 backdrop-blur-xl dark:bg-slate-900/80 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-8 shadow-2xl shadow-slate-200/50 dark:shadow-none flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-5">
           <div className="w-14 h-14 bg-primary-600 rounded-[1.2rem] flex items-center justify-center text-white shadow-xl shadow-primary-500/30">
              <Zap size={28} />
           </div>
           <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Approval Rules Engine</h1>
              <p className="text-sm text-slate-500 font-medium">Configure multi-level sequences and conditional logic for expense reports.</p>
           </div>
        </div>
        <button 
          onClick={resetForm} 
          className="px-8 py-3.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-[1.1rem] font-black text-sm flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus size={20} /> New Rule
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* ─── LEFT COLUMN: CONFIGURATION ─── */}
        <div className="xl:col-span-8 space-y-8">
          
          {/* Rule Scope */}
          <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-8">
            <div className="flex items-center gap-2 text-[11px] font-black text-primary-500 mb-2 uppercase tracking-[0.2em]">
               <Settings2 size={14} /> Rule Scope & Trigger
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Rule Name / Description</label>
                 <input 
                   type="text" value={ruleName} onChange={e => setRuleName(e.target.value)}
                   placeholder="e.g. Sales Team Global Flow"
                   className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500/20 text-sm font-bold transition-all"
                 />
               </div>
               <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Target Employee (Optional)</label>
                 <select 
                   value={targetEmployee} onChange={e => setTargetEmployee(e.target.value)}
                   className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none appearance-none text-sm font-bold"
                 >
                   <option value="">-- All Employees --</option>
                   {users.filter(u => u.role === 'employee').map(u => (
                      <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                   ))}
                 </select>
               </div>
            </div>
          </section>

          {/* Approvers Configuration */}
          <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-8">
            <div className="flex items-center gap-2 text-[11px] font-black text-primary-500 mb-2 uppercase tracking-[0.2em]">
               <ListOrdered size={14} /> Approvers Configuration
            </div>

            <div className="p-6 bg-slate-50/50 dark:bg-slate-950/30 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
                    <UserCheck size={22} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white leading-tight">Auto-assign Direct Manager</h4>
                    <p className="text-[11px] text-slate-500 font-medium">Automatically include the employee's assigned manager as Step 1.</p>
                  </div>
               </div>
               <button 
                  onClick={() => setAutoManager(!autoManager)}
                  className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${autoManager ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-700'}`}
               >
                  <div className={`w-6 h-6 bg-white rounded-full transition-all shadow-md ${autoManager ? 'ml-6' : 'ml-0'}`} />
               </button>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Additional Approvers Flow</label>
              
              <AnimatePresence>
                {sequence.map((step, idx) => (
                  <motion.div 
                    key={step.userId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="w-full p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between shadow-sm group">
                       <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-black text-slate-400">
                             {autoManager ? idx + 2 : idx + 1}
                          </div>
                          <div>
                             <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{step.name}</p>
                             <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest leading-none">{step.role}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                         <div className="flex items-center gap-2 pr-4 border-r border-slate-100 dark:border-slate-800">
                            <input 
                              type="checkbox" checked={step.required} onChange={() => toggleRequired(idx)}
                              className="w-4 h-4 rounded-md border-slate-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-[10px] font-black uppercase text-slate-900 dark:text-white">Required</span>
                         </div>
                         <button onClick={() => removeApprover(idx)} className="p-2 text-red-100 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
                            <Trash2 size={16} />
                         </button>
                       </div>
                    </div>
                    {idx < sequence.length - 1 && <ArrowDown size={14} className="text-slate-200 my-1" />}
                  </motion.div>
                ))}
              </AnimatePresence>

              <div className="flex gap-4 mt-8">
                 <div className="relative flex-1 group">
                    <select 
                      value={newApproverId} onChange={e => setNewApproverId(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 text-sm font-bold appearance-none outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                    >
                      <option value="">-- Add Approver to Sequence --</option>
                      {users.filter(u => u.role !== 'employee').map(u => (
                         <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                      ))}
                    </select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-primary-500 transition-colors" />
                 </div>
                 <button onClick={addApprover} className="px-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all">
                    <Plus size={18} /> Add
                 </button>
              </div>
            </div>

            <div className="p-6 bg-emerald-50/50 dark:bg-emerald-950/10 rounded-3xl border border-emerald-100/50 dark:border-emerald-900/20 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isStrict ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white leading-tight flex items-center gap-2">
                       Strict Approval Sequence 
                       <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${isStrict ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                         {isStrict ? 'ON' : 'OFF'}
                       </span>
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium tracking-tight">Wait for Step 1 to approve before notifying Step 2.</p>
                  </div>
               </div>
               <button 
                  onClick={() => setIsStrict(!isStrict)}
                  className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${isStrict ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
               >
                  <div className={`w-6 h-6 bg-white rounded-full transition-all shadow-md ${isStrict ? 'ml-6' : 'ml-0'}`} />
               </button>
            </div>
          </section>

          {/* Conditional Logic */}
          <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-8">
            <div className="flex items-center gap-2 text-[11px] font-black text-primary-500 mb-2 uppercase tracking-[0.2em]">
               <SlidersHorizontal size={14} /> Conditional Logic (Optional)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <div className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1 mb-1 block">Minimum Approval Threshold ({threshold}%)</label>
                    <input 
                      type="range" min="0" max="100" step="10" value={threshold} onChange={e => setThreshold(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    />
                 </div>
                 <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">
                   If set, the expense will auto-approve once X% of the assigned non-sequential approvers say yes. (0 = require all)
                 </p>
               </div>
               <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">VIP Auto-approver</label>
                 <select 
                   value={vipApprover} onChange={e => setVipApprover(e.target.value)}
                   className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none text-sm font-bold"
                 >
                   <option value="">-- No Auto-Approver --</option>
                   {users.filter(u => u.role !== 'employee').map(u => (
                      <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                   ))}
                 </select>
                 <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">
                   If this specific user approves, the expense will instantly auto-approve, bypassing the percentage rule.
                 </p>
               </div>
            </div>
          </section>

          <button 
            type="button" disabled={saving} onClick={handleSave}
            className="w-full bg-primary-600 text-white py-5 rounded-[1.5rem] font-black text-sm shadow-2xl shadow-primary-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
          >
             <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
             {saving ? 'Synchronizing Logic...' : <><Save size={20}/> Save Flow Configuration</>}
          </button>
        </div>

        {/* ─── RIGHT COLUMN: PREVIEW & LIST ─── */}
        <div className="xl:col-span-4 space-y-8 sticky top-6">
           
           {/* Flow Preview */}
           <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
              <div className="flex items-center gap-2 text-[11px] font-black text-primary-500 mb-6 uppercase tracking-[0.2em]">
                 <CheckCircle2 size={14} /> Flow Preview
              </div>
              
              <div className="space-y-4">
                 <div className="p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/30 rounded-2xl flex items-center gap-3">
                    <UserIcon size={18} className="text-primary-600" />
                    <div>
                       <p className="text-[10px] font-black uppercase text-primary-600/60 leading-none">Trigger</p>
                       <p className="text-xs font-bold text-primary-700 dark:text-primary-300 capitalize">{targetEmployee ? users.find(u => u._id === targetEmployee)?.name : 'Any Employee'}</p>
                    </div>
                 </div>
                 
                 <ArrowDown size={14} className="mx-auto text-slate-200" />

                 {autoManager && (
                   <>
                     <div className="p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-black text-slate-500">1</div>
                           <p className="text-xs font-bold text-slate-800 dark:text-white">Direct Manager</p>
                        </div>
                        <span className="text-[8px] font-black bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full uppercase tracking-widest text-slate-400">Required</span>
                     </div>
                     {(sequence.length > 0) && <ArrowDown size={14} className="mx-auto text-slate-200" />}
                   </>
                 )}

                 {sequence.map((s, i) => (
                   <React.Fragment key={s.userId}>
                      <div className="p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                           <div className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-black text-slate-500">
                              {autoManager ? i + 2 : i + 1}
                           </div>
                           <div className="leading-tight">
                              <p className="text-xs font-bold text-slate-800 dark:text-white capitalize">{s.name}</p>
                              <p className="text-[9px] uppercase font-bold text-slate-400">{s.role}</p>
                           </div>
                        </div>
                        {s.required && <span className="text-[8px] font-black bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full uppercase tracking-widest text-slate-400">Required</span>}
                      </div>
                      {i < sequence.length - 1 && <ArrowDown size={14} className="mx-auto text-slate-200" />}
                   </React.Fragment>
                 ))}

                 {/* Logic Summary Cards */}
                 <div className="mt-8 p-6 bg-yellow-50/50 dark:bg-yellow-900/10 rounded-3xl border border-yellow-100 dark:border-yellow-900/20 space-y-3">
                    <p className="text-[10px] font-black uppercase text-yellow-600 dark:text-yellow-500 tracking-widest">Conditions Applied</p>
                    <ul className="space-y-2">
                       <li className="text-[11px] text-slate-600 dark:text-slate-400 font-medium flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full" /> Auto-approve if {threshold}% of assigned users agree.
                       </li>
                       {vipApprover && (
                          <li className="text-[11px] text-slate-600 dark:text-slate-400 font-medium flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full" /> OR Auto-approve immediately if approved by VIP: <span className="font-bold text-slate-900 dark:text-white uppercase tracking-tighter">{users.find(u => u._id === vipApprover)?.name.split(' ')[0]}</span>
                          </li>
                       )}
                    </ul>
                 </div>
              </div>
           </div>

           {/* Saved Rules List */}
           <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
              <h3 className="font-black text-slate-900 dark:text-white mb-6 uppercase text-[10px] tracking-[0.2em] flex justify-between">
                Saved Rules <span>({rules.length})</span>
              </h3>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                {rules.length === 0 ? (
                  <div className="text-center py-10 opacity-40">
                    <AlertCircle size={40} className="mx-auto mb-3" />
                    <p className="text-xs font-bold uppercase tracking-widest">No custom rules configured yet.</p>
                  </div>
                ) : (
                  rules.map(r => (
                    <div 
                      key={r._id} onClick={() => loadRule(r)} 
                      className={`p-5 rounded-2xl border cursor-pointer transition-all group relative ${selectedRuleId === r._id ? 'border-primary-500 bg-primary-50/30' : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50'}`}
                    >
                       <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.1em]">{r.ruleName}</p>
                            <p className="text-[10px] font-medium text-slate-500 mt-0.5">
                              {r.sequence.length + (r.autoManager ? 1 : 0)} Total Stages • {r.threshold}% Threshold
                            </p>
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); /* handle delete logic */ }}
                            className="p-2 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                       </div>
                    </div>
                  ))
                )}
              </div>
           </div>

        </div>

      </div>
    </div>
  );
}
