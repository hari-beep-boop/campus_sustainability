import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface CardProps {
  title?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
  onNavigate?: () => void;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  icon,
  children,
  action,
  onNavigate,
  className = '',
}) => {
  return (
    <div
      className={`bg-card border border-card-border rounded-card p-5 shadow-soft transition-all duration-200 hover:border-[#BFD8CF] dark:hover:border-[#344E44] ${className}`}
    >
      {(title || icon || action || onNavigate) && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            {icon && (
              <div className="w-8 h-8 rounded-full bg-primary-soft flex items-center justify-center text-primary">
                {icon}
              </div>
            )}
            {title && (
              <h3 className="font-semibold text-ink text-[15px] tracking-tight">
                {title}
              </h3>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {action}
            {onNavigate && (
              <button
                type="button"
                onClick={onNavigate}
                className="w-9 h-9 rounded-full border border-card-border bg-white dark:bg-[#1A2C27] flex items-center justify-center text-ink hover:bg-primary-soft hover:text-primary transition-colors shadow-xs"
                aria-label="View Details"
              >
                <ArrowUpRight className="w-4 h-4 stroke-[1.8]" />
              </button>
            )}
          </div>
        </div>
      )}

      {children}
    </div>
  );
};

export default Card;
