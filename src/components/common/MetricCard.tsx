import React from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  subtext: string;
  isPositive?: boolean;
  icon?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtext,
  isPositive = true,
  icon
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold uppercase tracking-wider text-slate-500">
          {label}
        </span>
        {icon && <div className="text-slate-400 p-1.5 rounded-lg bg-slate-50">{icon}</div>}
      </div>
      <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</div>
      <div
        className={`text-sm mt-2 font-medium flex items-center gap-1.5 ${
          isPositive ? 'text-emerald-700' : 'text-amber-700'
        }`}
      >
        <span>{subtext}</span>
      </div>
    </div>
  );
};
