import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket, Shield, Clock, BarChart3, Globe, Zap,
  ArrowRight, CheckCircle2, Menu, X, ChevronRight,
  MessageSquare, Star, Mail, Phone, MapPin, Search, Receipt, PieChart as PieIcon,
  Cpu, Activity, Layers, Lock, Sparkles, Plus
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip
} from 'recharts';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

const mockChartData = [
  { name: '01', amount: 45000 },
  { name: '02', amount: 32000 },
  { name: '03', amount: 65000 },
  { name: '04', amount: 48000 },
  { name: '05', amount: 72000 },
  { name: '06', amount: 28000 },
  { name: '07', amount: 42000 },
];

const V2_Badge = () => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    className="inline-flex items-center gap-2 px-3 py-1 bg-primary-600/10 border border-primary-500/20 rounded-full mb-6"
  >
    <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
    <span className="text-[9px] font-bold text-primary-600 uppercase tracking-[0.2em]">Release v2.0 Live</span>
  </motion.div>
);

const FeatureCardV2 = ({ icon: Icon, title, text, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="relative p-8 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-primary-500/30 transition-all group overflow-hidden text-left"
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
    
    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-primary-600 mb-6 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
      <Icon size={24} />
    </div>
    
    <h3 className="text-md font-bold text-slate-900 dark:text-white mb-3 uppercase tracking-tight">{title}</h3>
    <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed text-xs uppercase tracking-wide">{text}</p>
  </motion.div>
);

const StepComponent = ({ number, title, text, active, onClick }) => (
  <div 
    onClick={onClick}
    className={`flex gap-6 items-start p-6 rounded-2xl cursor-pointer transition-all duration-300 text-left ${
      active ? 'bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-800' : 'opacity-50 hover:opacity-100'
    }`}
  >
    <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
      active ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
    }`}>
      {number}
    </div>
    <div>
      <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase mb-1">{title}</h3>
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed uppercase tracking-wider">{text}</p>
    </div>
  </div>
);

export default function LandingPage() {
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(1);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 font-sans selection:bg-primary-500 selection:text-white">
      <Navbar />

      {/* ─── HERO V2.0 ─── */}
      <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-[radial-gradient(circle_at_50%_-20%,rgba(99,102,241,0.15),transparent)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <V2_Badge />
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-8"
            >
              The Next Evolution Of <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-indigo-500 to-indigo-600">Financial Flow</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-sm md:text-md text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.3em] max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              High-velocity reimbursement infrastructure <br/> built for the modern enterprise stack.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-5"
            >
              <Link to="/signup" className="group px-8 py-4 bg-primary-600 text-white font-bold uppercase tracking-widest text-[10px] rounded-2xl shadow-2xl shadow-primary-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                Initialize System <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="px-8 py-4 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-bold uppercase tracking-widest text-[10px] rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-primary-500/50 transition-all shadow-xl">
                Technical Brief
              </button>
            </motion.div>
          </div>
        </div>

        {/* Decorative Grid */}
        <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1e293b 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />
      </section>

      {/* ─── LIVE METRICS BOARD ─── */}
      <section className="py-24 relative overflow-hidden" id="features">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          <div className="lg:col-span-5 space-y-12">
            <div className="space-y-4 text-left">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white uppercase tracking-tighter">Unified <span className="text-primary-600">Operations</span></h2>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed">Experience a seamless transition from manual logging to autonomous financial oversight.</p>
            </div>

            <div className="space-y-2">
              <StepComponent number="01" title="Data Injection" text="Intelligent OCR parses documents in <200ms." active={activeStep === 1} onClick={() => setActiveStep(1)} />
              <StepComponent number="02" title="Rule Validation" text="Cross-referencing global compliance protocols." active={activeStep === 2} onClick={() => setActiveStep(2)} />
              <StepComponent number="03" title="Atomic Settlement" text="Batch processing with instant ledger updates." active={activeStep === 3} onClick={() => setActiveStep(3)} />
            </div>
          </div>

          <div className="lg:col-span-7 relative">
            <motion.div 
              layout
              className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 p-8 shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-widest">Global Telemetry</span>
                </div>
                <div className="flex gap-2">
                   <CheckCircle2 size={16} className="text-slate-200 dark:text-slate-800" />
                </div>
              </div>

              <div className="h-64 mb-10 text-left">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockChartData}>
                    <defs>
                      <linearGradient id="v2Gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={4} fill="url(#v2Gradient)" fillOpacity={1} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Uptime', val: '99.99%', color: 'text-emerald-500' },
                  { label: 'Latency', val: '0.42ms', color: 'text-primary-500' },
                  { label: 'Security', val: 'E2E', color: 'text-slate-400' }
                ].map(item => (
                  <div key={item.label} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                    <p className={`text-md font-bold ${item.color}`}>{item.val}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Floating Widgets */}
            <motion.div 
              animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }}
              className="absolute -top-10 -left-10 w-44 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-[2rem] shadow-2xl border border-white dark:border-white/5 hidden xl:block z-20"
            >
              <div className="flex items-center gap-3 mb-4">
                <Activity size={16} className="text-primary-500" />
                <span className="text-[10px] font-bold uppercase text-slate-400">Auth Stream</span>
              </div>
              <div className="space-y-2">
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden leading-none"><div className="w-[80%] h-full bg-primary-500" /></div>
                <div className="h-1.5 w-[60%] bg-slate-100 dark:bg-slate-800 rounded-full" />
              </div>
            </motion.div>

            <motion.div 
              animate={{ x: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity }}
              className="absolute -bottom-6 -right-10 w-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-[2rem] shadow-2xl border border-white dark:border-white/5 hidden xl:block z-20"
            >
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-3 text-left">Sync Status</span>
              <div className="flex items-center gap-2">
                {[1,2,3,4].map(i => <div key={i} className={`w-3 h-3 rounded-full ${i < 4 ? 'bg-emerald-500' : 'bg-slate-200 animate-pulse'}`} />)}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── INFRASTRUCTURE GRID ─── */}
      <section className="py-24 bg-white dark:bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-6 mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-end text-left">
            <div className="space-y-4">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white uppercase tracking-tighter leading-none">High Integrity <br/> <span className="text-primary-600">Infrastructure</span></h2>
            </div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest max-w-sm leading-relaxed">Standard components built for high-security environments and international compliance.</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCardV2 icon={Shield} title="Multi-Tier Core" text="Linear and non-linear approval sequences for any scale." delay={0.1} />
          <FeatureCardV2 icon={Cpu} title="Atomic Engine" text="Instant state updates across all dashboard clusters." delay={0.2} />
          <FeatureCardV2 icon={Globe} title="Currency Stack" text="Global transaction mapping with live market rates." delay={0.3} />
          <FeatureCardV2 icon={Lock} title="Vault Security" text="AES-256 grade encryption for every logged data point." delay={0.4} />
          <FeatureCardV2 icon={Layers} title="Bento Logic" text="Modular components designed for rapid organizational scaling." delay={0.5} />
          <FeatureCardV2 icon={Sparkles} title="AI Analysis" text="Autonomous detection of risk and spend anomalies." delay={0.6} />
        </div>
      </section>

      {/* ─── TECHNICAL CONTACT ─── */}
      <div className="bg-slate-900 dark:bg-black pt-32 transition-colors duration-500" id="contact">
        <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-20 mb-32 text-left">
          <div className="lg:col-span-12 xl:col-span-5 flex flex-col justify-center">
            <div className="space-y-10">
              <div className="space-y-6">
                <span className="text-[10px] font-bold text-primary-500 uppercase tracking-[4px]">Direct Access</span>
                <h2 className="text-4xl md:text-5xl font-extrabold text-white uppercase tracking-tighter leading-tight">Integrate With <br/> <span className="text-primary-500">Our Stack</span></h2>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs leading-relaxed max-w-sm">Deploy high-performance financial systems within your organization in minutes.</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-5 p-5 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 transition-all cursor-pointer group">
                  <div className="w-10 h-10 bg-primary-600/20 text-primary-500 rounded-xl flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-all"><Mail size={20}/></div>
                  <div><p className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">Protocol</p><p className="font-bold text-white uppercase tracking-wider text-sm">connect@smartflow.ai</p></div>
                </div>
                <div className="flex items-center gap-5 p-5 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 transition-all cursor-pointer group">
                  <div className="w-10 h-10 bg-emerald-600/20 text-emerald-500 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all"><Cpu size={20}/></div>
                  <div><p className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">API Status</p><p className="font-bold text-emerald-500 uppercase tracking-widest text-sm">System Normal</p></div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-12 xl:col-span-7">
            <form 
              onSubmit={(e) => { e.preventDefault(); toast.success("Transmission Received!"); e.target.reset(); }}
              className="bg-white/5 backdrop-blur-3xl p-10 md:p-12 rounded-[3.5rem] border border-white/10 space-y-8 shadow-2xl relative"
            >
              <div className="absolute top-10 right-10 flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[9px] font-bold uppercase text-slate-500 tracking-[3px] ml-1">Identity</label>
                  <input type="text" required placeholder="User Name" className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary-500/50 transition-colors" />
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] font-bold uppercase text-slate-500 tracking-[3px] ml-1">Terminal</label>
                  <input type="email" required placeholder="name@domain.com" className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary-500/50 transition-colors" />
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-[9px] font-bold uppercase text-slate-500 tracking-[3px] ml-1">Parameters</label>
                <textarea placeholder="Organizational requirements..." className="w-full bg-white/5 border border-white/10 p-6 h-36 rounded-2xl text-sm font-bold text-white outline-none focus:border-primary-500/50 transition-colors resize-none" />
              </div>
              
              <button className="w-full py-5 bg-primary-600 text-white font-bold uppercase tracking-[0.2em] text-[11px] rounded-2xl shadow-3xl shadow-primary-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                Establish Sync <Plus size={16} />
              </button>
            </form>
          </div>
        </section>

        {/* ─── TERMINAL FOOTER ─── */}
        <footer className="max-w-7xl mx-auto px-6 pb-20 pt-20 border-t border-white/5 text-left">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24">
            <div className="md:col-span-12 lg:col-span-4 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-2xl shadow-primary-500/30">
                  <PieIcon size={20} className="text-white" />
                </div>
                <h3 className="text-xl font-extrabold text-white tracking-tighter uppercase">SmartFlow AI</h3>
              </div>
              <p className="text-slate-500 font-bold text-[11px] leading-relaxed uppercase tracking-wider max-w-xs">
                The high-velocity reimbursement engine for modern engineering teams. Optimizing transparency since v1.0.
              </p>
            </div>
            
            <div className="md:col-span-4 lg:col-span-2 space-y-6">
              <h4 className="text-[10px] font-bold uppercase tracking-[3px] text-white">Logic</h4>
              <div className="flex flex-col gap-3">
                {['Modules', 'Analytics', 'Security'].map(l => <a key={l} href="#" className="text-[10px] font-bold text-slate-600 hover:text-primary-500 transition-colors uppercase tracking-widest">{l}</a>)}
              </div>
            </div>
            
            <div className="md:col-span-4 lg:col-span-2 space-y-6">
              <h4 className="text-[10px] font-bold uppercase tracking-[3px] text-white">Stack</h4>
              <div className="flex flex-col gap-3">
                {['API Docs', 'Status', 'Contact'].map(l => <a key={l} href="#" className="text-[10px] font-bold text-slate-600 hover:text-primary-500 transition-colors uppercase tracking-widest">{l}</a>)}
              </div>
            </div>

            <div className="md:col-span-4 lg:col-span-4 space-y-8">
              <h4 className="text-[10px] font-bold uppercase tracking-[3px] text-white">System Logs</h4>
              <div className="p-6 bg-white/5 rounded-3xl border border-white/5 flex items-center justify-between group cursor-pointer hover:border-emerald-500/20 transition-all">
                <div className="flex items-center gap-4">
                  <Activity size={18} className="text-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-bold text-white uppercase tracking-[2px]">Cluster Node: Active</span>
                </div>
                <ChevronRight size={14} className="text-slate-600 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center text-[9px] font-bold text-slate-700 uppercase tracking-[4px] gap-6">
            <p>© 2026 SMARTFLOW AI SYSTEMS. VERSION 2.0.0_PRODUCTION</p>
            <div className="flex gap-10">
              <a href="#" className="hover:text-primary-500 transition-colors">Privacy_Protocols</a>
              <a href="#" className="hover:text-primary-500 transition-colors">Stack_Terms</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
