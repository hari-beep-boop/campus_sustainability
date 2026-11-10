import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Sparkles,
} from 'lucide-react';
import DateDropdown from '../ui/DateDropdown';

export interface TopBarProps {
  onOpenMobileSidebar: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenMobileSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global Ctrl+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute breadcrumb based on current path
  const getBreadcrumb = () => {
    switch (location.pathname) {
      case '/':
        return 'Operations / Campus Operations';
      case '/live':
        return 'Operations / Live Telemetry';
      case '/ai-planner':
        return 'Analytics / AI Implementation Planner';
      case '/reports':
        return 'Analytics / Performance Reports';
      case '/alerts':
        return 'Governance / Alerts & Thresholds';
      case '/devices':
        return 'Management / IoT Hardware Fleet';
      default:
        return 'Operations / Campus Operations';
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase();
    if (q.includes('ai') || q.includes('plan')) {
      navigate('/ai-planner');
    } else if (q.includes('live') || q.includes('sensor')) {
      navigate('/live');
    } else if (q.includes('alert')) {
      navigate('/alerts');
    } else if (q.includes('report') || q.includes('pdf')) {
      navigate('/reports');
    } else if (q.includes('device')) {
      navigate('/devices');
    } else {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    }
    setSearchQuery('');
  };

  return (
    <header className="h-16 px-4 sm:px-6 bg-[#E9F1EE] dark:bg-[#0B1412] border-b border-[#DCEAE5] dark:border-[#22332E] flex items-center justify-between gap-3 shrink-0 sticky top-0 z-20">
      {/* Left: Mobile hamburger + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          aria-label="Open Navigation Drawer"
          className="lg:hidden p-2 rounded-lg text-[#3E4D49] dark:text-[#B9C8C3] hover:bg-[#E6F1ED] dark:hover:bg-[#182623] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E6B5A]"
        >
          <Menu size={20} strokeWidth={2} />
        </button>

        <div className="hidden sm:flex items-center text-xs font-semibold text-[#8B9B97] dark:text-[#7D918B] truncate">
          <span className="truncate">{getBreadcrumb()}</span>
        </div>
      </div>

      {/* Middle: Search Field (Ctrl + K) */}
      <form
        onSubmit={handleSearchSubmit}
        className="flex-1 max-w-md mx-2 relative"
      >
        <div className="relative flex items-center">
          <Search
            size={16}
            className="absolute left-3 text-[#8B9B97] pointer-events-none"
          />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search buildings, devices, alerts…"
            className="w-full h-9 pl-9 pr-14 text-xs rounded-full border border-[#DCEAE5] dark:border-[#22332E] bg-white/70 dark:bg-[#15231F] text-[#16201D] dark:text-[#E6EFEC] placeholder:text-[#8B9B97] focus:outline-none focus:border-[#0E6B5A] focus:ring-1 focus:ring-[#0E6B5A] transition-all"
          />
          <kbd className="hidden sm:inline-flex items-center absolute right-2.5 px-1.5 py-0.5 text-[10px] font-mono text-[#8B9B97] bg-[#E9F1EE] dark:bg-[#111B19] border border-[#DCEAE5] dark:border-[#22332E] rounded">
            Ctrl K
          </kbd>
        </div>
      </form>

      {/* Right Actions: Date pill, View Alerts, AI Sparkle, Bell */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Interactive Date Range Dropdown */}
        <div className="hidden md:block">
          <DateDropdown pillSize="sm" align="right" />
        </div>

        {/* View Alerts button */}
        <button
          type="button"
          onClick={() => navigate('/alerts')}
          className="hidden sm:inline-flex items-center h-8 px-3 rounded-full border border-[#DCEAE5] dark:border-[#22332E] bg-white/70 dark:bg-[#15231F] text-xs font-bold text-[#16201D] dark:text-[#E6EFEC] hover:bg-[#E6F1ED] dark:hover:bg-[#182623] transition-colors shadow-2xs"
        >
          View Alerts
        </button>

        {/* AI Sparkle button (pink-tinted) */}
        <button
          type="button"
          onClick={() => navigate('/ai-planner')}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-[#D9465F]/10 hover:bg-[#D9465F]/20 text-[#D9465F] border border-[#D9465F]/30 text-xs font-bold transition-all shadow-2xs"
          title="Open Gemini AI Implementation Planner"
        >
          <Sparkles size={14} />
          <span className="hidden xs:inline">AI Planner</span>
        </button>

        {/* Alerts Bell with count */}
        <button
          type="button"
          onClick={() => navigate('/alerts')}
          className="relative p-2 rounded-full border border-[#DCEAE5] dark:border-[#22332E] bg-white/70 dark:bg-[#15231F] text-[#3E4D49] dark:text-[#B9C8C3] hover:text-[#16201D] dark:hover:text-[#E6EFEC] hover:bg-[#E6F1ED] dark:hover:bg-[#182623] transition-colors"
          title="7 unread alerts"
          aria-label="7 open alerts"
        >
          <Bell size={16} strokeWidth={1.75} />
          <span className="absolute -top-1 -right-1 px-1.5 py-0.2 min-w-[18px] text-[10px] font-extrabold text-white bg-[#C23B3B] dark:bg-[#F27272] rounded-full flex items-center justify-center shadow-xs">
            7
          </span>
        </button>
      </div>
    </header>
  );
};

export default TopBar;
