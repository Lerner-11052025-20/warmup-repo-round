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
    className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-lg transition-all hover:shadow-primary-500/10 hover:border-primary-500/30 group"
  >
    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white mb-5 transform group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-lg shadow-primary-500/40">
      <Icon size={22} />
    </div>
    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3 uppercase tracking-tight">{title}</h3>
    <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed text-sm">{text}</p>
  </motion.div>
);

const StepCard = ({ number, title, text, delay }) => (
  <motion.div 
    initial={{ opacity: 0, x: -30 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="flex gap-5 items-start"
  >
    <div className="flex-shrink-0 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-xl shadow-primary-500/30 border-4 border-white dark:border-slate-950">
      {number}
    </div>
    <div>
      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 uppercase tracking-tight">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-sm text-sm">{text}</p>
    </div>
  </motion.div>
);

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 dark:border-slate-800 last:border-0 overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-5 text-left transition-colors hover:text-primary-600 group"
      >
        <span className="text-md font-bold text-slate-800 dark:text-white group-hover:translate-x-1 transition-transform">{question}</span>
        <ChevronRight className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-90 text-primary-500' : ''}`} size={18} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="pb-5"
          >
            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic text-sm">{answer}</p>
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 font-sans">
      <Navbar />

      {/* ─── HERO SECTION ─── */}
      <section className="relative pt-24 pb-16 md:pt-40 md:pb-24 overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-primary-500/10 to-transparent blur-[120px] pointer-events-none" />
        <motion.div 
          animate={{ x: [0, 40, 0], y: [0, -20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" 
        />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-5 py-1.5 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-none"
            >
              <Zap size={14} className="text-primary-500 animate-pulse" />
              <span className="text-[10px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">Revolutionizing Financial Systems</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight"
            >
              Smart <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">Reimbursement</span> For Teams
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-base md:text-lg text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto"
            >
              Automate multi-level approvals, monitor global liquidity, and eliminate manual errors with our high-performance SaaS engine.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <Link 
                to={user ? "/dashboard" : "/signup"} 
                className="group relative px-8 py-4 bg-primary-600 text-white font-bold uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-primary-500/40 hover:scale-105 active:scale-95 transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <span className="relative flex items-center gap-2">Get Started <ArrowRight size={16}/></span>
              </Link>
              <button className="px-8 py-4 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-bold uppercase tracking-widest text-xs rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-primary-500/50 transition-all flex items-center gap-2 shadow-lg shadow-slate-200/50 dark:shadow-none">
                Live Demo <Rocket size={16} className="text-primary-500" />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── LOGO CLOUD ─── */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-6 rounded-[3rem] border border-white/50 dark:border-slate-800/50 flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-50">
           {['VELOCITY', 'ORBIT', 'NEXUS', 'QUANTUM'].map(brand => (
             <span key={brand} className="text-xl font-bold text-slate-400 dark:text-slate-600 tracking-[0.2em]">{brand}</span>
           ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-24 relative bg-white dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
           <div className="space-y-10">
              <div className="space-y-3">
                 <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase">Symphony Of <span className="text-primary-600">Simplicity</span></h2>
                 <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">Three steps to complete financial oversight.</p>
              </div>
              <div className="space-y-8">
                 <StepCard number="01" title="Submit Expense" text="Scan receipts or manually log claims with instant category assignment and currency mapping." delay={0.1} />
                 <StepCard number="02" title="Auto-Route" text="Dynamic workflow engine routes requests to correct managers based on departmental rules." delay={0.2} />
                 <StepCard number="03" title="Sync & Settle" text="Approved claims are instantly batched for settlement with real-time analytics updates." delay={0.3} />
              </div>
           </div>
           
           <motion.div 
             initial={{ opacity: 0, scale: 0.9, x: 50 }}
             whileInView={{ opacity: 1, scale: 1, x: 0 }}
             viewport={{ once: true }}
             className="relative aspect-square lg:aspect-auto h-full min-h-[400px] bg-gradient-to-br from-primary-600/10 to-indigo-600/5 rounded-[3rem] border border-primary-500/10 shadow-2xl overflow-hidden group"
           >
              <div className="absolute inset-8 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 p-8 space-y-6">
                 <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-4">
                    <p className="font-bold text-slate-900 dark:text-white uppercase tracking-widest text-[10px]">Analytics Overlay</p>
                    <CheckCircle2 className="text-emerald-500" size={18}/>
                 </div>
                 <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={mockChartData}>
                        <XAxis dataKey="name" hide />
                        <YAxis hide />
                        <Tooltip />
                        <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={3} fill="#6366f1" fillOpacity={0.1} />
                      </AreaChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                       <p className="text-[9px] font-bold text-slate-400 uppercase">Liquidity</p>
                       <p className="text-lg font-bold text-indigo-500">88.4%</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                       <p className="text-[9px] font-bold text-slate-400 uppercase">Process</p>
                       <p className="text-lg font-bold text-emerald-500">1.2ms</p>
                    </div>
                 </div>
              </div>
           </motion.div>
        </div>
      </section>

      {/* ─── FEATURES GRID ─── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 text-center mb-16 space-y-3">
           <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase">Engineered For <span className="text-primary-600">Scale</span></h2>
           <p className="text-slate-500 dark:text-slate-400 font-bold max-w-xl mx-auto text-sm">Every module is tested for enterprise loads and millisecond response times.</p>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           <FeatureCard icon={Shield} title="Multi-Tier Approval" text="Define complex approval sequences with manager, finance, and director overrides." delay={0.1} />
           <FeatureCard title="Real-Time Data" icon={Clock} text="Instant data propagation across all dashboards with zero latency via Socket.IO." delay={0.2} />
           <FeatureCard icon={Globe} title="Currency Engine" text="Global transactions normalized into company base currency with live rates." delay={0.3} />
           <FeatureCard icon={Zap} title="High Performance" text="Built on a next-gen MERN stack optimized for enterprise loads and low memory footprints." delay={0.4} />
           <FeatureCard icon={Receipt} title="Smart Receipts" text="Automated receipt processing with parsing for vendor and tax details." delay={0.5} />
           <FeatureCard icon={CheckCircle2} title="Compliance Ready" text="Digital paper trails and high-integrity logging for every financial movement." delay={0.6} />
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-24 bg-primary-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 to-primary-800 opacity-90" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center text-white mb-16 space-y-3">
           <div className="inline-flex gap-1.5 justify-center">
              {[1,2,3,4,5].map(i => <Star key={i} size={16} className="fill-white"/>)}
           </div>
           <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight uppercase">Trusted By Globals</h2>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
           {[
             { name: "John Doe", role: "CFO", text: "SmartFlow transformed our expense workflow from days to literally minutes." },
             { name: "Sarah Smith", role: "Lead Dev", text: "The API architecture is incredibly robust. Integration was a breeze." },
             { name: "Alex Chen", role: "HR Manager", text: "Finally a system that employees don't hate using. The UI is intuitive." }
           ].map((t, idx) => (
             <motion.div 
               key={idx} 
               whileHover={{ y: -5 }}
               className="p-8 bg-white/10 backdrop-blur-md rounded-[2.5rem] border border-white/20 text-white space-y-5"
             >
                <p className="text-md font-bold italic leading-relaxed opacity-90 text-sm">"{t.text}"</p>
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-white/20 rounded-full border border-white/30 flex items-center justify-center font-bold text-sm">
                      {t.name.charAt(0)}
                   </div>
                   <div>
                      <p className="font-bold text-xs uppercase tracking-widest">{t.name}</p>
                      <p className="text-[10px] font-bold opacity-60 uppercase">{t.role}</p>
                   </div>
                </div>
             </motion.div>
           ))}
        </div>
      </section>

      {/* ─── FAQ SECTION ─── */}
      <section className="py-24 max-w-4xl mx-auto px-6">
        <div className="text-center mb-12 space-y-3">
           <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase tracking-[0.2em]">Questions & Answers</h2>
        </div>
        
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-xl">
           <FAQItem question="How do multi-tier approvals work?" answer="Admins define sequences. The request settles after the final tier approves." />
           <FAQItem question="Is the data encrypted?" answer="We use industry-standard AES-256 encryption at rest and TLS 1.3 in transit." />
           <FAQItem question="Can we export data?" answer="Yes, we support high-fidelity CSV and PDF reporting models." />
           <FAQItem question="How fast is the conversion?" answer="Conversions are millisecond-fast, using live market rates mapped instantly." />
        </div>
      </section>

      {/* ─── CONTACT SECTION ─── */}
      <section className="py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto px-6">
        <div className="space-y-10">
            <div className="space-y-4">
               <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white uppercase leading-none">Architect <span className="text-primary-600">Excellence</span></h2>
               <p className="text-slate-500 dark:text-slate-400 font-bold opacity-80 text-sm">Our specialized engineers are ready to help you scale.</p>
            </div>
            <div className="space-y-5">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-xl flex items-center justify-center"><Mail size={18}/></div>
                  <div><p className="text-[9px] font-bold uppercase text-slate-400 tracking-widest">Email</p><p className="font-bold text-slate-800 dark:text-white text-sm">support@smartflow.ai</p></div>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl flex items-center justify-center"><Phone size={18}/></div>
                  <div><p className="text-[9px] font-bold uppercase text-slate-400 tracking-widest">Line</p><p className="font-bold text-slate-800 dark:text-white text-sm">+1 (888) SMART-FLW</p></div>
               </div>
            </div>
        </div>
        
        <form 
          onSubmit={(e) => { e.preventDefault(); toast.success("Sent!"); e.target.reset(); }}
          className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 space-y-5"
        >
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                 <label className="text-[9px] font-bold uppercase text-slate-400 tracking-widest ml-3">Name</label>
                 <input type="text" required placeholder="John Doe" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 px-4 py-3 rounded-xl text-sm outline-none font-bold" />
              </div>
              <div className="space-y-1.5">
                 <label className="text-[9px] font-bold uppercase text-slate-400 tracking-widest ml-3">Email</label>
                 <input type="email" required placeholder="john@company.com" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 px-4 py-3 rounded-xl text-sm outline-none font-bold" />
              </div>
           </div>
           <div className="space-y-1.5">
              <label className="text-[9px] font-bold uppercase text-slate-400 tracking-widest ml-3">Scope</label>
              <textarea placeholder="Tell us your needs..." className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-4 h-24 rounded-xl text-sm outline-none font-bold resize-none" />
           </div>
           <button className="w-full py-4 bg-slate-900 dark:bg-primary-600 text-white font-bold uppercase tracking-widest text-xs rounded-xl shadow-lg active:scale-95 transition-all">
              Initiate Contact
           </button>
        </form>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900 py-16">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="md:col-span-2 space-y-5">
               <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shadow-lg">
                     <PieIcon size={16} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tighter">SMARTFLOW</h3>
               </div>
               <p className="text-slate-500 dark:text-slate-400 font-bold max-w-sm text-xs">The world's advanced transparency engine for teams.</p>
            </div>
            
            <div className="space-y-4">
               <h4 className="text-[9px] font-bold uppercase tracking-[3px] text-slate-900 dark:text-white">Platform</h4>
               <div className="flex flex-col gap-3">
                  {['Features', 'Analytics', 'Security'].map(link => (
                    <a key={link} href="#" className="text-xs font-bold text-slate-500 hover:text-primary-500 transition-colors uppercase tracking-[2px]">{link}</a>
                  ))}
               </div>
            </div>
            
            <div className="space-y-4">
               <h4 className="text-[9px] font-bold uppercase tracking-[3px] text-slate-900 dark:text-white">Network</h4>
               <div className="flex flex-col gap-3">
                  {['Support', 'API Docs', 'Status'].map(link => (
                    <a key={link} href="#" className="text-xs font-bold text-slate-500 hover:text-primary-500 transition-colors uppercase tracking-[2px]">{link}</a>
                  ))}
               </div>
            </div>
         </div>
         
         <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-slate-50 dark:border-slate-900 flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            <p>© 2026 SMARTFLOW AI SYSTEMS.</p>
            <div className="flex gap-8">
               <span>Privacy</span>
               <span>Terms</span>
            </div>
         </div>
      </footer>
    </div>
  );
}

