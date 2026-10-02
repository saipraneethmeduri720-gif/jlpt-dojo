import React from 'react';
import { KanjiItem, ItemProgressRecord } from '../../types';
import { Check, AlertCircle, RefreshCw, Star } from 'lucide-react';

interface KanjiCardProps {
  kanji: KanjiItem;
  progress?: ItemProgressRecord;
  isReviewDue?: boolean;
  onClick: (kanji: KanjiItem) => void;
}

export const KanjiCard: React.FC<KanjiCardProps> = ({
  kanji,
  progress,
  isReviewDue = false,
  onClick,
}) => {
  const learningStatus = progress?.learningStatus || 'unlearned';
  const quizStatus = progress?.quizStatus || 'untested';
  const attempts = progress?.attempts || 0;
  const accuracy = attempts > 0 ? Math.round(((progress?.correct || 0) / attempts) * 100) : null;

  // Visual status stylings (combining learning status + quiz status gracefully)
  let statusBorder = 'border-japan-charcoal-200/90 dark:border-zinc-700/80 hover:border-japan-indigo-800';
  let statusBg = 'bg-white dark:bg-zinc-800/90';
  let textGrad = 'text-japan-charcoal-900 dark:text-zinc-100';

  if (isReviewDue || quizStatus === 'needs_review' || quizStatus === 'wrong') {
    // Red / Needs review
    statusBorder = 'border-rose-300 dark:border-rose-800 hover:border-rose-500';
    statusBg = 'bg-rose-50/50 dark:bg-rose-950/30';
  } else if (learningStatus === 'reviewing') {
    // Yellow / Currently reviewing
    statusBorder = 'border-amber-300 dark:border-amber-800 hover:border-amber-500';
    statusBg = 'bg-amber-50/50 dark:bg-amber-950/30';
  } else if (learningStatus === 'learned') {
    // Light green / Learned
    statusBorder = 'border-emerald-300 dark:border-emerald-800 hover:border-emerald-500';
    statusBg = 'bg-emerald-50/40 dark:bg-emerald-950/20';
  }

  return (
    <button
      onClick={() => onClick(kanji)}
      aria-label={`Kanji ${kanji.character}: ${kanji.meaning}`}
      className={`kanji-box relative flex flex-col items-center justify-between p-3.5 rounded-2xl border ${statusBorder} ${statusBg} shadow-subtle hover:shadow-elevated transition-all duration-200 text-center w-full aspect-square group cursor-pointer focus:outline-none focus:ring-2 focus:ring-japan-indigo-800`}
    >
      {/* Top badges: Stroke count / Grade & Learning Status pill */}
      <div className="w-full flex items-center justify-between text-[10px] text-japan-charcoal-400">
        <span className="font-mono">{kanji.strokeCount || 0}画</span>

        <div className="flex items-center gap-1">
          {learningStatus === 'learned' && (
            <span title="Marked as Learned" className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </span>
          )}
          {learningStatus === 'reviewing' && (
            <span title="In Active Review" className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center">
              <RefreshCw className="w-2.5 h-2.5" />
            </span>
          )}
          {(isReviewDue || quizStatus === 'needs_review' || quizStatus === 'wrong') && (
            <span title="Needs Review (Quiz Mistake)" className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center">
              <AlertCircle className="w-2.5 h-2.5" />
            </span>
          )}
        </div>
      </div>

      {/* Main Kanji Character */}
      <div className="my-auto py-1">
        <span className={`font-japanese text-3xl md:text-4xl font-extrabold ${textGrad} group-hover:scale-110 group-hover:text-japan-indigo-800 dark:group-hover:text-indigo-400 transition-all inline-block`}>
          {kanji.character}
        </span>
      </div>

      {/* Bottom Meaning & On/Kun preview */}
      <div className="w-full">
        <div className="text-[11px] font-semibold text-japan-charcoal-800 dark:text-zinc-200 truncate px-1">
          {kanji.meaning}
        </div>
        <div className="text-[10px] text-japan-charcoal-400 truncate font-japanese mt-0.5">
          {kanji.onyomi[0] || kanji.kunyomi[0] || '—'}
        </div>
      </div>

      {/* Accuracy Tag if tested */}
      {accuracy !== null && (
        <div className="absolute -bottom-2 -right-1 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-japan-charcoal-900 text-white shadow-xs">
          {accuracy}%
        </div>
      )}
    </button>
  );
};
