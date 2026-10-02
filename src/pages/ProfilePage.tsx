import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import { JLPT_LEVEL_INFO } from '../data';
import { JLPTLevel } from '../types';
import { soundEffects } from '../utils/audio';
import {
  User,
  GraduationCap,
  Calendar,
  Flame,
  Award,
  CheckCircle2,
  BookOpen,
  LogOut,
  Target,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { user, updateTargetLevel, logout } = useAuth();
  const { getGlobalStats, streak } = useProgress();
  const navigate = useNavigate();

  const globalStats = getGlobalStats();
  const [selectedTarget, setSelectedTarget] = useState<JLPTLevel>(user?.targetLevel || 'n5');
  const [isSaved, setIsSaved] = useState(false);

  const levels: JLPTLevel[] = ['n5', 'n4', 'n3', 'n2', 'n1'];

  const handleSaveTarget = () => {
    soundEffects.playClick();
    updateTargetLevel(selectedTarget);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      {/* Profile Banner */}
      <div className="washi-card p-6 md:p-8 rounded-3xl border border-japan-charcoal-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-elevated flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-3xl bg-japan-indigo-800 text-white flex items-center justify-center text-3xl font-black shadow-md shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : '学'}
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-japan-charcoal-900 dark:text-zinc-100">
              {user?.name || 'JLPT Learner'}
            </h1>
            <div className="text-xs text-japan-charcoal-500 font-mono">
              {user?.email || 'learner@jlpt.jp'}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-japan-indigo-50 dark:bg-zinc-800 text-japan-indigo-800 dark:text-indigo-400 border border-japan-indigo-200 dark:border-zinc-700">
                Target: {user?.targetLevel?.toUpperCase() || 'N5'}
              </span>
              <span className="text-xs text-japan-charcoal-400">
                Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-bold hover:bg-rose-100 transition-colors self-start md:self-auto"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>

      {/* Target Level Configuration */}
      <div className="washi-card p-6 rounded-3xl border border-japan-charcoal-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-japan-charcoal-800 dark:text-zinc-200 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-japan-indigo-800" />
              <span>JLPT Exam Target Level</span>
            </h2>
            <p className="text-xs text-japan-charcoal-500">
              Select your primary exam preparation level to customize Dashboard quick actions
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
          {levels.map((lvl) => {
            const info = JLPT_LEVEL_INFO[lvl];
            const isSelected = selectedTarget === lvl;
            return (
              <button
                key={lvl}
                onClick={() => setSelectedTarget(lvl)}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  isSelected
                    ? 'bg-japan-indigo-800 text-white border-japan-indigo-800 shadow-sm'
                    : 'bg-[#FAF8F5] dark:bg-zinc-800/80 text-japan-charcoal-700 dark:text-zinc-300 border-japan-charcoal-200 dark:border-zinc-700 hover:border-japan-charcoal-400'
                }`}
              >
                <div className="font-black text-lg">{lvl.toUpperCase()}</div>
                <div className={`text-[10px] font-japanese ${isSelected ? 'text-white/80' : 'text-japan-charcoal-400'}`}>
                  {info.badge}
                </div>
              </button>
            );
          })}
        </div>

        <div className="pt-2 flex items-center gap-3">
          <button
            onClick={handleSaveTarget}
            className="px-4 py-2 rounded-xl bg-japan-indigo-800 hover:bg-japan-indigo-900 text-white text-xs font-bold shadow-xs transition-colors"
          >
            Save Target Level
          </button>
          {isSaved && (
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Saved!
            </span>
          )}
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="washi-card p-5 rounded-2xl border border-japan-charcoal-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-subtle space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-japan-charcoal-400">Total Learned</div>
          <div className="text-2xl font-black text-japan-charcoal-900 dark:text-zinc-100">
            {globalStats.totalLearnedAllLevels}
          </div>
          <div className="text-[11px] text-japan-charcoal-500">Items across all levels</div>
        </div>

        <div className="washi-card p-5 rounded-2xl border border-japan-charcoal-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-subtle space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-japan-charcoal-400">Quiz Accuracy</div>
          <div className="text-2xl font-black text-emerald-600">
            {globalStats.overallAccuracy}%
          </div>
          <div className="text-[11px] text-japan-charcoal-500">{globalStats.totalQuestionsAnswered} questions total</div>
        </div>

        <div className="washi-card p-5 rounded-2xl border border-japan-charcoal-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-subtle space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-japan-charcoal-400">Streak Record</div>
          <div className="text-2xl font-black text-amber-600">
            {streak.currentStreak} <span className="text-xs font-normal text-japan-charcoal-500">Days</span>
          </div>
          <div className="text-[11px] text-japan-charcoal-500">Best: {streak.longestStreak} days</div>
        </div>
      </div>
    </div>
  );
};
