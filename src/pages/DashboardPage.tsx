import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import { useSettings } from '../context/SettingsContext';
import { JLPT_LEVEL_INFO } from '../data';
import { JLPTLevel } from '../types';
import { ProgressBar } from '../components/common/ProgressBar';
import { ProgressRing } from '../components/common/ProgressRing';
import {
  Flame,
  Award,
  Clock,
  Play,
  RotateCcw,
  BookOpen,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Compass,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const {
    getGlobalStats,
    getLevelStats,
    getTodayTotalLog,
    reviewQueue,
    itemProgressMap,
    streak,
  } = useProgress();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const globalStats = getGlobalStats();
  const todayStats = getTodayTotalLog();
  const targetLevel = (user?.targetLevel || 'n5') as JLPTLevel;
  const targetLevelInfo = JLPT_LEVEL_INFO[targetLevel];
  const targetLevelStats = getLevelStats(targetLevel);

  const levels: JLPTLevel[] = ['n5', 'n4', 'n3', 'n2', 'n1'];

  // Greeting based on time of day
  const getJapaneseGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { jp: 'おはようございます', en: 'Good morning' };
    if (hour < 18) return { jp: 'こんにちは', en: 'Good afternoon' };
    return { jp: 'こんばんは', en: 'Good evening' };
  };
  const greeting = getJapaneseGreeting();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-japan-indigo-900 via-japan-indigo-800 to-japan-indigo-900 text-white p-6 md:p-8 shadow-elevated">
        {/* Subtle decorative Japanese background Kanji */}
        <div className="absolute -right-6 -bottom-10 font-japanese font-black text-9xl text-white/5 select-none pointer-events-none">
          道
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-japan-vermilion-200 text-xs font-semibold uppercase tracking-wider">
              <span className="font-japanese text-sm">{greeting.jp}</span>
              <span>•</span>
              <span>{greeting.en}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Welcome back, {user?.name || 'Scholar'}
            </h1>
            <p className="text-xs md:text-sm text-japan-indigo-100 font-normal leading-relaxed">
              Targeting <strong className="text-white font-bold">{targetLevelInfo.title} ({targetLevelInfo.badge})</strong>.
              You're currently on a <strong className="text-amber-300 font-bold">{streak.currentStreak}-day study streak</strong>. Keep up the momentum!
            </p>
          </div>

          {/* Quick Actions Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              to={`/level/${targetLevel}/kanji/learning`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-japan-vermilion-500 hover:bg-japan-vermilion-600 text-white text-xs font-bold shadow-md transition-all hover:scale-102"
            >
              <BookOpen className="w-4 h-4" />
              <span>Continue Learning</span>
            </Link>

            <Link
              to={`/level/${targetLevel}/kanji/quiz`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-japan-indigo-900 hover:bg-japan-indigo-50 text-xs font-bold shadow-md transition-all"
            >
              <Play className="w-4 h-4 fill-japan-indigo-900" />
              <span>Start Quiz</span>
            </Link>

            {reviewQueue.length > 0 && (
              <Link
                to={`/level/${targetLevel}/kanji/quiz`}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-all"
              >
                <RotateCcw className="w-4 h-4 text-amber-300" />
                <span>Review ({reviewQueue.length})</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 4 Core Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Daily Streak */}
        <div className="washi-card p-5 rounded-2xl border border-japan-charcoal-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-subtle flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-orange-500 border border-orange-200 dark:border-orange-800 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 fill-orange-500" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-japan-charcoal-400">Daily Streak</div>
            <div className="text-xl font-black text-japan-charcoal-900 dark:text-zinc-100">
              {streak.currentStreak} <span className="text-xs font-normal text-japan-charcoal-500">Days</span>
            </div>
            <div className="text-[10px] text-japan-charcoal-400">Longest: {streak.longestStreak}d</div>
          </div>
        </div>

        {/* Total Learned */}
        <div className="washi-card p-5 rounded-2xl border border-japan-charcoal-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-subtle flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-japan-charcoal-400">Items Learned</div>
            <div className="text-xl font-black text-japan-charcoal-900 dark:text-zinc-100">
              {globalStats.totalLearnedAllLevels}
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold">+{todayStats.newLearned} Today</div>
          </div>
        </div>

        {/* Overall Accuracy */}
        <div className="washi-card p-5 rounded-2xl border border-japan-charcoal-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-subtle flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-japan-indigo-800 dark:text-indigo-400 border border-japan-indigo-100 dark:border-zinc-700 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-japan-charcoal-400">Quiz Accuracy</div>
            <div className="text-xl font-black text-japan-charcoal-900 dark:text-zinc-100">
              {globalStats.overallAccuracy}%
            </div>
            <div className="text-[10px] text-japan-charcoal-400">{globalStats.totalQuestionsAnswered} Answered</div>
          </div>
        </div>

        {/* Review Queue */}
        <div className="washi-card p-5 rounded-2xl border border-japan-charcoal-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-subtle flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 border border-rose-200 dark:border-rose-800 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-japan-charcoal-400">Review Queue</div>
            <div className="text-xl font-black text-japan-charcoal-900 dark:text-zinc-100">
              {reviewQueue.length} <span className="text-xs font-normal text-japan-charcoal-500">Items</span>
            </div>
            <div className="text-[10px] text-rose-600 font-semibold">Priority Review</div>
          </div>
        </div>
      </div>

      {/* Middle Grid: Dynamic JLPT Levels Progression Breakdown + Target Level Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Real Live Progress for all 5 JLPT Levels */}
        <div className="lg:col-span-2 washi-card p-6 md:p-7 rounded-3xl border border-japan-charcoal-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-subtle space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-japan-charcoal-900 dark:text-zinc-100">
                JLPT Level Progress (N5 – N1)
              </h2>
              <p className="text-xs text-japan-charcoal-500">
                Mastery percentages dynamically computed from your active learning state
              </p>
            </div>
            <Link
              to="/progress"
              className="text-xs font-semibold text-japan-indigo-800 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Detailed Breakdown</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4 pt-1">
            {levels.map((lvl) => {
              const info = JLPT_LEVEL_INFO[lvl];
              const stats = getLevelStats(lvl);
              const isTarget = lvl === targetLevel;

              return (
                <div
                  key={lvl}
                  className={`p-4 rounded-2xl border transition-all ${
                    isTarget
                      ? 'bg-japan-indigo-50/40 dark:bg-zinc-800/80 border-japan-indigo-800/30 shadow-xs'
                      : 'bg-[#FAF8F5] dark:bg-zinc-800/40 border-japan-charcoal-100 dark:border-zinc-800 hover:border-japan-charcoal-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-7 h-7 rounded-lg text-white font-black text-xs flex items-center justify-center shadow-xs"
                        style={{ backgroundColor: info.color }}
                      >
                        {lvl.toUpperCase()}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-japan-charcoal-900 dark:text-zinc-100 flex items-center gap-1.5">
                          <span>{info.title} - {info.badge}</span>
                          {isTarget && (
                            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-japan-indigo-800 text-white">
                              Active Target
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-japan-charcoal-400 font-japanese">
                          {info.kanjiTitle}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-japan-charcoal-500">
                        {stats.learnedCount} / {stats.totalItems}
                      </span>
                      <span className="text-sm font-black text-japan-charcoal-900 dark:text-zinc-100 w-10 text-right">
                        {stats.completionPercentage}%
                      </span>
                    </div>
                  </div>

                  <ProgressBar value={stats.completionPercentage} height="h-2" color="bg-japan-indigo-800" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Current Target Level Category Quick Navigation */}
        <div className="washi-card p-6 md:p-7 rounded-3xl border border-japan-charcoal-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-subtle flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-japan-charcoal-400">
                {targetLevel.toUpperCase()} Categories
              </span>
              <span className="text-xs font-bold text-japan-indigo-800 dark:text-indigo-400">
                {targetLevelStats.completionPercentage}% Overall
              </span>
            </div>

            <h3 className="text-lg font-bold text-japan-charcoal-900 dark:text-zinc-100 mb-1">
              {targetLevelInfo.title} Study Path
            </h3>
            <p className="text-xs text-japan-charcoal-500 mb-4">
              Select a category to study learning lists, take quizzes, and track daily retention.
            </p>

            <div className="space-y-2.5">
              {[
                { cat: 'kanji' as const, label: 'Kanji (漢字)', stats: targetLevelStats.categories.kanji },
                { cat: 'vocabulary' as const, label: 'Vocabulary (語彙)', stats: targetLevelStats.categories.vocabulary },
                { cat: 'grammar' as const, label: 'Grammar (文法)', stats: targetLevelStats.categories.grammar },
                { cat: 'other' as const, label: 'Other (その他)', stats: targetLevelStats.categories.other },
              ].map(({ cat, label, stats }) => (
                <Link
                  key={cat}
                  to={`/level/${targetLevel}/${cat}/learning`}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] dark:bg-zinc-800 hover:bg-japan-indigo-50 dark:hover:bg-zinc-700 border border-japan-charcoal-100 dark:border-zinc-700 text-xs font-medium transition-all group"
                >
                  <span className="font-semibold text-japan-charcoal-800 dark:text-zinc-200 group-hover:text-japan-indigo-800">
                    {label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-japan-charcoal-500">
                      {stats.completionPercentage}%
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-japan-charcoal-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-japan-charcoal-100 dark:border-zinc-800">
            <Link
              to={`/level/${targetLevel}`}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-japan-indigo-800 hover:bg-japan-indigo-900 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <span>Explore All {targetLevel.toUpperCase()} Cards</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
