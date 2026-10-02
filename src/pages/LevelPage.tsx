import React from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { JLPTLevel, CategoryType } from '../types';
import { JLPT_LEVEL_INFO } from '../data';
import { useProgress } from '../context/ProgressContext';
import { CategoryCard } from '../components/cards/CategoryCard';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { ProgressBar } from '../components/common/ProgressBar';
import { Award, BookOpen, Sparkles, CheckCircle2, ChevronRight, Play } from 'lucide-react';

export const LevelPage: React.FC = () => {
  const { levelId } = useParams<{ levelId: string }>();
  const { getLevelStats } = useProgress();

  const validLevels: JLPTLevel[] = ['n5', 'n4', 'n3', 'n2', 'n1'];
  const level = (levelId?.toLowerCase() || 'n5') as JLPTLevel;

  if (!validLevels.includes(level)) {
    return <Navigate to="/level/n5" replace />;
  }

  const levelInfo = JLPT_LEVEL_INFO[level];
  const stats = getLevelStats(level);
  const categories: CategoryType[] = ['kanji', 'vocabulary', 'grammar', 'other'];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: `${level.toUpperCase()} Overview`, isCurrent: true }]} />

      {/* Level Header Banner */}
      <div className="washi-card p-6 md:p-8 rounded-3xl border border-japan-charcoal-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-elevated relative overflow-hidden">
        {/* Background decorative watermark */}
        <div className="absolute right-6 -bottom-6 font-japanese font-black text-8xl text-japan-charcoal-900/5 select-none pointer-events-none">
          {levelInfo.kanjiTitle}
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-white text-2xl shadow-md shrink-0"
              style={{ backgroundColor: levelInfo.color }}
            >
              {levelInfo.title}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-black text-japan-charcoal-900 dark:text-zinc-100">
                  {levelInfo.title} — {levelInfo.subtitle}
                </h1>
                {stats.completionPercentage === 100 && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                )}
              </div>
              <div className="text-xs font-japanese font-medium text-japan-charcoal-400">
                {levelInfo.kanjiTitle} • Japanese Language Proficiency Test
              </div>
              <p className="text-xs md:text-sm text-japan-charcoal-600 dark:text-zinc-400 max-w-2xl pt-1">
                {levelInfo.description}
              </p>
            </div>
          </div>

          {/* Level Overall Completion Gauge */}
          <div className="bg-[#FAF8F5] dark:bg-zinc-800 p-4 rounded-2xl border border-japan-charcoal-200/80 dark:border-zinc-700 shrink-0 min-w-[200px]">
            <div className="flex justify-between items-center text-xs font-bold text-japan-charcoal-500 mb-1.5">
              <span>Overall Mastery</span>
              <span className="text-japan-charcoal-900 dark:text-zinc-100 font-mono text-sm">
                {stats.completionPercentage}%
              </span>
            </div>
            <ProgressBar value={stats.completionPercentage} height="h-2.5" color="bg-japan-indigo-800" />
            <div className="text-[11px] text-japan-charcoal-400 mt-2 text-right">
              {stats.learnedCount} / {stats.totalItems} Items Mastered
            </div>
          </div>
        </div>
      </div>

      {/* 4 Category Cards Grid (Kanji, Vocabulary, Grammar, Other) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-japan-charcoal-900 dark:text-zinc-100 uppercase tracking-wider text-xs">
            {level.toUpperCase()} Core Categories
          </h2>
          <span className="text-xs text-japan-charcoal-500">
            Click any section below to start studying
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((cat) => (
            <CategoryCard key={cat} level={level} category={cat} />
          ))}
        </div>
      </div>
    </div>
  );
};
