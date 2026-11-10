import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import TickMeter from './TickMeter';

interface StatTileProps {
  title: string;
  subtitle?: string;
  value: number | string;
  unit?: string;
  label: string;
  percent: number;
  tone?: 'energy' | 'air' | 'water' | 'danger' | 'warn';
  onNavigate?: () => void;
  className?: string;
}

export const StatTile: React.FC<StatTileProps> = ({
  title,
  subtitle,
  value,
  unit = '%',
  label,
  percent,
  tone = 'energy',
  onNavigate,
  className = '',
}) => {
  return (
    <div
      className={`bg-card border border-card-border rounded-card p-5 shadow-soft flex flex-col justify-between hover:border-[#BFD8CF] dark:hover:border-[#344E44] transition-all ${className}`}
    >
      {/* Title & ↗ Button Row */}
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold text-ink text-sm tracking-tight leading-snug">
            {title}
          </h4>
          {subtitle && (
            <p className="text-[11px] text-muted mt-0.5 font-medium">{subtitle}</p>
          )}
        </div>

        {onNavigate && (
          <button
            type="button"
            onClick={onNavigate}
            className="w-8 h-8 rounded-full border border-card-border bg-white dark:bg-[#1A2C27] flex items-center justify-center text-ink hover:bg-primary-soft hover:text-primary transition-colors ml-2 shrink-0"
            aria-label={`View details for ${title}`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[1.8]" />
          </button>
        )}
      </div>

      {/* Main KPI Row: Big Number + Superscript + Label */}
      <div className="my-3">
        <div className="flex items-baseline space-x-1">
          <span className="text-3xl sm:text-[38px] font-extrabold text-ink tracking-tight leading-none">
            {value}
          </span>
          {unit && (
            <span className="text-sm font-semibold text-muted tracking-tight">
              {unit}
            </span>
          )}
          <span className="text-sm font-normal text-muted ml-1.5 truncate">
            {label}
          </span>
        </div>
      </div>

      {/* Tick Meter */}
      <div className="pt-1">
        <TickMeter percent={percent} tone={tone} ariaLabel={`${title} ${value}${unit} ${label}`} />
      </div>
    </div>
  );
};

export default StatTile;
