import React from 'react';
import { NavLink } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

export interface SidebarItemProps {
  to: string;
  icon?: LucideIcon;
  label: string;
  badge?: React.ReactNode;
  isCollapsed?: boolean;
  isSubItem?: boolean;
  onClick?: () => void;
  statusDot?: 'normal' | 'warning' | 'critical';
  meta?: string;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  to,
  icon: Icon,
  label,
  badge,
  isCollapsed = false,
  isSubItem = false,
  onClick,
  statusDot,
  meta,
}) => {
  const getDotColor = (status: 'normal' | 'warning' | 'critical') => {
    switch (status) {
      case 'normal':
        return 'bg-[#2F8F6B] dark:bg-[#5FD3A2]';
      case 'warning':
        return 'bg-[#C2702A] dark:bg-[#F0A35A]';
      case 'critical':
        return 'bg-[#C23B3B] dark:bg-[#F27272]';
    }
  };

  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `group relative flex items-center transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E6B5A] focus-visible:ring-offset-2 select-none ${
          isSubItem
            ? `h-[34px] pl-[34px] pr-2.5 text-[13px] rounded-[10px] ${
                isActive
                  ? 'bg-[#DDF0EA] dark:bg-[#1C3A33] text-[#0E6B5A] dark:text-[#7FD1B9] font-semibold'
                  : 'text-[#3E4D49] dark:text-[#B9C8C3] hover:bg-[#E6F1ED] dark:hover:bg-[#182623] hover:text-[#16201D] dark:hover:text-[#E6EFEC]'
              }`
            : `h-10 px-2.5 text-sm rounded-[12px] ${
                isCollapsed ? 'justify-center px-0' : 'gap-3'
              } ${
                isActive
                  ? 'bg-[#DDF0EA] dark:bg-[#1C3A33] text-[#0E6B5A] dark:text-[#7FD1B9] font-semibold'
                  : 'text-[#3E4D49] dark:text-[#B9C8C3] hover:bg-[#E6F1ED] dark:hover:bg-[#182623] hover:text-[#16201D] dark:hover:text-[#E6EFEC]'
              }`
        }`
      }
    >
      {({ isActive }) => (
        <>
          {/* Vertical guideline for sub-items */}
          {isSubItem && (
            <span
              className="absolute left-[16px] top-0 bottom-0 w-[1px] bg-[#DCEAE5] dark:bg-[#22332E]"
              aria-hidden="true"
            />
          )}

          {/* Status Dot for buildings / sub-items */}
          {statusDot && (
            <span
              className={`w-2 h-2 rounded-full shrink-0 mr-2 ${getDotColor(statusDot)}`}
              aria-hidden="true"
            />
          )}

          {/* Icon */}
          {Icon && (
            <Icon
              size={18}
              strokeWidth={1.75}
              className={`shrink-0 transition-colors ${
                isActive
                  ? 'text-[#0E6B5A] dark:text-[#7FD1B9]'
                  : 'text-[#3E4D49] dark:text-[#B9C8C3] group-hover:text-[#16201D] dark:group-hover:text-[#E6EFEC]'
              }`}
            />
          )}

          {/* Label & Meta (when not collapsed) */}
          {!isCollapsed && (
            <div className="flex-1 min-w-0 flex items-center justify-between gap-1.5 truncate">
              <span className="truncate">{label}</span>
              {meta && (
                <span className="text-[11px] text-[#8B9B97] dark:text-[#7D918B] font-normal shrink-0">
                  {meta}
                </span>
              )}
            </div>
          )}

          {/* Right Badge in expanded mode */}
          {!isCollapsed && badge && <div className="shrink-0">{badge}</div>}

          {/* Collapsed Badge Dot indicator */}
          {isCollapsed && badge && (
            <span
              className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#C23B3B] dark:bg-[#F27272]"
              aria-hidden="true"
            />
          )}

          {/* Collapsed Tooltip on hover */}
          {isCollapsed && (
            <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#16201D] text-[#F3F9F7] text-xs font-medium rounded-md shadow-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50">
              {label}
            </div>
          )}
        </>
      )}
    </NavLink>
  );
};

export default SidebarItem;
