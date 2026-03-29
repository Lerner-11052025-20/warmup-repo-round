import React from 'react';

const CustomChartTooltip = ({ active, payload, label, baseCurrency, currencySymbol }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    return (
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-2xl flex flex-col gap-1.5 transition-all duration-300 scale-105 origin-bottom">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
        
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center justify-between gap-4">
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Converted</span>
             <span className="text-sm font-black text-primary-600 dark:text-primary-400">
               {currencySymbol}{Number(payload[0].value).toLocaleString()}
             </span>
          </div>
          
          {data.originalAmount && data.originalCurrency && (
            <>
              <div className="flex items-center justify-between gap-4">
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Original</span>
                 <span className="text-xs font-bold text-slate-400">
                   {data.originalAmount.toLocaleString()} {data.originalCurrency}
                 </span>
              </div>
              <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
              <div className="flex items-center justify-between gap-4">
                 <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Rate</span>
                 <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">
                   {data.originalCurrency} → {baseCurrency}
                 </span>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export default CustomChartTooltip;
