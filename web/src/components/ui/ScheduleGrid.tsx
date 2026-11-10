import React from 'react';

export interface ScheduleEvent {
  id: string;
  time: string; // e.g. "07:00 AM"
  hour: number; // 7, 8, 9...
  title: string;
  subtitle: string;
  category: 'maintenance' | 'calibration' | 'peak' | 'audit' | 'water' | 'air' | 'alert';
  icon?: React.ReactNode;
}

interface ScheduleGridProps {
  events: ScheduleEvent[];
  selectedCategory?: string;
  className?: string;
  selectedDate?: string;
}

export const ScheduleGrid: React.FC<ScheduleGridProps> = ({
  events,
  selectedCategory = 'all',
  className = '',
  selectedDate = '2026-10-28',
}) => {
  const isFuture = selectedDate > '2026-10-28';
  const hours = [
    { label: '07:00 AM', hour: 7 },
    { label: '08:00 AM', hour: 8 },
    { label: '09:00 AM', hour: 9 },
    { label: '10:00 AM', hour: 10 },
    { label: '11:00 AM', hour: 11 },
    { label: '01:00 PM', hour: 13 },
    { label: '02:00 PM', hour: 14 },
    { label: '03:30 PM', hour: 15 },
    { label: '05:00 PM', hour: 17 },
  ];

  const filteredEvents =
    selectedCategory === 'all'
      ? events
      : events.filter((e) => e.category.toLowerCase() === selectedCategory.toLowerCase());

  const categoryBadgeColors = {
    maintenance: 'bg-[#0E6B5A] text-white',
    calibration: 'bg-[#1F7A9C] text-white',
    peak: 'bg-[#C2702A] text-white',
    audit: 'bg-[#556964] text-white',
    water: 'bg-[#2980B9] text-white',
    air: 'bg-[#27AE60] text-white',
    alert: 'bg-[#C23B3B] text-white',
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Future Date Indicator (No data of next day) */}
      {isFuture && (
        <div className="p-3 mb-3 rounded-tile bg-[#EAF2EF] dark:bg-[#162722] border border-[#DCEAE5] dark:border-[#24362F] flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-[#556964] dark:text-[#A0B3AD]">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <span className="font-semibold text-ink">Upcoming Day ({selectedDate})</span>
            <span>—</span>
            <span>Next-day operations locked. No data to display.</span>
          </div>
          <span className="text-[10px] font-bold text-primary uppercase bg-primary-soft dark:bg-emerald-950/80 px-2 py-0.5 rounded-full shrink-0">
            Upcoming
          </span>
        </div>
      )}

      {hours.map((h) => {
        const hourEvents = filteredEvents.filter((e) => e.hour === h.hour);

        return (
          <div key={h.label} className="flex items-start space-x-3 text-xs">
            {/* Time Label */}
            <div className="w-16 pt-2 font-medium text-muted text-[11px] shrink-0">
              {h.label}
            </div>

            {/* Event Columns / Hatched Empty Slots */}
            <div className="flex-1 min-h-[52px]">
              {hourEvents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {hourEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className="bg-white dark:bg-[#182A25] border border-card-border rounded-tile p-2.5 flex items-center justify-between shadow-xs transition-transform hover:-translate-y-0.5"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-semibold text-ink text-xs truncate">
                          {evt.title}
                        </div>
                        <div className="text-[11px] text-muted flex items-center space-x-1 mt-0.5 truncate">
                          <span>↳</span>
                          <span>{evt.subtitle}</span>
                        </div>
                      </div>

                      {/* Round category icon pill on right */}
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] shadow-xs ${
                          categoryBadgeColors[evt.category] || 'bg-primary text-white'
                        }`}
                      >
                        {evt.category === 'maintenance' && '⚙️'}
                        {evt.category === 'calibration' && '🎯'}
                        {evt.category === 'peak' && '⚡'}
                        {evt.category === 'audit' && '📋'}
                        {evt.category === 'water' && '💧'}
                        {evt.category === 'air' && '🍃'}
                        {evt.category === 'alert' && '⚠️'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Hatched diagonal stripe for empty slot */
                <div className="w-full h-12 rounded-tile border border-card-border/60 hatched-slot opacity-60" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ScheduleGrid;
