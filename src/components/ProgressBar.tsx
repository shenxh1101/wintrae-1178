interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
  color?: 'orange' | 'green' | 'blue' | 'pink';
  height?: 'sm' | 'md' | 'lg';
}

const colorMap = {
  orange: 'from-orange-400 to-orange-500',
  green: 'from-emerald-400 to-emerald-500',
  blue: 'from-sky-400 to-sky-500',
  pink: 'from-pink-400 to-pink-500',
};

const heightMap = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export default function ProgressBar({
  current,
  total,
  showLabel = true,
  color = 'orange',
  height = 'md',
}: ProgressBarProps) {
  const percentage = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1 text-xs text-gray-600">
          <span>{current} / {total} 页</span>
          <span className="font-medium text-gray-800">{percentage}%</span>
        </div>
      )}
      <div className={`w-full ${heightMap[height]} bg-gray-100 rounded-full overflow-hidden`}>
        <div
          className={`h-full bg-gradient-to-r ${colorMap[color]} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
