import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Menu, Flame, Volume2, VolumeX, Moon, Sun, User, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProgress } from '../../context/ProgressContext';
import { useSettings } from '../../context/SettingsContext';
import { JLPTLevel } from '../../types';

interface TopbarProps {
  onToggleSidebar: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const { streak, reviewQueue } = useProgress();
  const { settings, toggleSound, toggleTheme } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();

  const levels: JLPTLevel[] = ['n5', 'n4', 'n3', 'n2', 'n1'];

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-japan-charcoal-100 dark:border-zinc-800 flex items-center justify-between px-4 md:px-8">
      {/* Left: Mobile Toggle & Quick Level Selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          className="p-2 -ml-1 text-japan-charcoal-600 hover:text-japan-charcoal-900 md:hidden rounded-lg hover:bg-japan-charcoal-100"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Level Selector Pills */}
        <div className="hidden sm:flex items-center gap-1 bg-[#F5F2EB] dark:bg-zinc-800 p-1 rounded-xl">
          {levels.map((lvl) => {
            const isSelected = location.pathname.startsWith(`/level/${lvl}`);
            return (
              <NavLink
                key={lvl}
                to={`/level/${lvl}`}
                className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                  isSelected
                    ? 'bg-japan-indigo-800 text-white shadow-xs'
                    : 'text-japan-charcoal-600 dark:text-zinc-400 hover:text-japan-charcoal-900 hover:bg-white/60 dark:hover:bg-zinc-700'
                }`}
              >
                {lvl.toUpperCase()}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Review Counter Alert if any */}
        {reviewQueue.length > 0 && (
          <button
            onClick={() => navigate('/progress')}
            title={`${reviewQueue.length} items need review`}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-xs font-semibold hover:bg-amber-100 transition-colors"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>{reviewQueue.length} Review</span>
          </button>
        )}

        {/* Streak Counter */}
        <div
          title={`Active Streak: ${streak.currentStreak} day(s) (Longest: ${streak.longestStreak})`}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 text-xs font-bold"
        >
          <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500 animate-pulse-subtle" />
          <span>{streak.currentStreak}d</span>
        </div>

        {/* Sound Toggle */}
        <button
          onClick={toggleSound}
          title={settings.soundEnabled ? 'Audio Effects On' : 'Audio Effects Muted'}
          className="p-2 rounded-xl text-japan-charcoal-600 dark:text-zinc-400 hover:text-japan-indigo-800 hover:bg-japan-charcoal-50 dark:hover:bg-zinc-800 transition-colors"
        >
          {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-japan-indigo-800 dark:text-indigo-400" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title="Toggle Light / Dark theme"
          className="p-2 rounded-xl text-japan-charcoal-600 dark:text-zinc-400 hover:text-japan-indigo-800 hover:bg-japan-charcoal-50 dark:hover:bg-zinc-800 transition-colors"
        >
          {settings.theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Avatar */}
        <NavLink
          to="/profile"
          className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-xl border border-japan-charcoal-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-japan-indigo-800 transition-colors"
        >
          <div className="w-6 h-6 rounded-full bg-japan-indigo-800 text-white flex items-center justify-center text-[10px] font-black">
            {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
          </div>
          <span className="text-xs font-semibold text-japan-charcoal-800 dark:text-zinc-200 hidden md:inline">
            {user?.name || 'Account'}
          </span>
        </NavLink>
      </div>
    </header>
  );
};
