import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import CustomChartTooltip from './CustomChartTooltip';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const PieDistributionChart = ({ data, baseCurrency, currencySymbol }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Tooltip content={<CustomChartTooltip baseCurrency={baseCurrency} currencySymbol={currencySymbol} />} />
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={65}
          outerRadius={85}
          paddingAngle={10}
          dataKey="value"
          stroke="none"
          animationDuration={2000}
        >
          {data?.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="drop-shadow-lg" />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PieDistributionChart;
