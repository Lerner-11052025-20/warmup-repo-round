import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import CustomChartTooltip from './CustomChartTooltip';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const BarCategoryChart = ({ data, baseCurrency, currencySymbol }) => {
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
          label={{ value: 'Category', position: 'insideBottomRight', offset: -10, fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }}
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
        <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={35} animationDuration={2000}>
          {data?.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BarCategoryChart;
