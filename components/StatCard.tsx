
import React from 'react';
import { ArrowDownIcon, ArrowUpIcon, Activity } from 'lucide-react';
import { MetricData } from '../types';

interface StatCardProps {
  data: MetricData;
}

const StatCard: React.FC<StatCardProps> = ({ data }) => {
  const isNegative = data.change < 0;
  const isNeutral = data.change === 0;

  return (
    <div className="bg-[#1a1d23] border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">{data.label}</span>
        <Activity className={`w-4 h-4 ${isNegative ? 'text-red-500' : isNeutral ? 'text-gray-500' : 'text-emerald-500'}`} />
      </div>
      <div className="flex items-end gap-3">
        <h3 className="text-2xl font-bold text-white font-mono">
          {data.unit === '$' ? '$' : ''}
          {data.value.toLocaleString()}
          {data.unit === '%' ? '%' : ''}
        </h3>
        {!isNeutral && (
          <div className={`flex items-center text-sm font-medium mb-1 ${isNegative ? 'text-red-500' : 'text-emerald-500'}`}>
            {isNegative ? <ArrowDownIcon className="w-3 h-3 mr-0.5" /> : <ArrowUpIcon className="w-3 h-3 mr-0.5" />}
            {Math.abs(data.change)}%
          </div>
        )}
      </div>
      <div className="mt-2 text-[10px] text-gray-500 font-medium">
        vs baseline: {data.unit === '$' ? '$' : ''}{data.baseline.toLocaleString()}{data.unit === '%' ? '%' : ''}
      </div>
    </div>
  );
};

export default StatCard;
