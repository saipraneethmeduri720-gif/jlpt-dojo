import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Award, CheckCircle2 } from 'lucide-react';
import { JLPTLevel } from '../../types';
import { JLPT_LEVEL_INFO } from '../../data';
import { useProgress } from '../../context/ProgressContext';
import { ProgressBar } from '../common/ProgressBar';

interface LevelCardProps {
  level: JLPTLevel;
}

export const LevelCard: React.FC<LevelCardProps> = ({ level }) => {
  const info = JLPT_LEVEL_INFO[level];
  const { getLevelStats } = useProgress();
  const stats = getLevelStats(level);

  return (
    <div className="washi-card rounded-2xl p-5 border border-japan-charcoal-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col justify-between group hover:border-japan-indigo-700 transition-all shadow-subtle hover:shadow-elevated">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-sm"
              style={{ backgroundColor: info.color }}
            >
              {info.title}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-japan-charcoal-900 dark:text-zinc-100">
                  {info.title} - {info.badge}
                </h3>
                {stats.completionPercentage === 100 && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                )}
              </div>
              <div className="text-xs text-japan-charcoal-400 font-japanese">
                {info.kanjiTitle} • {info.subtitle}
              </div>
            </div>
          </div>

          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#FAF8F5] dark:bg-zinc-800 text-japan-charcoal-700 dark:text-zinc-300 border border-japan-charcoal-200 dark:border-zinc-700">
            {stats.learnedCount} / {stats.totalItems} Items
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 mb-4">
          <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
            <span className="text-japan-charcoal-500">Mastery Level</span>
            <span className="font-bold text-japan-charcoal-900 dark:text-zinc-100">
              {stats.completionPercentage}%
            </span>
          </div>
          <ProgressBar value={stats.completionPercentage} height="h-2.5" color="bg-japan-indigo-800" />
        </div>

        {/* Mini Categories Breakdown */}
        <div className="grid grid-cols-4 gap-1.5 text-center text-[11px] pt-3 border-t border-japan-charcoal-100 dark:border-zinc-800">
          <div className="p-1 rounded bg-[#FAF8F5] dark:bg-zinc-800/60">
            <div className="text-japan-charcoal-400 text-[10px]">Kanji</div>
            <div className="font-bold text-japan-charcoal-800 dark:text-zinc-200">
              {stats.categories.kanji.completionPercentage}%
            </div>
          </div>
          <div className="p-1 rounded bg-[#FAF8F5] dark:bg-zinc-800/60">
            <div className="text-japan-charcoal-400 text-[10px]">Vocab</div>
            <div className="font-bold text-japan-charcoal-800 dark:text-zinc-200">
              {stats.categories.vocabulary.completionPercentage}%
            </div>
          </div>
          <div className="p-1 rounded bg-[#FAF8F5] dark:bg-zinc-800/60">
            <div className="text-japan-charcoal-400 text-[10px]">Grammar</div>
            <div className="font-bold text-japan-charcoal-800 dark:text-zinc-200">
              {stats.categories.grammar.completionPercentage}%
            </div>
          </div>
          <div className="p-1 rounded bg-[#FAF8F5] dark:bg-zinc-800/60">
            <div className="text-japan-charcoal-400 text-[10px]">Other</div>
            <div className="font-bold text-japan-charcoal-800 dark:text-zinc-200">
              {stats.categories.other.completionPercentage}%
            </div>
          </div>
        </div>
      </div>

      {/* Action link */}
      <div className="mt-4 pt-3">
        <Link
          to={`/level/${level}`}
          className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-xs font-semibold bg-japan-indigo-800 text-white hover:bg-japan-indigo-900 transition-colors shadow-xs group-hover:shadow"
        >
          <span>Open {info.title} Dashboard</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
