import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, GraduationCap, LineChart, Settings, User } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-zinc-950 text-japan-charcoal-900 dark:text-zinc-100 flex flex-col md:flex-row">
      {/* Sidebar for Desktop & Collapsible Drawer for Mobile */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0 pb-16 md:pb-0">
        <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-japan-charcoal-200/80 dark:border-zinc-800 md:hidden flex items-center justify-around py-2 px-1">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-semibold transition-colors ${
              isActive ? 'text-japan-indigo-800 dark:text-indigo-400' : 'text-japan-charcoal-400'
            }`
          }
        >
          <LayoutDashboard className="w-4 h-4 mb-0.5" />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/level/n5"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-semibold transition-colors ${
              isActive || location.pathname.startsWith('/level')
                ? 'text-japan-indigo-800 dark:text-indigo-400'
                : 'text-japan-charcoal-400'
            }`
          }
        >
          <GraduationCap className="w-4 h-4 mb-0.5" />
          <span>Levels</span>
        </NavLink>

        <NavLink
          to="/progress"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-semibold transition-colors ${
              isActive ? 'text-japan-indigo-800 dark:text-indigo-400' : 'text-japan-charcoal-400'
            }`
          }
        >
          <LineChart className="w-4 h-4 mb-0.5" />
          <span>Progress</span>
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-semibold transition-colors ${
              isActive ? 'text-japan-indigo-800 dark:text-indigo-400' : 'text-japan-charcoal-400'
            }`
          }
        >
          <User className="w-4 h-4 mb-0.5" />
          <span>Profile</span>
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-semibold transition-colors ${
              isActive ? 'text-japan-indigo-800 dark:text-indigo-400' : 'text-japan-charcoal-400'
            }`
          }
        >
          <Settings className="w-4 h-4 mb-0.5" />
          <span>Settings</span>
        </NavLink>
      </nav>
    </div>
  );
};
