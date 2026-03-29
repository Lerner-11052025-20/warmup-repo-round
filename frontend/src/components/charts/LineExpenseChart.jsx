import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import CustomChartTooltip from './CustomChartTooltip';

const LineExpenseChart = ({ data, baseCurrency, currencySymbol, dataKey = "amount", yAxisLabel = `Amount (${baseCurrency})` }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 20, right: 20, left: 60, bottom: 30 }}>
        <defs>
          <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.08} />
        <XAxis 
          dataKey="name" 
          stroke="#94a3b8" 
          fontSize={10} 
          axisLine={false} 
          tickLine={false} 
          label={{ value: 'Timeline', position: 'insideBottom', offset: -10, fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }}
        />
        <YAxis 
          stroke="#94a3b8" 
          fontSize={10} 
          width={60}
          axisLine={false} 
          tickLine={false} 
          tickFormatter={(v) => dataKey === 'amount' ? `${currencySymbol}${v}` : v}
          label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fontSize: 10, fontWeight: 'bold', fill: '#94a3b8', offset: -45 }}
        />
        <Tooltip content={<CustomChartTooltip baseCurrency={baseCurrency} currencySymbol={currencySymbol} />} />
        <Area 
          type="monotone" 
          dataKey={dataKey} 
          stroke={dataKey === 'amount' ? "#6366f1" : "#10b981"}
          strokeWidth={4} 
          fillOpacity={1} 
          fill="url(#colorExpense)" 
          animationDuration={2000}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default LineExpenseChart;
