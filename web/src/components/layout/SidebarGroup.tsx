import React, { useState, useEffect } from 'react';
import { ChevronRight, LucideIcon } from 'lucide-react';

export interface ExpandableItemProps {
  id: string;
  icon: LucideIcon;
  label: string;
  badge?: React.ReactNode;
  isCollapsed?: boolean;
  children: React.ReactNode;
  defaultOpen?: boolean;
  onChildClick?: () => void;
}

export const ExpandableSidebarItem: React.FC<ExpandableItemProps> = ({
  id,
  icon: Icon,
  label,
  badge,
  isCollapsed = false,
  children,
  defaultOpen = false,
  onChildClick,
}) => {
  const [isOpen, setIsOpen] = useState(() => {
    try {
      const saved = localStorage.getItem(`sidebar_expand_${id}`);
      return saved !== null ? JSON.parse(saved) : defaultOpen;
    } catch {
      return defaultOpen;
    }
  });

  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);

  // Auto-expand if current route matches sub-items (or persists state)
  useEffect(() => {
    try {
      localStorage.setItem(`sidebar_expand_${id}`, JSON.stringify(isOpen));
    } catch {
      // ignore
    }
  }, [id, isOpen]);

  return (
    <div
      className="relative"
      onMouseEnter={() => isCollapsed && setIsFlyoutOpen(true)}
      onMouseLeave={() => isCollapsed && setIsFlyoutOpen(false)}
    >
      <button
        type="button"
        onClick={() => !isCollapsed && setIsOpen((prev: boolean) => !prev)}
        aria-expanded={isOpen}
        className={`group w-full flex items-center transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E6B5A] focus-visible:ring-offset-2 select-none h-10 px-2.5 text-sm rounded-[12px] text-[#3E4D49] dark:text-[#B9C8C3] hover:bg-[#E6F1ED] dark:hover:bg-[#182623] hover:text-[#16201D] dark:hover:text-[#E6EFEC] ${
          isCollapsed ? 'justify-center px-0' : 'gap-3'
        }`}
      >
        <Icon
          size={18}
          strokeWidth={1.75}
          className="shrink-0 text-[#3E4D49] dark:text-[#B9C8C3] group-hover:text-[#16201D] dark:group-hover:text-[#E6EFEC]"
        />

        {!isCollapsed && (
          <>
            <span className="flex-1 text-left truncate font-medium">{label}</span>
            {badge && <div className="shrink-0">{badge}</div>}
            <ChevronRight
              size={15}
              strokeWidth={2}
              className={`shrink-0 text-[#8B9B97] transition-transform duration-200 ease-in-out ${
                isOpen ? 'rotate-90 text-[#0E6B5A] dark:text-[#7FD1B9]' : ''
              }`}
            />
          </>
        )}
      </button>

      {/* Expanded sub-items accordion */}
      {!isCollapsed && (
        <div
          className={`grid transition-[grid-template-rows] duration-200 ease-in-out motion-reduce:transition-none ${
            isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <div className="overflow-hidden">
            <div className="space-y-1 pt-1 pb-0.5">{children}</div>
          </div>
        </div>
      )}

      {/* Collapsed flyout panel on hover */}
      {isCollapsed && isFlyoutOpen && (
        <div
          className="absolute left-full top-0 ml-2 w-64 rounded-[14px] border border-[#DCEAE5] dark:border-[#22332E] bg-[#F1F7F5] dark:bg-[#111B19] shadow-soft p-2.5 z-50 animate-in fade-in-0 duration-150"
          role="menu"
        >
          <div className="px-2 py-1 text-xs font-bold text-[#16201D] dark:text-[#E6EFEC] border-b border-[#DCEAE5] dark:border-[#22332E] mb-1.5 flex items-center justify-between">
            <span>{label}</span>
            {badge && <div>{badge}</div>}
          </div>
          <div
            className="space-y-1"
            onClick={() => {
              setIsFlyoutOpen(false);
              onChildClick?.();
            }}
          >
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export interface SidebarSectionProps {
  label: string;
  isCollapsed?: boolean;
  children: React.ReactNode;
}

export const SidebarSection: React.FC<SidebarSectionProps> = ({
  label,
  isCollapsed = false,
  children,
}) => {
  return (
    <div className="mt-5 first:mt-1 space-y-1">
      {isCollapsed ? (
        <div className="my-2 mx-3 border-t border-[#DCEAE5] dark:border-[#22332E]" />
      ) : (
        <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#8B9B97] dark:text-[#7D918B] select-none">
          {label}
        </div>
      )}
      <div className="space-y-1">{children}</div>
    </div>
  );
};
