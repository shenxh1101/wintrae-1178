import type { ReactNode } from 'react';

interface StatsCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  color?: 'orange' | 'green' | 'blue' | 'pink' | 'purple';
}

const colorMap = {
  orange: 'from-orange-100 to-orange-50 text-orange-600 border-orange-200',
  green: 'from-emerald-100 to-emerald-50 text-emerald-600 border-emerald-200',
  blue: 'from-sky-100 to-sky-50 text-sky-600 border-sky-200',
  pink: 'from-pink-100 to-pink-50 text-pink-600 border-pink-200',
  purple: 'from-violet-100 to-violet-50 text-violet-600 border-violet-200',
};

export default function StatsCard({
  icon,
  label,
  value,
  subtitle,
  color = 'orange',
}: StatsCardProps) {
  return (
    <div className={`p-4 rounded-2xl bg-gradient-to-br ${colorMap[color]} border shadow-sm`}>
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-white/80 shadow-sm">
          {icon}
        </div>
        <div>
          <p className="text-xs text-gray-600 font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
