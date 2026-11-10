import React from 'react';

interface TickMeterProps {
  percent: number; // 0 to 100
  tone?: 'energy' | 'air' | 'water' | 'danger' | 'warn';
  totalBars?: number;
  className?: string;
  ariaLabel?: string;
}

export const TickMeter: React.FC<TickMeterProps> = ({
  percent,
  tone = 'energy',
  totalBars = 28,
  className = '',
  ariaLabel,
}) => {
  const clampedPercent = Math.max(0, Math.min(100, percent));
  const activeCount = Math.round((clampedPercent / 100) * totalBars);

  // Tone colors
  const toneColors = {
    energy: {
      active: '#B4532A',
      needle: '#8C3B18',
    },
    air: {
      active: '#2F8F6B',
      needle: '#0E6B5A',
    },
    water: {
      active: '#1F7A9C',
      needle: '#145A75',
    },
    danger: {
      active: '#C23B3B',
      needle: '#991B1B',
    },
    warn: {
      active: '#C2702A',
      needle: '#9A4F13',
    },
  };

  const selectedTone = toneColors[tone] || toneColors.energy;

  return (
    <div
      className={`flex items-end gap-[4px] h-[22px] py-0.5 ${className}`}
      role="meter"
      aria-valuenow={clampedPercent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel || `${clampedPercent}%`}
    >
      {Array.from({ length: totalBars }).map((_, index) => {
        const isFilled = index < activeCount;
        const isNeedle = index === activeCount - 1 && activeCount > 0;

        let height = 'h-[13px]';
        let bg = 'bg-[#DCEAE5] dark:bg-[#24362F]';
        let customStyle: React.CSSProperties = {};

        if (isNeedle) {
          height = 'h-[22px]';
          customStyle = { backgroundColor: selectedTone.needle };
        } else if (isFilled) {
          height = 'h-[14px]';
          // Subtle opacity gradient up to the value
          const opacity = 0.5 + (index / activeCount) * 0.5;
          customStyle = { backgroundColor: selectedTone.active, opacity };
        }

        return (
          <span
            key={index}
            style={customStyle}
            className={`w-[3px] rounded-full transition-all duration-300 ${height} ${
              !customStyle.backgroundColor ? bg : ''
            }`}
          />
        );
      })}
    </div>
  );
};

export default TickMeter;
