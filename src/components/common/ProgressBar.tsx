import React from 'react';

interface ProgressBarProps {
  value: number; // 0 - 100
  max?: number;
  height?: string;
  color?: string;
  backgroundColor?: string;
  showLabel?: boolean;
  className?: string;
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  height = 'h-2',
  color = 'bg-japan-indigo-800',
  backgroundColor = 'bg-japan-charcoal-100 dark:bg-zinc-800',
  showLabel = false,
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100))) || 0;

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs text-japan-charcoal-500 font-medium mb-1.5">
          <span>Progress</span>
          <span className="font-semibold text-japan-charcoal-800">{percentage}%</span>
        </div>
      )}
      <div className={`w-full ${height} ${backgroundColor} rounded-full overflow-hidden`}>
        <div
          className={`${height} ${color} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
