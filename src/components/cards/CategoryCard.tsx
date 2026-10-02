import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Sparkles, Layers, Compass, ArrowRight, Play, Calendar, ListFilter } from 'lucide-react';
import { JLPTLevel, CategoryType } from '../../types';
import { CATEGORY_INFO } from '../../data';
import { useProgress } from '../../context/ProgressContext';
import { ProgressBar } from '../common/ProgressBar';

interface CategoryCardProps {
  level: JLPTLevel;
  category: CategoryType;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ level, category }) => {
  const info = CATEGORY_INFO[category];
  const { getCategoryStats } = useProgress();
  const stats = getCategoryStats(level, category);

  const getIcon = () => {
    switch (category) {
      case 'kanji':
        return <Sparkles className="w-5 h-5 text-japan-vermilion-500" />;
      case 'vocabulary':
        return <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
      case 'grammar':
        return <Layers className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'other':
        return <Compass className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
    }
  };

  return (
    <div className="washi-card rounded-2xl p-6 border border-japan-charcoal-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col justify-between hover:border-japan-indigo-800 transition-all shadow-subtle hover:shadow-elevated group">
      <div>
        {/* Top title and icon */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#FAF8F5] dark:bg-zinc-800 border border-japan-charcoal-200/60 dark:border-zinc-700 flex items-center justify-center shadow-xs">
              {getIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-japan-charcoal-900 dark:text-zinc-100 uppercase tracking-wide">
                  {info.title}
                </h3>
                <span className="text-xs font-japanese font-medium px-2 py-0.5 rounded-md bg-japan-charcoal-100 dark:bg-zinc-800 text-japan-charcoal-600 dark:text-zinc-300">
                  {info.kanjiTitle}
                </span>
              </div>
              <p className="text-xs text-japan-charcoal-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                {info.description}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-lg font-black text-japan-charcoal-900 dark:text-zinc-100">
              {stats.completionPercentage}%
            </span>
          </div>
        </div>

        {/* Progress Bar & Counts */}
        <div className="my-4">
          <div className="flex justify-between items-center text-xs mb-1.5 font-medium text-japan-charcoal-500">
            <span>
              Learned: <strong className="text-japan-charcoal-800 dark:text-zinc-200">{stats.learnedCount}</strong> / {stats.totalItems}
            </span>
            <span>
              Quiz Accuracy: <strong className="text-japan-indigo-800 dark:text-indigo-400">{stats.quizAccuracy}%</strong>
            </span>
          </div>
          <ProgressBar value={stats.completionPercentage} height="h-2" color="bg-japan-indigo-800" />
        </div>
      </div>

      {/* 3 Core Section Action Buttons */}
      <div className="pt-4 border-t border-japan-charcoal-100 dark:border-zinc-800 grid grid-cols-3 gap-2">
        <Link
          to={`/level/${level}/${category}/learning`}
          className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#FAF8F5] dark:bg-zinc-800/80 hover:bg-japan-indigo-50 dark:hover:bg-zinc-700 text-japan-charcoal-700 dark:text-zinc-200 hover:text-japan-indigo-800 transition-all border border-japan-charcoal-200/60 dark:border-zinc-700/60 text-center group/btn"
        >
          <ListFilter className="w-4 h-4 mb-1 text-japan-indigo-800 dark:text-indigo-400 group-hover/btn:scale-110 transition-transform" />
          <span className="text-[11px] font-bold">Learning List</span>
        </Link>

        <Link
          to={`/level/${level}/${category}/quiz`}
          className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-japan-indigo-800 hover:bg-japan-indigo-900 text-white transition-all shadow-xs text-center group/btn"
        >
          <Play className="w-4 h-4 mb-1 text-white fill-white group-hover/btn:scale-110 transition-transform" />
          <span className="text-[11px] font-bold">Start Quiz</span>
        </Link>

        <Link
          to={`/level/${level}/${category}/progress`}
          className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#FAF8F5] dark:bg-zinc-800/80 hover:bg-amber-50 dark:hover:bg-zinc-700 text-japan-charcoal-700 dark:text-zinc-200 hover:text-amber-800 transition-all border border-japan-charcoal-200/60 dark:border-zinc-700/60 text-center group/btn"
        >
          <Calendar className="w-4 h-4 mb-1 text-amber-600 dark:text-amber-400 group-hover/btn:scale-110 transition-transform" />
          <span className="text-[11px] font-bold">Daily Progress</span>
        </Link>
      </div>
    </div>
  );
};
