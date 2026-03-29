import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

const ChartBase = ({ 
  title, 
  icon: Icon, 
  children, 
  className, 
  delay = 0, 
  isLoading = false 
}) => {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 30 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className={`group relative overflow-hidden bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl p-7 transition-all hover:shadow-primary-500/10 hover:border-primary-500/30 ${className}`}
    >
      {/* 3D Background Effect */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-56 h-56 bg-primary-500/5 rounded-full blur-[100px] pointer-events-none transition-all group-hover:bg-primary-500/10 group-hover:blur-[80px]" />

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-700 flex items-center justify-center text-white shadow-xl shadow-primary-500/30 transform group-hover:rotate-3 group-hover:scale-110 transition-transform">
            <Icon size={22} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 tracking-tight text-sm leading-tight uppercase">{title}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Intelligence Stream</p>
            </div>
          </div>
        </div>
        <div className="p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm opacity-50">
           <Zap size={14} className="text-primary-500" />
        </div>
      </div>

      <div className="h-[280px] w-full relative z-10">
        <AnimatePresence mode="wait">
          {isLoading || !isVisible ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="w-full h-full flex flex-col gap-4 p-4"
            >
               <div className="w-full h-full bg-slate-50 dark:bg-slate-950 rounded-[2rem] border border-slate-100 dark:border-slate-800 animate-pulse flex items-center justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" />
                  </div>
               </div>
            </motion.div>
          ) : (
            <motion.div 
              key="content"
              initial={{ opacity: 0, scale: 0.98 }} 
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full h-full"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ChartBase;
