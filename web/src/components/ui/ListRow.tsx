import React from 'react';

interface ListRowProps {
  id: string;
  name: string;
  subtext: string;
  status: 'normal' | 'warning' | 'critical';
  isSelected?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
}

export const ListRow: React.FC<ListRowProps> = ({
  name,
  subtext,
  status,
  isSelected,
  onClick,
  icon,
}) => {
  const statusPills = {
    normal: { text: 'Normal', bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' },
    warning: { text: 'Warning', bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' },
    critical: { text: 'Critical', bg: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300' },
  };

  const pill = statusPills[status] || statusPills.normal;

  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-tile border flex items-center justify-between cursor-pointer transition-all ${
        isSelected
          ? 'bg-[#EAF4F0] dark:bg-[#1A332B] border-primary/40 shadow-xs'
          : 'bg-card border-card-border hover:bg-primary-soft/30 hover:border-[#BFD8CF]'
      }`}
    >
      <div className="flex items-center space-x-3 min-w-0">
        <div className="w-10 h-10 rounded-full bg-primary-soft flex items-center justify-center text-primary shrink-0 text-sm font-bold">
          {icon || '🏛️'}
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-xs text-ink truncate">{name}</div>
          <div className="text-[11px] text-muted mt-0.5 font-medium truncate">{subtext}</div>
        </div>
      </div>

      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${pill.bg}`}>
        {pill.text}
      </span>
    </div>
  );
};

export default ListRow;
