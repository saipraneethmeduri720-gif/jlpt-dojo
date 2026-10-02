import React from 'react';
import { Link } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import { JLPT_LEVEL_INFO } from '../data';
import { JLPTLevel } from '../types';
import { ProgressBar } from '../components/common/ProgressBar';
import {
  LineChart,
  Flame,
  Award,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const GlobalProgressPage: React.FC = () => {
  const {
    getGlobalStats,
    getLevelStats,
    weakAreasMap,
    reviewQueue,
    streak,
  } = useProgress();

  const globalStats = getGlobalStats();
  const levels: JLPTLevel[] = ['n5', 'n4', 'n3', 'n2', 'n1'];
  const weakAreasList = Object.values(weakAreasMap);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title Header */}
      <div className="washi-card p-6 md:p-8 rounded-3xl border border-japan-charcoal-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-elevated flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-japan-charcoal-400 mb-1">
            <LineChart className="w-4 h-4 text-japan-indigo-800" />
            <span>Mastery Analytics</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-japan-charcoal-900 dark:text-zinc-100 tracking-tight">
            Global JLPT Progress & Analytics
          </h1>
          <p className="text-xs md:text-sm text-japan-charcoal-500 max-w-xl mt-1">
            Complete high-level overview across all 5 JLPT levels, historical quiz accuracy, and targeted weak-area diagnostics.
          </p>
        </div>

        {/* Big Overall Ring */}
        <div className="flex items-center gap-4 bg-[#FAF8F5] dark:bg-zinc-800 p-4 rounded-2xl border border-japan-charcoal-200/80 dark:border-zinc-700">
          <div className="text-center">
            <div className="text-3xl font-black text-japan-indigo-800 dark:text-indigo-400 font-mono">
              {globalStats.overallMasteryPercentage}%
            </div>
            <div className="text-[10px] uppercase font-bold text-japan-charcoal-400">
              Total JLPT Mastery
            </div>
          </div>
          <div className="h-10 w-px bg-japan-charcoal-200 dark:bg-zinc-700" />
          <div className="text-xs space-y-0.5">
            <div><strong>{globalStats.totalLearnedAllLevels}</strong> / {globalStats.totalItemsAllLevels} Items</div>
            <div className="text-emerald-600 font-bold">{globalStats.overallAccuracy}% Overall Accuracy</div>
          </div>
        </div>
      </div>

      {/* 4 Summary Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="washi-card p-4 rounded-2xl border border-japan-charcoal-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-subtle space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-japan-charcoal-400 block">Total Learned</span>
          <span className="text-2xl font-black text-japan-charcoal-900 dark:text-zinc-100">{globalStats.totalLearnedAllLevels}</span>
          <span className="text-[11px] text-japan-charcoal-400 block">Across N5–N1</span>
        </div>

        <div className="washi-card p-4 rounded-2xl border border-japan-charcoal-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-subtle space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-japan-charcoal-400 block">Questions Answered</span>
          <span className="text-2xl font-black text-japan-charcoal-900 dark:text-zinc-100">{globalStats.totalQuestionsAnswered}</span>
          <span className="text-[11px] text-emerald-600 font-semibold block">{globalStats.totalCorrect} Correct • {globalStats.totalWrong} Wrong</span>
        </div>

        <div className="washi-card p-4 rounded-2xl border border-japan-charcoal-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-subtle space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-japan-charcoal-400 block">Review Queue</span>
          <span className="text-2xl font-black text-rose-600">{reviewQueue.length}</span>
          <span className="text-[11px] text-japan-charcoal-400 block">Need Reinforcement</span>
        </div>

        <div className="washi-card p-4 rounded-2xl border border-japan-charcoal-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-subtle space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-japan-charcoal-400 block">Active Streak</span>
          <span className="text-2xl font-black text-amber-600">{streak.currentStreak} Days</span>
          <span className="text-[11px] text-japan-charcoal-400 block">Longest: {streak.longestStreak} Days</span>
        </div>
      </div>

      {/* Level by Level Category Breakdown Table */}
      <div className="washi-card p-6 md:p-8 rounded-3xl border border-japan-charcoal-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-subtle space-y-6">
        <div>
          <h2 className="text-lg font-bold text-japan-charcoal-900 dark:text-zinc-100">
            Level-by-Level Breakdown (N5 to N1)
          </h2>
          <p className="text-xs text-japan-charcoal-500">
            Detailed completion and accuracy statistics per category
          </p>
        </div>

        <div className="space-y-4">
          {levels.map((lvl) => {
            const info = JLPT_LEVEL_INFO[lvl];
            const stats = getLevelStats(lvl);

            return (
              <div
                key={lvl}
                className="p-5 rounded-2xl bg-[#FAF8F5] dark:bg-zinc-800/60 border border-japan-charcoal-200/80 dark:border-zinc-700 space-y-4"
              >
                {/* Level Title Row */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-8 h-8 rounded-lg text-white font-black text-sm flex items-center justify-center shadow-xs"
                      style={{ backgroundColor: info.color }}
                    >
                      {lvl.toUpperCase()}
                    </span>
                    <div>
                      <div className="font-bold text-sm text-japan-charcoal-900 dark:text-zinc-100 flex items-center gap-2">
                        <span>{info.title} - {info.subtitle}</span>
                      </div>
                      <div className="text-[10px] text-japan-charcoal-400 font-japanese">
                        {info.kanjiTitle} • {stats.learnedCount} / {stats.totalItems} Items Mastered
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-lg font-black text-japan-charcoal-900 dark:text-zinc-100">
                      {stats.completionPercentage}%
                    </span>
                    <Link
                      to={`/level/${lvl}`}
                      className="p-1.5 rounded-lg bg-white dark:bg-zinc-700 text-japan-charcoal-600 dark:text-zinc-300 hover:text-japan-indigo-800 shadow-xs text-xs font-semibold"
                    >
                      View {lvl.toUpperCase()} →
                    </Link>
                  </div>
                </div>

                {/* Overall Level Progress Bar */}
                <ProgressBar value={stats.completionPercentage} height="h-2" color="bg-japan-indigo-800" />

                {/* 4 Category Pill Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 text-xs">
                  <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-japan-charcoal-200/60 dark:border-zinc-700/80">
                    <div className="text-japan-charcoal-400 text-[10px] uppercase font-bold">Kanji (漢字)</div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="font-bold text-japan-charcoal-800 dark:text-zinc-200">
                        {stats.categories.kanji.completionPercentage}%
                      </span>
                      <span className="text-[10px] text-japan-charcoal-400">
                        {stats.categories.kanji.learnedCount}/{stats.categories.kanji.totalItems}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-japan-charcoal-200/60 dark:border-zinc-700/80">
                    <div className="text-japan-charcoal-400 text-[10px] uppercase font-bold">Vocabulary (語彙)</div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="font-bold text-japan-charcoal-800 dark:text-zinc-200">
                        {stats.categories.vocabulary.completionPercentage}%
                      </span>
                      <span className="text-[10px] text-japan-charcoal-400">
                        {stats.categories.vocabulary.learnedCount}/{stats.categories.vocabulary.totalItems}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-japan-charcoal-200/60 dark:border-zinc-700/80">
                    <div className="text-japan-charcoal-400 text-[10px] uppercase font-bold">Grammar (文法)</div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="font-bold text-japan-charcoal-800 dark:text-zinc-200">
                        {stats.categories.grammar.completionPercentage}%
                      </span>
                      <span className="text-[10px] text-japan-charcoal-400">
                        {stats.categories.grammar.learnedCount}/{stats.categories.grammar.totalItems}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-japan-charcoal-200/60 dark:border-zinc-700/80">
                    <div className="text-japan-charcoal-400 text-[10px] uppercase font-bold">Other (その他)</div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="font-bold text-japan-charcoal-800 dark:text-zinc-200">
                        {stats.categories.other.completionPercentage}%
                      </span>
                      <span className="text-[10px] text-japan-charcoal-400">
                        {stats.categories.other.learnedCount}/{stats.categories.other.totalItems}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weak Areas Diagnostic Table */}
      <div className="washi-card p-6 md:p-8 rounded-3xl border border-japan-charcoal-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-japan-charcoal-900 dark:text-zinc-100 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <span>Diagnostic Weak Areas</span>
            </h2>
            <p className="text-xs text-japan-charcoal-500">
              Specific skills and questions where mistakes occurred
            </p>
          </div>
        </div>

        {weakAreasList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-japan-charcoal-200 dark:border-zinc-700 text-japan-charcoal-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Level</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Skill Area</th>
                  <th className="py-2.5 px-3">Prompt / Item</th>
                  <th className="py-2.5 px-3 text-center">Mistakes</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-japan-charcoal-100 dark:divide-zinc-800">
                {weakAreasList.map((weak) => (
                  <tr key={weak.id} className="hover:bg-japan-charcoal-50/50 dark:hover:bg-zinc-800/40">
                    <td className="py-3 px-3 font-bold uppercase text-japan-indigo-800 dark:text-indigo-400">
                      {weak.level}
                    </td>
                    <td className="py-3 px-3 uppercase font-medium">{weak.category}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-semibold text-[10px]">
                        {weak.skill.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-japanese font-semibold max-w-xs truncate">
                      {weak.itemTitle}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-rose-600 font-mono">
                      {weak.mistakeCount}✕
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        to={`/level/${weak.level}/${weak.category}/quiz`}
                        className="px-2.5 py-1 rounded-lg bg-japan-indigo-800 text-white font-bold text-[10px] hover:bg-japan-indigo-900"
                      >
                        Quiz Now
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-japan-charcoal-400 space-y-1">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-japan-charcoal-800 dark:text-zinc-200">No Weak Areas Detected</p>
            <p>You have made zero unresolved mistakes so far. Keep up the high accuracy!</p>
          </div>
        )}
      </div>
    </div>
  );
};
