import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Check } from 'lucide-react';
import { useDateFilter, DateFilterOption } from '../../context/DateFilterContext';

export interface DateDropdownProps {
  className?: string;
  align?: 'left' | 'right';
  pillSize?: 'sm' | 'md';
}

export const DateDropdown: React.FC<DateDropdownProps> = ({
  className = '',
  align = 'right',
  pillSize = 'sm',
}) => {
  const { selectedRange, selectedRangeLabel, setSelectedRange } = useDateFilter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const options: { id: DateFilterOption; label: string; subtext: string }[] = [
    { id: 'today', label: 'Today', subtext: '28 Oct 2026 (Present)' },
    { id: 'yesterday', label: 'Yesterday', subtext: '27 Oct 2026' },
    { id: 'week', label: 'Last 7 Days', subtext: '22 – 28 Oct 2026' },
    { id: 'month', label: 'This Month', subtext: 'October 2026' },
  ];

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`inline-flex items-center gap-1.5 rounded-full border border-card-border bg-white/80 dark:bg-[#15231F] text-xs font-bold text-ink shadow-2xs hover:border-primary/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
          pillSize === 'sm' ? 'h-8 px-3' : 'px-3.5 py-2'
        }`}
      >
        <Calendar size={13} className="text-primary shrink-0" />
        <span>{selectedRangeLabel}</span>
        <ChevronDown
          size={13}
          className={`text-muted transition-transform duration-150 ${
            isOpen ? 'rotate-180 text-primary' : ''
          }`}
        />
      </button>

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className={`absolute top-full mt-1.5 w-60 rounded-tile border border-card-border bg-white dark:bg-[#15231F] shadow-frame p-1.5 z-50 animate-in fade-in-0 duration-100 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted border-b border-card-border/60 mb-1">
            Select Timeframe
          </div>

          <div className="space-y-0.5">
            {options.map((opt) => {
              const isSelected = selectedRange === opt.id;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setSelectedRange(opt.id);
                    setIsOpen(false);
                  }}
                  role="option"
                  aria-selected={isSelected}
                  className={`w-full px-3 py-2 rounded-[10px] text-left text-xs transition-colors flex items-center justify-between ${
                    isSelected
                      ? 'bg-primary-soft text-primary font-bold'
                      : 'text-ink hover:bg-frame text-[#3E4D49] dark:text-[#B9C8C3]'
                  }`}
                >
                  <div>
                    <div className="font-semibold">{opt.label}</div>
                    <div className="text-[10px] text-muted font-normal mt-0.5">
                      {opt.subtext}
                    </div>
                  </div>
                  {isSelected && <Check size={14} className="text-primary shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DateDropdown;
