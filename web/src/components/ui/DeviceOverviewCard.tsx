import React, { useState } from 'react';
import { ArrowUpRight, Cpu, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DeviceOverviewCardProps {
  onNavigate?: () => void;
  className?: string;
}

export const DeviceOverviewCard: React.FC<DeviceOverviewCardProps> = ({
  onNavigate,
  className = '',
}) => {
  const [mode, setMode] = useState<'device' | 'room'>('device');

  return (
    <div
      className={`bg-card border border-card-border rounded-card p-5 shadow-soft flex flex-col justify-between hover:border-[#BFD8CF] transition-all ${className}`}
    >
      {/* Header Row: Title + Segmented Switch + ↗ Button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-primary-soft flex items-center justify-center text-primary">
            <Cpu className="w-4 h-4 stroke-[1.8]" />
          </div>
          <h3 className="font-semibold text-ink text-sm sm:text-[15px] tracking-tight">
            Device &amp; Node Overview
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          {/* Segmented Switch */}
          <div className="flex items-center p-0.5 rounded-pill bg-[#E6F1ED] dark:bg-[#1C322B] text-[11px] font-bold text-muted">
            <button
              type="button"
              onClick={() => setMode('device')}
              className={`px-3 py-1 rounded-pill transition-all ${
                mode === 'device'
                  ? 'bg-white dark:bg-[#25453B] text-ink shadow-xs'
                  : 'hover:text-ink'
              }`}
            >
              Device
            </button>
            <button
              type="button"
              onClick={() => setMode('room')}
              className={`px-3 py-1 rounded-pill transition-all ${
                mode === 'room'
                  ? 'bg-white dark:bg-[#25453B] text-ink shadow-xs'
                  : 'hover:text-ink'
              }`}
            >
              Room
            </button>
          </div>

          {onNavigate && (
            <button
              type="button"
              onClick={onNavigate}
              className="w-8 h-8 rounded-full border border-card-border bg-white dark:bg-[#1A2C27] flex items-center justify-center text-ink hover:bg-primary-soft hover:text-primary transition-colors"
              aria-label="View Details"
            >
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[1.8]" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col sm:flex-row items-center gap-5 my-2">
        {/* Soft Radial Enclosure Mockup / Visual */}
        <div className="relative w-40 h-36 rounded-tile bg-gradient-to-b from-[#E7F3EF] to-[#D5ECE5] dark:from-[#172D26] dark:to-[#12221D] flex items-center justify-center overflow-hidden border border-card-border/60 shrink-0">
          <div className="absolute w-24 h-24 bg-primary/20 rounded-full blur-xl" />
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-5xl drop-shadow-sm">🎛️</span>
            <span className="text-[10px] font-mono font-bold text-primary mt-1 bg-white/70 dark:bg-black/30 px-2 py-0.5 rounded-full">
              ESP32 Node
            </span>
          </div>
        </div>

        {/* Text Details */}
        <div className="flex-1 min-w-0">
          <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider mb-1.5">
            <span>● 3 sensors active</span>
          </div>

          <h4 className="font-bold text-ink text-base tracking-tight truncate">
            {mode === 'device' ? 'Du Bois Library Node · LIB-01' : 'Room 204 · Study Commons'}
          </h4>

          <p className="text-xs text-muted font-medium mt-1">
            {mode === 'device'
              ? '📍 Du Bois Library · Room 204 • ⚡💧🌫 3 telemetry feeds'
              : '👥 Capacity: 45 students • 480 m² • Air Exchange: VAV'}
          </p>

          <p className="text-xs text-ink/70 mt-2 line-clamp-2 leading-relaxed">
            {mode === 'device'
              ? 'Multi-sensor node sampling ACS721 power draw, pulse water flow, and NDIR CO₂ every 10s.'
              : 'Today: 24.5 kWh consumed, 380 L water draw, 720 ppm average air quality band.'}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2.5 mt-3">
            <Link
              to="/live"
              className="px-4 py-1.5 rounded-pill bg-primary hover:bg-[#0B5648] text-white text-xs font-bold shadow-pill transition-all"
            >
              View Live
            </Link>
            <Link
              to="/devices"
              className="px-4 py-1.5 rounded-pill bg-white dark:bg-[#1A2C27] border border-card-border text-ink hover:bg-primary-soft text-xs font-semibold transition-all"
            >
              Calibrate
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-card-border flex items-center justify-between text-xs text-muted">
        <div className="flex items-center space-x-1.5 text-primary font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Last seen 12 seconds ago</span>
        </div>
        <span className="font-mono text-[11px]">Firmware v1.0.4</span>
      </div>
    </div>
  );
};

export default DeviceOverviewCard;
