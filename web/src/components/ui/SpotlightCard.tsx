import React from 'react';
import { Building2, MapPin, Hash } from 'lucide-react';

export interface SpotlightBuilding {
  id: string;
  code: string;
  name: string;
  type: string;
  location: string;
  status: 'normal' | 'warning' | 'critical';
  todayKwh: number;
  todayL: number;
  avgCo2: number;
}

interface SpotlightCardProps {
  building: SpotlightBuilding;
  className?: string;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({ building, className = '' }) => {
  const statusBadges = {
    normal: { text: 'Normal', bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' },
    warning: { text: 'Warning', bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' },
    critical: { text: 'Critical', bg: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300' },
  };

  const badge = statusBadges[building.status] || statusBadges.normal;

  return (
    <div
      className={`bg-card border border-card-border rounded-card p-5 shadow-soft flex flex-col justify-between ${className}`}
    >
      {/* Top Graphic / Radial Glow Area */}
      <div className="relative w-full h-40 rounded-tile bg-gradient-to-b from-[#E7F3EF] to-[#D5ECE5] dark:from-[#172D26] dark:to-[#12221D] flex items-center justify-center overflow-hidden border border-card-border/60">
        {/* Soft Radial Mint Glow */}
        <div className="absolute w-28 h-28 bg-primary/20 rounded-full blur-2xl" />

        {/* 3D / Architectural Symbol */}
        <div className="relative z-10 flex flex-col items-center">
          <span className="text-6xl drop-shadow-md">🏛️</span>
        </div>

        {/* Status Pill on top right of image */}
        <div className="absolute top-3 right-3">
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${badge.bg}`}>
            {badge.text}
          </span>
        </div>
      </div>

      {/* Building Details */}
      <div className="mt-4">
        <h3 className="font-bold text-ink text-lg tracking-tight leading-snug">
          {building.name}
        </h3>

        {/* Meta Row: 3 items separated by thin dividers */}
        <div className="flex items-center space-x-2 text-xs text-muted font-medium mt-1.5 flex-wrap">
          <span className="flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-primary" />
            {building.type}
          </span>
          <span className="text-card-border">•</span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            {building.location}
          </span>
          <span className="text-card-border">•</span>
          <span className="flex items-center gap-0.5">
            <Hash className="w-3 h-3 text-muted" />
            {building.code}
          </span>
        </div>

        {/* Mini stats row */}
        <div className="mt-4 pt-3 border-t border-card-border grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <div className="text-[10px] uppercase font-bold text-muted">Energy</div>
            <div className="font-bold text-ink mt-0.5">{building.todayKwh.toLocaleString()} <span className="text-[10px] font-normal text-muted">kWh</span></div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-muted">Water</div>
            <div className="font-bold text-ink mt-0.5">{building.todayL.toLocaleString()} <span className="text-[10px] font-normal text-muted">L</span></div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-muted">Air CO₂</div>
            <div className="font-bold text-ink mt-0.5">{building.avgCo2} <span className="text-[10px] font-normal text-muted">ppm</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpotlightCard;
