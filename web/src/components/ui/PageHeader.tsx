import React from 'react';
import { Building2, Bell, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface PageHeaderProps {
  title?: string;
  breadcrumb?: string;
  onAddDevice?: () => void;
  openAlertsCount?: number;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title = 'Campus Operations',
  breadcrumb = 'Operations & Resource',
  onAddDevice,
  openAlertsCount = 2,
}) => {
  const { isAdmin, isStaff } = useAuth();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 gap-4">
      {/* Left: Breadcrumbs + Title + Live Pulse Pill */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-medium text-muted">
          <Building2 className="w-3.5 h-3.5 text-primary" />
          <span>{breadcrumb}</span>
        </div>

        <div className="flex items-center space-x-3 mt-1.5 flex-wrap">
          <h1 className="text-2xl sm:text-[32px] font-bold text-ink tracking-tight leading-tight">
            {title}
          </h1>

          {/* Live Pulsing Dot Pill */}
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-primary text-xs font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
            </span>
            <span>Live Telemetry</span>
          </div>
        </div>
      </div>

      {/* Right-Side Actions */}
      <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
        {/* View Alerts Pill (Staff only) */}
        {isStaff && (
          <Link
            to="/alerts"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-pill bg-white dark:bg-[#15231F] border border-card-border text-xs font-semibold text-ink shadow-xs hover:border-amber-400 cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5 text-amber-600" />
            <span>Alerts</span>
            {openAlertsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-bold">
                {openAlertsCount}
              </span>
            )}
          </Link>
        )}

        {/* Primary Add Device Pill (Admin only) */}
        {isAdmin && onAddDevice && (
          <button
            type="button"
            onClick={onAddDevice}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-pill bg-primary hover:bg-[#0B5648] text-white text-xs font-bold shadow-pill transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Device</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
