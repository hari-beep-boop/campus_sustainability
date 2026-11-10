import React from 'react';

interface SemiGaugeProps {
  value: number; // 0 to 100
  label: string;
  subtext?: string;
  keyInsight?: string;
  className?: string;
}

export const SemiGauge: React.FC<SemiGaugeProps> = ({
  value,
  label,
  subtext,
  keyInsight,
  className = '',
}) => {
  const percent = Math.max(0, Math.min(100, value));

  // Gauge geometry: center at (110, 110), radius 78
  // Start angle at 145 degrees, sweep 250 degrees (ends at 395 deg = 35 deg)
  const cx = 110;
  const cy = 105;
  const r = 78;
  const startAngle = 140; // deg
  const totalSweep = 260; // deg

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, radius: number, startA: number, endA: number) => {
    const start = polarToCartesian(x, y, radius, endA);
    const end = polarToCartesian(x, y, radius, startA);
    const largeArcFlag = endA - startA <= 180 ? '0' : '1';
    return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ');
  };

  const currentSweep = (percent / 100) * totalSweep;
  const endAngle = startAngle + currentSweep;
  const fullEndAngle = startAngle + totalSweep;

  const activePath = describeArc(cx, cy, r, startAngle, endAngle);
  const trackPath = describeArc(cx, cy, r, endAngle, fullEndAngle);
  const knobPos = polarToCartesian(cx, cy, r, endAngle);

  return (
    <div className={`flex flex-col items-center justify-between ${className}`}>
      <div className="relative w-[220px] h-[175px]">
        <svg viewBox="0 0 220 185" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0E6B5A" />
              <stop offset="70%" stopColor="#2BB394" />
              <stop offset="100%" stopColor="#80D0BD" />
            </linearGradient>
          </defs>

          {/* Unfilled Track with faint dashed ticks */}
          {percent < 100 && (
            <path
              d={trackPath}
              fill="none"
              stroke="#DCEAE5"
              strokeWidth="11"
              strokeDasharray="3 4"
              strokeLinecap="round"
              className="dark:stroke-[#24362F]"
            />
          )}

          {/* Active Gradient Arc */}
          {percent > 0 && (
            <path
              d={activePath}
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth="11"
              strokeLinecap="round"
            />
          )}

          {/* Knob at the end of the arc */}
          <circle
            cx={knobPos.x}
            cy={knobPos.y}
            r="8"
            fill="#0E6B5A"
            stroke="#FFFFFF"
            strokeWidth="3.5"
            className="filter drop-shadow-sm transition-all duration-300"
          />
        </svg>

        {/* Center Big Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2 select-none">
          <div className="flex items-baseline">
            <span className="text-4xl font-extrabold text-ink tracking-tight">
              {percent}
            </span>
            <span className="text-sm font-semibold text-muted ml-0.5">%</span>
          </div>
          <span className="text-xs font-semibold text-muted tracking-wide mt-0.5">
            {label}
          </span>
          {subtext && (
            <span className="text-[11px] font-medium text-muted/80 mt-1">
              {subtext}
            </span>
          )}
        </div>
      </div>

      {/* Key Insight footer */}
      {keyInsight && (
        <div className="w-full mt-2 pt-3 border-t border-card-border text-xs flex items-start space-x-1.5 text-muted">
          <span className="font-bold text-ink">≡ Key Insight:</span>
          <span className="text-ink/80 font-medium truncate">{keyInsight}</span>
        </div>
      )}
    </div>
  );
};

export default SemiGauge;
