import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  LineChart,
  Settings as SettingsIcon,
  User,
  LogOut,
  ChevronRight,
  Flame,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProgress } from '../../context/ProgressContext';
import { useSettings } from '../../context/SettingsContext';
import { JLPT_LEVEL_INFO } from '../../data';
import { JLPTLevel } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { getLevelStats, streak } = useProgress();
  const { settings, toggleSound } = useSettings();
  const navigate = useNavigate();

  const levels: JLPTLevel[] = ['n5', 'n4', 'n3', 'n2', 'n1'];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-japan-charcoal-900/40 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-zinc-900 border-r border-japan-charcoal-200/80 dark:border-zinc-800 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-japan-charcoal-100 dark:border-zinc-800 flex items-center justify-between">
          <NavLink to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-japan-indigo-800 flex items-center justify-center shadow-sm group-hover:bg-japan-vermilion-500 transition-colors">
              <span className="font-japanese font-black text-white text-base">日</span>
            </div>
            <div>
              <div className="font-bold text-sm text-japan-charcoal-900 dark:text-zinc-100 tracking-tight flex items-center gap-1.5">
                <span>JLPT Mastery</span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-japan-vermilion-50 text-japan-vermilion-600 border border-japan-vermilion-100">
                  道場
                </span>
              </div>
              <div className="text-[11px] text-japan-charcoal-400 font-japanese">日本語能力試験学習</div>
            </div>
          </NavLink>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          {/* Main Links */}
          <div className="space-y-1">
            <NavLink
              to="/dashboard"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-japan-indigo-50 dark:bg-zinc-800 text-japan-indigo-800 dark:text-zinc-100 font-semibold shadow-xs'
                    : 'text-japan-charcoal-600 dark:text-zinc-400 hover:text-japan-charcoal-900 hover:bg-japan-charcoal-50 dark:hover:bg-zinc-800/50'
                }`
              }
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/progress"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-japan-indigo-50 dark:bg-zinc-800 text-japan-indigo-800 dark:text-zinc-100 font-semibold shadow-xs'
                    : 'text-japan-charcoal-600 dark:text-zinc-400 hover:text-japan-charcoal-900 hover:bg-japan-charcoal-50 dark:hover:bg-zinc-800/50'
                }`
              }
            >
              <LineChart className="w-4 h-4" />
              <span>Global Progress</span>
            </NavLink>
          </div>

          {/* JLPT Levels Section */}
          <div>
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-japan-charcoal-400">
                JLPT Levels
              </span>
              <GraduationCap className="w-3.5 h-3.5 text-japan-charcoal-400" />
            </div>
            <div className="space-y-1">
              {levels.map((lvl) => {
                const info = JLPT_LEVEL_INFO[lvl];
                const stats = getLevelStats(lvl);
                return (
                  <NavLink
                    key={lvl}
                    to={`/level/${lvl}`}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `group flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-japan-indigo-800 text-white shadow-sm'
                          : 'text-japan-charcoal-700 dark:text-zinc-300 hover:bg-japan-charcoal-50 dark:hover:bg-zinc-800/60'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-black uppercase ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-japan-charcoal-100 dark:bg-zinc-800 text-japan-charcoal-700 dark:text-zinc-300 group-hover:bg-japan-indigo-50'
                            }`}
                          >
                            {lvl.toUpperCase()}
                          </span>
                          <div>
                            <div className="text-xs font-semibold leading-tight">{info.title} - {info.badge}</div>
                            <div
                              className={`text-[10px] font-japanese ${
                                isActive ? 'text-white/80' : 'text-japan-charcoal-400'
                              }`}
                            >
                              {info.kanjiTitle}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[11px] font-bold ${
                              isActive ? 'text-white' : 'text-japan-charcoal-500'
                            }`}
                          >
                            {stats.completionPercentage}%
                          </span>
                          <ChevronRight
                            className={`w-3.5 h-3.5 opacity-60 ${
                              isActive ? 'text-white' : 'text-japan-charcoal-400'
                            }`}
                          />
                        </div>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* User Settings & Profile Section */}
          <div className="pt-2 border-t border-japan-charcoal-100 dark:border-zinc-800 space-y-1">
            <NavLink
              to="/settings"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-japan-indigo-50 dark:bg-zinc-800 text-japan-indigo-800 dark:text-zinc-100 font-semibold'
                    : 'text-japan-charcoal-600 dark:text-zinc-400 hover:text-japan-charcoal-900 hover:bg-japan-charcoal-50 dark:hover:bg-zinc-800/50'
                }`
              }
            >
              <SettingsIcon className="w-4 h-4" />
              <span>Settings</span>
            </NavLink>

            <NavLink
              to="/profile"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-japan-indigo-50 dark:bg-zinc-800 text-japan-indigo-800 dark:text-zinc-100 font-semibold'
                    : 'text-japan-charcoal-600 dark:text-zinc-400 hover:text-japan-charcoal-900 hover:bg-japan-charcoal-50 dark:hover:bg-zinc-800/50'
                }`
              }
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </NavLink>
          </div>
        </div>

        {/* Footer: User Quick Profile & Controls */}
        <div className="p-3 border-t border-japan-charcoal-100 dark:border-zinc-800 bg-[#FAF8F5] dark:bg-zinc-900/60">
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center gap-1.5 text-xs text-amber-600 font-semibold">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>{streak.currentStreak} Day Streak</span>
            </div>
            <button
              onClick={toggleSound}
              title={settings.soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
              className="p-1 rounded text-japan-charcoal-500 hover:text-japan-charcoal-800 hover:bg-japan-charcoal-200/50 transition-colors"
            >
              {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-japan-indigo-800" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-zinc-800 border border-japan-charcoal-200/80 dark:border-zinc-700">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-japan-indigo-800 text-white flex items-center justify-center text-xs font-bold shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : '学'}
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-japan-charcoal-800 dark:text-zinc-200 truncate">
                  {user?.name || 'Learner'}
                </div>
                <div className="text-[10px] text-japan-charcoal-400 uppercase font-mono">
                  {user?.targetLevel || 'N5'} Target
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 text-japan-charcoal-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
