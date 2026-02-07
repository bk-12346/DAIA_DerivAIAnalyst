
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  LineChart,
  Line,
  Legend,
  ReferenceLine
} from 'recharts';
import { RegionalPerformance, InstrumentSignal } from '../types';

interface RegionChartProps {
  data: RegionalPerformance[];
}

export const RegionChart: React.FC<RegionChartProps> = ({ data }) => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis 
            dataKey="region" 
            stroke="#64748b" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            stroke="#64748b" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#0f172a' }}
            itemStyle={{ color: '#0f172a' }}
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
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
          <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
          <YAxis dataKey="instrument" type="category" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px' }}
          />
          <Bar dataKey="dauChange" fill="#3b82f6" name="DAU Δ" radius={[0, 4, 4, 0]} barSize={12} />
          <Bar dataKey="volumeChange" fill="#8b5cf6" name="Vol Δ" radius={[0, 4, 4, 0]} barSize={12} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export interface TrendDataPoint {
  date: string;
  global: number;
  na: number;
}

interface TrendChartProps {
  data: TrendDataPoint[];
  baseline: number;
}

export const TrendChart: React.FC<TrendChartProps> = ({ data, baseline }) => {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#64748b" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(str) => {
              const d = new Date(str);
              return isNaN(d.getTime()) ? str : `${d.getMonth() + 1}/${d.getDate()}`;
            }}
          />
          <YAxis 
            stroke="#64748b" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
            labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
          />
          <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }} />
          
          <ReferenceLine y={baseline} stroke="#94a3b8" strokeDasharray="5 5" label={{ value: 'Baseline', position: 'right', fill: '#94a3b8', fontSize: 10 }} />
          
          <Line 
            type="monotone" 
            dataKey="global" 
            name="Global ADU" 
            stroke="#ef4444" 
            strokeWidth={3} 
            dot={false}
            activeDot={{ r: 6 }} 
          />
          <Line 
            type="monotone" 
            dataKey="na" 
            name="NA Region ADU" 
            stroke="#14b8a6" 
            strokeWidth={2} 
            strokeDasharray="5 5"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
