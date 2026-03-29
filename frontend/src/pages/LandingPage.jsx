import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, Shield, Clock, BarChart3, Globe, Zap, 
  ArrowRight, CheckCircle2, Menu, X, ChevronRight, 
  MessageSquare, Star, Mail, Phone, MapPin, Search, Receipt, PieChart as PieIcon
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip 
} from 'recharts';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

const mockChartData = [
  { name: 'Mon', amount: 45000 },
  { name: 'Tue', amount: 32000 },
  { name: 'Wed', amount: 65000 },
  { name: 'Thu', amount: 48000 },
  { name: 'Fri', amount: 72000 },
  { name: 'Sat', amount: 28000 },
  { name: 'Sun', amount: 42000 },
];

const FeatureCard = ({ icon: Icon, title, text, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl transition-all hover:shadow-primary-500/10 hover:border-primary-500/30 group"
  >
    <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-lg shadow-primary-500/40">
      <Icon size={26} />
    </div>
    <h3 className="text-xl font-black text-slate-800 dark:text-white mb-4 uppercase tracking-tight">{title}</h3>
    <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{text}</p>
  </motion.div>
);

const StepCard = ({ number, title, text, delay }) => (
  <motion.div 
    initial={{ opacity: 0, x: -30 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="flex gap-6 items-start"
  >
    <div className="flex-shrink-0 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-black text-xl shadow-xl shadow-primary-500/30 border-4 border-white dark:border-slate-950">
      {number}
    </div>
    <div>
      <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2 uppercase tracking-tight">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-sm">{text}</p>
    </div>
  </motion.div>
);

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 dark:border-slate-800 last:border-0 overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-6 text-left transition-colors hover:text-primary-600 group"
      >
        <span className="text-lg font-bold text-slate-800 dark:text-white group-hover:translate-x-1 transition-transform">{question}</span>
        <ChevronRight className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-90 text-primary-500' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="pb-6"
          >
            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      <Navbar />

      {/* ─── HERO SECTION ─── */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-gradient-to-b from-primary-500/10 to-transparent blur-[120px] pointer-events-none" />
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" 
        />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-6 py-2 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none"
            >
              <Zap size={16} className="text-primary-500 animate-pulse" />
              <span className="text-xs font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase">Revolutionizing Financial Systems</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-5xl md:text-8xl font-black tracking-tighter text-slate-900 dark:text-white leading-[1.1]"
            >
              Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">Reimbursement</span> For Modern Teams
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto"
            >
              Automate multi-level approvals, monitor global liquidity in real-time, and eliminate manual errors with our high-performance SaaS engine.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6"
            >
              <Link 
                to={user ? "/dashboard" : "/signup"} 
                className="group relative px-10 py-5 bg-primary-600 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-2xl shadow-primary-500/40 hover:scale-105 active:scale-95 transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <span className="relative flex items-center gap-2">Start Your Journey <ArrowRight size={18}/></span>
              </Link>
              <button className="px-10 py-5 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-black uppercase tracking-widest text-sm rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-primary-500/50 transition-all flex items-center gap-2 shadow-xl shadow-slate-200/50 dark:shadow-none">
                Live Demo <Rocket size={18} className="text-primary-500" />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── LOGO CLOUD ─── */}
      <section className="max-w-7xl mx-auto px-6 pb-32">
        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-8 rounded-[3rem] border border-white/50 dark:border-slate-800/50 shadow-xl flex flex-wrap items-center justify-center gap-12 md:gap-24 opacity-60">
           {['VELOCITY', 'ORBIT', 'NEXUS', 'Z-SPACE', 'QUANTUM'].map(brand => (
             <span key={brand} className="text-2xl font-black text-slate-400 dark:text-slate-600 tracking-[0.2em]">{brand}</span>
           ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-32 relative bg-white dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
           <div className="space-y-12">
              <div className="space-y-4">
                 <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Symphony Of <span className="text-primary-600">Simplicity</span></h2>
                 <p className="text-slate-500 dark:text-slate-400 font-bold">Three steps to complete financial oversight.</p>
              </div>
              <div className="space-y-10">
                 <StepCard number="01" title="Submit Expense" text="Scan receipts or manually log claims with instant category assignment and currency mapping." delay={0.1} />
                 <StepCard number="02" title="Auto-Route" text="Dynamic workflow engine routes requests to correct managers based on departmental rules." delay={0.2} />
                 <StepCard number="03" title="Sync & Settle" text="Approved claims are instantly batched for settlement with real-time analytics updates." delay={0.3} />
              </div>
           </div>
           
           <motion.div 
             initial={{ opacity: 0, scale: 0.9, x: 50 }}
             whileInView={{ opacity: 1, scale: 1, x: 0 }}
             viewport={{ once: true }}
             className="relative aspect-square lg:aspect-auto h-full min-h-[500px] bg-gradient-to-br from-primary-600/10 to-indigo-600/5 rounded-[4rem] border border-primary-500/10 shadow-3xl overflow-hidden group"
           >
              <div className="absolute inset-10 bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-8 space-y-6">
                 <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                    <p className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs">Analytics Overlay</p>
                    <CheckCircle2 className="text-emerald-500" size={20}/>
                 </div>
                 <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={mockChartData}>
                        <XAxis dataKey="name" hide />
                        <YAxis hide />
                        <Tooltip />
                        <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={4} fill="#6366f1" fillOpacity={0.1} />
                      </AreaChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                       <p className="text-[10px] font-black text-slate-400 uppercase">Liquidity</p>
                       <p className="text-xl font-black text-indigo-500">88.4%</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                       <p className="text-[10px] font-black text-slate-400 uppercase">Process Speed</p>
                       <p className="text-xl font-black text-emerald-500">1.2ms</p>
                    </div>
                 </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500 rounded-full blur-[100px] -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
           </motion.div>
        </div>
      </section>

      {/* ─── FEATURES GRID ─── */}
      <section className="py-32 pb-48">
        <div className="max-w-7xl mx-auto px-6 text-center mb-24 space-y-4">
           <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Engineered For <span className="text-primary-600">Scale</span></h2>
           <p className="text-slate-500 dark:text-slate-400 font-bold max-w-2xl mx-auto">Every module is tested for thousands of daily transactions and millisecond response times.</p>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           <FeatureCard icon={Shield} title="Multi-Tier Approval" text="Define complex approval sequences with manager, finance, and director overrides." delay={0.1} />
           <FeatureCard title="Real-Time Data" icon={Clock} text="Instant data propagation across all dashboards with zero latency via Socket.IO." delay={0.2} />
           <FeatureCard icon={Globe} title="Currency Engine" text="Global transactions instantly normalized into company base currency with live rates." delay={0.3} />
           <FeatureCard icon={Zap} title="High Performance" text="Built on a next-gen MERN stack optimized for enterprise loads and low memory footprints." delay={0.4} />
           <FeatureCard icon={Receipt} title="Smart Receipts" text="Automated receipt processing with advanced parsing for vendor and tax details." delay={0.5} />
           <FeatureCard icon={CheckCircle2} title="Compliance Ready" text="Digital paper trails and high-integrity logging for every financial movement." delay={0.6} />
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-32 bg-primary-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 to-primary-800 opacity-90" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center text-white mb-20 space-y-4">
           <div className="inline-flex gap-2">
              {[1,2,3,4,5].map(i => <Star key={i} size={20} className="fill-white"/>)}
           </div>
           <h2 className="text-4xl md:text-5xl font-black tracking-tight uppercase">Trusted By Globals</h2>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
           {[
             { name: "John Doe", role: "CFO, Velocity", text: "SmartFlow transformed our expense workflow from days to literally minutes. Best investment this year." },
             { name: "Sarah Smith", role: "Lead Dev, Quantum", text: "The API architecture is incredibly robust. Integration was a breeze and it handles our scale effortlessly." },
             { name: "Alex Chen", role: "HR Manager, Orbit", text: "Finally a system that employees don't hate using. The UI is exceptionally polished and intuitive." }
           ].map((t, idx) => (
             <motion.div 
               key={idx} 
               whileHover={{ y: -10 }}
               className="p-10 bg-white/10 backdrop-blur-md rounded-[3rem] border border-white/20 text-white space-y-6"
             >
                <p className="text-lg font-bold italic leading-relaxed opacity-90">"{t.text}"</p>
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-white/20 rounded-full border border-white/30 flex items-center justify-center font-black">
                      {t.name.charAt(0)}
                   </div>
                   <div>
                      <p className="font-black text-sm uppercase tracking-widest">{t.name}</p>
                      <p className="text-xs font-bold opacity-60 uppercase">{t.role}</p>
                   </div>
                </div>
             </motion.div>
           ))}
        </div>
      </section>

      {/* ─── FAQ SECTION ─── */}
      <section className="py-32 pt-48 max-w-4xl mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
           <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase tracking-[0.2em]">Questions & Answers</h2>
        </div>
        
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 p-8 md:p-12 shadow-2xl">
           <FAQItem question="How do multi-tier approvals work?" answer="Admins can define sequences (e.g., Manager first, then Finance). The request only settles after the final tier approves." />
           <FAQItem question="Is the data encrypted and secure?" answer="We use industry-standard AES-256 encryption at rest and TLS 1.3 in transit. Your financial data is triple-protected." />
           <FAQItem question="Can we export data for external accounting?" answer="Yes, we support high-fidelity CSV and PDF reporting models compatible with major accounting software." />
           <FAQItem question="How fast is the currency conversion?" answer="Conversions are millisecond-fast, using live market rates mapped instantly during submission." />
        </div>
      </section>

      {/* ─── CONTACT SECTION ─── */}
      <section className="py-32 grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-7xl mx-auto px-6">
        <div className="space-y-12">
            <div className="space-y-6">
               <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white uppercase leading-none">Let's <span className="text-primary-600">Architect</span> Excellence</h2>
               <p className="text-slate-500 dark:text-slate-400 font-bold opacity-80">Our specialized engineers are ready to help you scale your financial operations.</p>
            </div>
            <div className="space-y-6">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-2xl flex items-center justify-center"><Mail size={20}/></div>
                  <div><p className="text-[10px] font-black uppercase text-slate-400">Email System</p><p className="font-black text-slate-800 dark:text-white">support@smartflow.ai</p></div>
               </div>
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl flex items-center justify-center"><Phone size={20}/></div>
                  <div><p className="text-[10px] font-black uppercase text-slate-400">Direct Line</p><p className="font-black text-slate-800 dark:text-white">+1 (888) SMART-FLW</p></div>
               </div>
            </div>
        </div>
        
        <form 
          onSubmit={(e) => { e.preventDefault(); toast.success("Message Sent Successfully! We'll be in touch."); e.target.reset(); }}
          className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 space-y-6"
        >
           <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Full Name</label>
                 <input type="text" required placeholder="John Doe" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl focus:ring-2 focus:ring-primary-500/50 outline-none font-bold" />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Email</label>
                 <input type="email" required placeholder="john@company.com" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl focus:ring-2 focus:ring-primary-500/50 outline-none font-bold" />
              </div>
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Inquiry Scope</label>
              <textarea placeholder="Tell us about your organization's needs..." className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-4 h-32 rounded-2xl focus:ring-2 focus:ring-primary-500/50 outline-none font-bold resize-none" />
           </div>
           <button className="w-full py-5 bg-slate-900 dark:bg-primary-600 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-primary-500/20 active:scale-95 transition-all">
              Initiate Contact
           </button>
        </form>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900 py-20">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-2 space-y-6">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                     <PieIcon size={20} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">SMARTFLOW</h3>
               </div>
               <p className="text-slate-500 dark:text-slate-400 font-bold max-w-sm">The world's most advanced financial transparency engine for fast-moving teams across the globe.</p>
            </div>
            
            <div className="space-y-6">
               <h4 className="text-[10px] font-black uppercase tracking-[4px] text-slate-900 dark:text-white">Platform</h4>
               <div className="flex flex-col gap-4">
                  {['Features', 'Analytics', 'Security', 'Enterprise'].map(link => (
                    <a key={link} href="#" className="text-sm font-bold text-slate-500 hover:text-primary-500 transition-colors uppercase tracking-widest">{link}</a>
                  ))}
               </div>
            </div>
            
            <div className="space-y-6">
               <h4 className="text-[10px] font-black uppercase tracking-[4px] text-slate-900 dark:text-white">Network</h4>
               <div className="flex flex-col gap-4">
                  {['Support', 'API Docs', 'Status', 'Contact'].map(link => (
                    <a key={link} href="#" className="text-sm font-bold text-slate-500 hover:text-primary-500 transition-colors uppercase tracking-widest">{link}</a>
                  ))}
               </div>
            </div>
         </div>
         
         <div className="max-w-7xl mx-auto px-6 mt-20 pt-10 border-t border-slate-50 dark:border-slate-900 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <p>© 2026 SMARTFLOW AI SYSTEMS. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-10">
               <span>Privacy</span>
               <span>Terms</span>
            </div>
         </div>
      </footer>
    </div>
  );
}
