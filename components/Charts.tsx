
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { RegionalPerformance, PlatformSignal, InstrumentSignal } from '../types';

interface RegionChartProps {
  data: RegionalPerformance[];
}

export const RegionChart: React.FC<RegionChartProps> = ({ data }) => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2e35" vertical={false} />
          <XAxis 
            dataKey="region" 
            stroke="#6b7280" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            stroke="#6b7280" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1a1d23', borderColor: '#374151', borderRadius: '8px' }}
            itemStyle={{ color: '#e5e7eb' }}
          />
          <Bar dataKey="dauChange" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.dauChange < 0 ? '#ef4444' : '#10b981'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

interface MultiMetricChartProps {
  data: InstrumentSignal[];
}

export const InstrumentAnalysis: React.FC<MultiMetricChartProps> = ({ data }) => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2e35" horizontal={false} />
          <XAxis type="number" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
          <YAxis dataKey="instrument" type="category" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1a1d23', borderColor: '#374151', borderRadius: '8px' }}
          />
          <Bar dataKey="dauChange" fill="#3b82f6" name="DAU Δ" radius={[0, 4, 4, 0]} barSize={12} />
          <Bar dataKey="volumeChange" fill="#8b5cf6" name="Vol Δ" radius={[0, 4, 4, 0]} barSize={12} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
