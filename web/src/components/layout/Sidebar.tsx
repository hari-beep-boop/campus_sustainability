import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SidebarItem from './SidebarItem';
import { SidebarSection, ExpandableSidebarItem } from './SidebarGroup';
import {
  PanelLeftClose,
  PanelLeftOpen,
  LayoutDashboard,
  Radio,
  Building2,
  BellRing,
  ChartLine,
  TrendingUp,
  Sparkles,
  FileText,
  Cpu,
  CalendarDays,
  Users,
  Settings,
  Sun,
  Moon,
  ChevronsUpDown,
  ChevronDown,
  LogOut,
  Sliders,
  KeyRound,
  UserCheck,
} from 'lucide-react';

export interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onItemClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  onItemClick,
}) => {
  const { user, logout, isStaff, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Campus switcher state
  const [isCampusOpen, setIsCampusOpen] = useState(false);
  const [selectedCampus, setSelectedCampus] = useState('North Campus');
  const campuses = ['North Campus', 'Central Campus', 'South Campus'];

  // User popover state (upward)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const buildingsData = [
    { name: 'Integrated Learning Center', code: 'ILC', kwh: '742 kWh', status: 'normal' as const },
    { name: 'Lederle Research Tower', code: 'LGRT', kwh: '1,105 kWh', status: 'critical' as const },
    { name: 'W.E.B. Du Bois Library', code: 'LIB', kwh: '1,284 kWh', status: 'warning' as const },
    { name: 'Science Center', code: 'SCI', kwh: '412 kWh', status: 'normal' as const },
    { name: 'Franklin Hall', code: 'FRN', kwh: '169 kWh', status: 'normal' as const },
  ];

  return (
    <aside
      aria-label="Main"
      className={`sticky top-0 h-[100dvh] flex flex-col bg-[#F1F7F5] dark:bg-[#111B19] border-r border-[#DCEAE5] dark:border-[#22332E] transition-all duration-200 select-none z-30 shrink-0 ${
        isCollapsed ? 'w-[76px]' : 'w-[264px]'
      }`}
    >
      {/* 1. Header (pinned) */}
      <div className="p-3.5 border-b border-[#DCEAE5] dark:border-[#22332E] shrink-0 space-y-3">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-[10px] bg-[#0E6B5A] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                🌿
              </div>
              <div className="min-w-0">
                <div className="font-extrabold text-[#16201D] dark:text-[#E6EFEC] text-base leading-tight tracking-tight">
                  EcoPulse
                </div>
                <div className="text-[11px] text-[#8B9B97] dark:text-[#7D918B] font-medium leading-none mt-0.5">
                  Campus Operations
                </div>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div className="w-full flex justify-center">
              <div className="w-8 h-8 rounded-[10px] bg-[#0E6B5A] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                🌿
              </div>
            </div>
          )}

          {/* Collapse toggle button */}
          <button
            type="button"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand sidebar (Ctrl + B)' : 'Collapse sidebar (Ctrl + B)'}
            className={`p-1.5 rounded-lg text-[#8B9B97] hover:text-[#16201D] dark:hover:text-[#E6EFEC] hover:bg-[#E6F1ED] dark:hover:bg-[#182623] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E6B5A] ${
              isCollapsed ? 'mx-auto mt-2' : ''
            }`}
          >
            {isCollapsed ? (
              <PanelLeftOpen size={18} strokeWidth={1.75} />
            ) : (
              <PanelLeftClose size={18} strokeWidth={1.75} />
            )}
          </button>
        </div>

        {/* Campus switcher row (when expanded) */}
        {!isCollapsed && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsCampusOpen(!isCampusOpen)}
              className="w-full h-8 px-2.5 rounded-[10px] border border-[#DCEAE5] dark:border-[#22332E] bg-white/60 dark:bg-[#15231F] text-xs font-semibold text-[#16201D] dark:text-[#E6EFEC] flex items-center justify-between hover:border-[#0E6B5A]/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E6B5A]"
            >
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full bg-[#0E6B5A] shrink-0" />
                <span className="truncate">{selectedCampus}</span>
              </div>
              <ChevronDown size={14} className="text-[#8B9B97] shrink-0" />
            </button>

            {isCampusOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 py-1 rounded-[10px] border border-[#DCEAE5] dark:border-[#22332E] bg-white dark:bg-[#15231F] shadow-soft z-50 animate-in fade-in-0 duration-100">
                {campuses.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setSelectedCampus(c);
                      setIsCampusOpen(false);
                    }}
                    className={`w-full px-3 py-1.5 text-xs text-left font-medium transition-colors ${
                      selectedCampus === c
                        ? 'bg-[#DDF0EA] dark:bg-[#1C3A33] text-[#0E6B5A] dark:text-[#7FD1B9] font-bold'
                        : 'text-[#3E4D49] dark:text-[#B9C8C3] hover:bg-[#E6F1ED] dark:hover:bg-[#182623]'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Menu (scrollable middle) */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-2 space-y-1 overscroll-contain">
        {/* SECTION: MONITOR */}
        <SidebarSection label="MONITOR" isCollapsed={isCollapsed}>
          <SidebarItem
            to="/"
            icon={LayoutDashboard}
            label="Overview"
            isCollapsed={isCollapsed}
            onClick={onItemClick}
          />

          <SidebarItem
            to="/live"
            icon={Radio}
            label="Live Devices"
            isCollapsed={isCollapsed}
            onClick={onItemClick}
            badge={
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#0E6B5A] dark:text-[#7FD1B9]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2F8F6B] animate-pulse" />
                10/12
              </span>
            }
          />

          <ExpandableSidebarItem
            id="buildings"
            icon={Building2}
            label="Buildings"
            isCollapsed={isCollapsed}
            defaultOpen={true}
            onChildClick={onItemClick}
          >
            {buildingsData.map((b) => (
              <SidebarItem
                key={b.code}
                to={`/?building=${b.code}`}
                label={b.name}
                meta={b.kwh}
                statusDot={b.status}
                isSubItem={true}
                onClick={onItemClick}
              />
            ))}
            <NavLink
              to="/"
              onClick={onItemClick}
              className="block pl-[34px] py-1 text-xs text-[#0E6B5A] dark:text-[#7FD1B9] font-semibold hover:underline"
            >
              View all buildings →
            </NavLink>
          </ExpandableSidebarItem>

          <SidebarItem
            to="/alerts"
            icon={BellRing}
            label="Alerts"
            isCollapsed={isCollapsed}
            onClick={onItemClick}
            badge={
              <span
                className="px-1.5 py-0.2 rounded-full text-[11px] font-bold bg-[#FCE6E6] text-[#C23B3B] dark:bg-[#3A1E1E] dark:text-[#F27272]"
                aria-label="7 open alerts"
              >
                7
              </span>
            }
          />
        </SidebarSection>

        {/* SECTION: ANALYZE */}
        <SidebarSection label="ANALYZE" isCollapsed={isCollapsed}>
          <ExpandableSidebarItem
            id="analytics"
            icon={ChartLine}
            label="Analytics"
            isCollapsed={isCollapsed}
            onChildClick={onItemClick}
          >
            {['Energy', 'Water', 'Air Quality', 'Heat-map', 'Leaks'].map((cat) => (
              <SidebarItem
                key={cat}
                to={`/?metric=${cat.toLowerCase()}`}
                label={cat}
                isSubItem={true}
                onClick={onItemClick}
              />
            ))}
          </ExpandableSidebarItem>

          <SidebarItem
            to="/#forecast"
            icon={TrendingUp}
            label="Forecast"
            isCollapsed={isCollapsed}
            onClick={onItemClick}
          />

          <SidebarItem
            to="/ai-planner"
            icon={Sparkles}
            label="AI Planner"
            isCollapsed={isCollapsed}
            onClick={onItemClick}
            badge={
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase bg-[#0E6B5A]/10 text-[#0E6B5A] dark:text-[#7FD1B9]">
                Gemini
              </span>
            }
          />

          <SidebarItem
            to="/reports"
            icon={FileText}
            label="Reports"
            isCollapsed={isCollapsed}
            onClick={onItemClick}
          />
        </SidebarSection>

        {/* SECTION: MANAGE (Only for Facility Manager and Admin) */}
        {isStaff && (
          <SidebarSection label="MANAGE" isCollapsed={isCollapsed}>
            <SidebarItem
              to="/devices"
              icon={Cpu}
              label="Devices"
              isCollapsed={isCollapsed}
              onClick={onItemClick}
            />

            <SidebarItem
              to="/#schedule"
              icon={CalendarDays}
              label="Schedule"
              isCollapsed={isCollapsed}
              onClick={onItemClick}
            />

            {isAdmin && (
              <SidebarItem
                to="/#users"
                icon={Users}
                label="Users & Roles"
                isCollapsed={isCollapsed}
                onClick={onItemClick}
              />
            )}

            <ExpandableSidebarItem
              id="settings"
              icon={Settings}
              label="Settings"
              isCollapsed={isCollapsed}
              onChildClick={onItemClick}
            >
              <SidebarItem
                to="/alerts"
                label="Thresholds"
                isSubItem={true}
                onClick={onItemClick}
              />
              <SidebarItem
                to="/alerts"
                label="Tariff & Emissions"
                isSubItem={true}
                onClick={onItemClick}
              />
              <SidebarItem
                to="/ai-planner"
                label="AI Key"
                isSubItem={true}
                onClick={onItemClick}
              />
              <SidebarItem
                to="/#profile"
                label="Profile"
                isSubItem={true}
                onClick={onItemClick}
              />
            </ExpandableSidebarItem>
          </SidebarSection>
        )}
      </nav>

      {/* 3. Footer (pinned at the bottom) */}
      <div className="p-2.5 border-t border-[#DCEAE5] dark:border-[#22332E] shrink-0 space-y-2">
        {/* System status card (when expanded) */}
        {!isCollapsed && (
          <div className="p-2.5 rounded-[12px] border border-[#DCEAE5] dark:border-[#22332E] bg-white/50 dark:bg-[#15231F] text-[11px] text-[#3E4D49] dark:text-[#B9C8C3] space-y-1.5">
            <div className="font-semibold text-[#16201D] dark:text-[#E6EFEC]">
              12 devices · 10 online · 1 stale · 1 offline
            </div>
            {/* 3-color proportion bar */}
            <div className="w-full h-1.5 rounded-full bg-[#E6F1ED] dark:bg-[#182623] flex overflow-hidden">
              <span className="bg-[#2F8F6B] w-[83%]" title="10 Online" />
              <span className="bg-[#C2702A] w-[8.5%]" title="1 Stale" />
              <span className="bg-[#C23B3B] w-[8.5%]" title="1 Offline" />
            </div>
            <div className="text-[10px] text-[#8B9B97] dark:text-[#7D918B]">
              Last sync 12 s ago
            </div>
          </div>
        )}

        {/* Theme toggle row */}
        <div
          onClick={toggleDarkMode}
          className={`h-9 px-2.5 rounded-[10px] flex items-center transition-colors cursor-pointer text-xs font-medium text-[#3E4D49] dark:text-[#B9C8C3] hover:bg-[#E6F1ED] dark:hover:bg-[#182623] ${
            isCollapsed ? 'justify-center px-0' : 'justify-between'
          }`}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          <div className="flex items-center gap-2">
            {isDarkMode ? (
              <Moon size={16} strokeWidth={1.75} className="text-[#5FD3A2]" />
            ) : (
              <Sun size={16} strokeWidth={1.75} className="text-[#C2702A]" />
            )}
            {!isCollapsed && <span>Dark mode</span>}
          </div>

          {!isCollapsed && (
            <div
              className={`w-8 h-4 rounded-full p-0.5 transition-colors ${
                isDarkMode ? 'bg-[#0E6B5A]' : 'bg-[#DCEAE5]'
              }`}
            >
              <div
                className={`w-3 h-3 rounded-full bg-white transition-transform ${
                  isDarkMode ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </div>
          )}
        </div>

        {/* User row + Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className={`w-full h-10 px-2 rounded-[12px] flex items-center hover:bg-[#E6F1ED] dark:hover:bg-[#182623] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E6B5A] ${
              isCollapsed ? 'justify-center px-0' : 'justify-between gap-2'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-[#0E6B5A] text-white flex items-center justify-center font-bold text-xs shrink-0">
                {user?.username ? user.username.slice(0, 2).toUpperCase() : 'AD'}
              </div>
              {!isCollapsed && (
                <div className="min-w-0 text-left">
                  <div className="text-xs font-bold text-[#16201D] dark:text-[#E6EFEC] truncate leading-tight">
                    {user?.username || 'Rishabh Sharma'}
                  </div>
                  <div className="text-[10px] text-[#8B9B97] dark:text-[#7D918B] capitalize truncate">
                    {user?.role || 'Admin'}
                  </div>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <ChevronsUpDown size={15} className="text-[#8B9B97] shrink-0" />
            )}
          </button>

          {/* Upward User Popover */}
          {isUserMenuOpen && (
            <div
              className="absolute bottom-full left-0 right-0 mb-1.5 py-1.5 rounded-[12px] border border-[#DCEAE5] dark:border-[#22332E] bg-white dark:bg-[#15231F] shadow-soft z-50 animate-in fade-in-0 duration-100 text-xs"
              role="menu"
            >
              <div className="px-3 py-1 text-[11px] font-bold text-[#8B9B97] uppercase tracking-wider border-b border-[#DCEAE5] dark:border-[#22332E] mb-1">
                Account Settings
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  navigate('/#profile');
                }}
                className="w-full px-3 py-1.5 text-left text-[#3E4D49] dark:text-[#B9C8C3] hover:bg-[#E6F1ED] dark:hover:bg-[#182623] flex items-center gap-2"
              >
                <UserCheck size={14} /> Profile
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  navigate('/alerts');
                }}
                className="w-full px-3 py-1.5 text-left text-[#3E4D49] dark:text-[#B9C8C3] hover:bg-[#E6F1ED] dark:hover:bg-[#182623] flex items-center gap-2"
              >
                <Sliders size={14} /> Settings
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  alert('Keyboard shortcuts:\n• Ctrl + B: Toggle sidebar\n• Ctrl + K: Search\n• Esc: Close modals');
                }}
                className="w-full px-3 py-1.5 text-left text-[#3E4D49] dark:text-[#B9C8C3] hover:bg-[#E6F1ED] dark:hover:bg-[#182623] flex items-center gap-2"
              >
                <KeyRound size={14} /> Keyboard shortcuts
              </button>
              <div className="my-1 border-t border-[#DCEAE5] dark:border-[#22332E]" />
              <button
                type="button"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  logout();
                  navigate('/login');
                }}
                className="w-full px-3 py-1.5 text-left text-[#C23B3B] dark:text-[#F27272] hover:bg-[#FCE6E6]/60 dark:hover:bg-[#3A1E1E]/40 font-bold flex items-center gap-2"
              >
                <LogOut size={14} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
