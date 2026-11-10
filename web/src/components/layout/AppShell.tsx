import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  // Responsive sidebar collapse:
  // >= 1280px: expanded by default
  // 1024-1279px: collapsed by default
  // < 1024px: hidden, opened via drawer
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem('sidebar_collapsed');
      if (saved !== null) return JSON.parse(saved);
      if (typeof window !== 'undefined') {
        return window.innerWidth >= 1024 && window.innerWidth < 1280;
      }
      return false;
    } catch {
      return false;
    }
  });

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Synchronize localStorage with collapse state
  const handleToggleCollapse = () => {
    setIsCollapsed((prev: boolean) => {
      const next = !prev;
      try {
        localStorage.setItem('sidebar_collapsed', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Keyboard shortcut listener: Ctrl + B toggles collapse, Esc closes drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        handleToggleCollapse();
      } else if (e.key === 'Escape') {
        setIsMobileDrawerOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileDrawerOpen]);

  return (
    <div className="min-h-screen bg-[#E9F1EE] dark:bg-[#0B1412] text-[#16201D] dark:text-[#E6EFEC] flex transition-colors duration-150 overflow-x-hidden">
      {/* Desktop / Tablet Sidebar (sticky 100dvh) */}
      <div className="hidden lg:block shrink-0">
        <Sidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />
      </div>

      {/* Mobile Drawer (under 1024px) */}
      {isMobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Dim Overlay (no blur per spec) */}
          <div
            className="fixed inset-0 bg-[#0E1E1A]/35 transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer panel from left */}
          <div
            className="relative z-10 w-[min(86vw,320px)] h-full bg-[#F1F7F5] dark:bg-[#111B19] shadow-2xl flex flex-col animate-in slide-in-from-left duration-200"
            role="dialog"
            aria-modal="true"
          >
            <Sidebar
              isCollapsed={false}
              onToggleCollapse={() => setIsMobileDrawerOpen(false)}
              onItemClick={() => setIsMobileDrawerOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Independent Content Column */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <TopBar onOpenMobileSidebar={() => setIsMobileDrawerOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>

        <footer className="py-3 px-6 text-center text-xs text-[#8B9B97] dark:text-[#7D918B] border-t border-[#DCEAE5] dark:border-[#22332E] flex flex-col sm:flex-row justify-between items-center gap-2 shrink-0">
          <span>Campus Sustainability Tracker v2 (EcoPulse) • MERN + IoT + Gemini AI</span>
          <span className="font-semibold text-[#0E6B5A] dark:text-[#7FD1B9]">
            Greenwood Central Campus
          </span>
        </footer>
      </div>
    </div>
  );
};

export default AppShell;
