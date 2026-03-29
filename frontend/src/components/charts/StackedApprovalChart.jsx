import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import CustomChartTooltip from './CustomChartTooltip';

const StackedApprovalChart = ({ data, baseCurrency, currencySymbol }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.08} />
        <XAxis 
          dataKey="name" 
          stroke="#94a3b8" 
          fontSize={10} 
          axisLine={false} 
          tickLine={false}
          label={{ value: 'Timeline', position: 'insideBottomRight', offset: -10, fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }}
        />
        <YAxis 
          stroke="#94a3b8" 
          fontSize={10} 
          axisLine={false} 
          tickLine={false} 
          tickFormatter={(v) => `${currencySymbol}${v}`}
          label={{ value: `Amount (${baseCurrency})`, angle: -90, position: 'insideLeft', fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }}
        />
        <Tooltip content={<CustomChartTooltip baseCurrency={baseCurrency} currencySymbol={currencySymbol} />} />
        <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '1px' }} />
        <Bar dataKey="Approved" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} animationDuration={2000} />
        <Bar dataKey="Pending" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} animationDuration={2000} />
        <Bar dataKey="Rejected" stackId="a" fill="#ef4444" radius={[10, 10, 0, 0]} animationDuration={2000} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default StackedApprovalChart;
