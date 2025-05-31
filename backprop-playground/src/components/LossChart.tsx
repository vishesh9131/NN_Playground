'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LossDataPoint {
  step: number;
  loss: number;
}

interface LossChartProps {
  data: LossDataPoint[];
  className?: string;
}

export const LossChart: React.FC<LossChartProps> = ({ data, className = "" }) => {
  return (
    <div className={`bg-gray-900 rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4">Training Loss Over Time</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="step" 
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={['dataMin', 'dataMax']}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
              labelStyle={{ color: '#F9FAFB' }}
            />
            <Line 
              type="monotone" 
              dataKey="loss" 
              stroke="#EF4444" 
              strokeWidth={2}
              dot={{ fill: '#EF4444', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: '#EF4444', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {data.length > 0 && (
        <div className="mt-4 flex justify-between text-sm text-gray-300">
          <span>Initial Loss: {data[0]?.loss.toFixed(4)}</span>
          <span>Current Loss: {data[data.length - 1]?.loss.toFixed(4)}</span>
          {data.length > 1 && (
            <span className="text-green-400">
              Improvement: {((data[0]?.loss - data[data.length - 1]?.loss) / data[0]?.loss * 100).toFixed(1)}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}; 