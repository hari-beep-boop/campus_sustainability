import React, { createContext, useContext, useState } from 'react';

export type DateFilterOption = 'today' | 'yesterday' | 'week' | 'month';

export interface DateFilterContextType {
  selectedRange: DateFilterOption;
  selectedRangeLabel: string;
  selectedDate: string; // 'YYYY-MM-DD'
  setSelectedRange: (range: DateFilterOption) => void;
  setSelectedDate: (dateStr: string) => void;
  isToday: boolean;
  isFutureDate: (dateStr: string) => boolean;
}

const DateFilterContext = createContext<DateFilterContextType | undefined>(undefined);

// System present date is Oct 28, 2026 (Wednesday)
export const PRESENT_DAY = '2026-10-28';

export const DateFilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedRange, setSelectedRangeState] = useState<DateFilterOption>('today');
  const [selectedDate, setSelectedDateState] = useState<string>(PRESENT_DAY);

  const rangeLabels: Record<DateFilterOption, string> = {
    today: 'Today',
    yesterday: 'Yesterday',
    week: 'Last 7 Days',
    month: 'This Month',
  };

  const setSelectedRange = (range: DateFilterOption) => {
    setSelectedRangeState(range);
    if (range === 'today') {
      setSelectedDateState(PRESENT_DAY);
    } else if (range === 'yesterday') {
      setSelectedDateState('2026-10-27');
    } else {
      setSelectedDateState(PRESENT_DAY);
    }
  };

  const setSelectedDate = (dateStr: string) => {
    setSelectedDateState(dateStr);
    if (dateStr === PRESENT_DAY) {
      setSelectedRangeState('today');
    } else if (dateStr === '2026-10-27') {
      setSelectedRangeState('yesterday');
    } else if (dateStr > PRESENT_DAY) {
      setSelectedRangeState('today');
    } else {
      setSelectedRangeState('week');
    }
  };

  const isToday = selectedDate === PRESENT_DAY;
  const isFutureDate = (dateStr: string) => dateStr > PRESENT_DAY;

  const currentLabel =
    selectedDate === PRESENT_DAY
      ? 'Today'
      : selectedDate === '2026-10-27'
      ? 'Yesterday'
      : rangeLabels[selectedRange] || 'Today';

  return (
    <DateFilterContext.Provider
      value={{
        selectedRange,
        selectedRangeLabel: currentLabel,
        selectedDate,
        setSelectedRange,
        setSelectedDate,
        isToday,
        isFutureDate,
      }}
    >
      {children}
    </DateFilterContext.Provider>
  );
};

export const useDateFilter = () => {
  const context = useContext(DateFilterContext);
  if (!context) {
    throw new Error('useDateFilter must be used within a DateFilterProvider');
  }
  return context;
};

export default DateFilterContext;
