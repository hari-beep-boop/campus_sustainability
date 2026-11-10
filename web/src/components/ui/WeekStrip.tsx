import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface DayItem {
  dayName: string; // Sun, Mon, Tue...
  date: number; // 25, 26, 27, 28...
  fullDate: string; // YYYY-MM-DD
}

interface WeekStripProps {
  days: DayItem[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
}

export const WeekStrip: React.FC<WeekStripProps> = ({
  days,
  selectedDate,
  onSelectDate,
  onPrevWeek,
  onNextWeek,
}) => {
  return (
    <div className="flex items-center justify-between space-x-1 sm:space-x-2 py-2">
      {onPrevWeek && (
        <button
          type="button"
          onClick={onPrevWeek}
          className="w-7 h-7 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-primary-soft transition-colors"
          aria-label="Previous week"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      <div className="flex items-center justify-between flex-1 gap-1.5 sm:gap-2">
        {days.map((item) => {
          const isSelected = item.fullDate === selectedDate;
          const isToday = item.fullDate === '2026-10-28';
          const isFuture = item.fullDate > '2026-10-28';

          return (
            <button
              key={item.fullDate}
              type="button"
              onClick={() => onSelectDate(item.fullDate)}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 sm:py-2 px-1 rounded-tile transition-all duration-200 cursor-pointer relative ${
                isSelected
                  ? 'bg-gradient-to-b from-[#E6F5F1] to-[#CEECE4] dark:from-[#1E3D35] dark:to-[#172E28] border border-primary/40 shadow-pill text-ink ring-2 ring-primary/20'
                  : isFuture
                  ? 'text-muted/75 hover:bg-primary-soft/30 hover:text-ink'
                  : 'text-muted hover:bg-primary-soft/40 hover:text-ink'
              }`}
            >
              {/* Present Day Indicator Pill */}
              {isToday && (
                <span className="text-[8px] font-black uppercase tracking-wider text-primary px-1 rounded-full bg-primary-soft dark:bg-emerald-950/80 mb-0.5">
                  Today
                </span>
              )}
              {isFuture && !isToday && (
                <span className="text-[8px] font-semibold tracking-wider text-muted/60 uppercase mb-0.5">
                  Next
                </span>
              )}
              <span
                className={`text-[11px] uppercase tracking-tight ${
                  isToday ? 'font-black text-primary' : 'font-medium'
                }`}
              >
                {item.dayName}
              </span>
              <span
                className={`text-base sm:text-lg font-bold mt-0.5 ${
                  isToday ? 'text-primary' : isFuture ? 'text-ink/80' : 'text-ink'
                }`}
              >
                {item.date}
              </span>
              {isSelected ? (
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-transparent mt-1" />
              )}
            </button>
          );
        })}
      </div>

      {onNextWeek && (
        <button
          type="button"
          onClick={onNextWeek}
          className="w-7 h-7 rounded-full flex items-center justify-center text-muted hover:text-ink hover:bg-primary-soft transition-colors"
          aria-label="Next week"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default WeekStrip;
