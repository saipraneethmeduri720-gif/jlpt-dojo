import React from 'react';
import { GrammarItem, ItemProgressRecord } from '../../types';
import { Check, AlertCircle, Layers } from 'lucide-react';

interface GrammarCardProps {
  grammar: GrammarItem;
  progress?: ItemProgressRecord;
  isReviewDue?: boolean;
  onClick: (grammar: GrammarItem) => void;
}

export const GrammarCard: React.FC<GrammarCardProps> = ({
  grammar,
  progress,
  isReviewDue,
  onClick,
}) => {
  const learningStatus = progress?.learningStatus || 'unlearned';
  const quizStatus = progress?.quizStatus || 'untested';

  let borderStyle = 'border-japan-charcoal-200/90 dark:border-zinc-800';
  if (isReviewDue || quizStatus === 'needs_review' || quizStatus === 'wrong') {
    borderStyle = 'border-rose-300 dark:border-rose-800 bg-rose-50/30';
  } else if (learningStatus === 'learned') {
    borderStyle = 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/20';
  }

  return (
    <div
      onClick={() => onClick(grammar)}
      className={`washi-card p-5 rounded-2xl border ${borderStyle} bg-white dark:bg-zinc-900 cursor-pointer flex flex-col justify-between hover:border-japan-indigo-800 transition-all shadow-subtle hover:shadow-card group`}
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-japan-charcoal-500">
            <Layers className="w-3.5 h-3.5 text-amber-600" />
            <span className="uppercase">{grammar.jlptLevel} Grammar</span>
          </div>
          <div className="flex items-center gap-1">
            {learningStatus === 'learned' && <Check className="w-4 h-4 text-emerald-600" />}
            {(isReviewDue || quizStatus === 'needs_review') && <AlertCircle className="w-4 h-4 text-rose-500" />}
          </div>
        </div>

        {/* Grammar Pattern */}
        <div className="text-lg font-bold font-japanese text-japan-charcoal-900 dark:text-zinc-100 group-hover:text-japan-indigo-800 transition-colors mb-1.5">
          {grammar.pattern}
        </div>

        {/* English Meaning */}
        <div className="text-sm font-semibold text-japan-charcoal-800 dark:text-zinc-200 mb-2">
          {grammar.meaning}
        </div>

        {/* Structure preview */}
        <div className="text-xs bg-[#FAF8F5] dark:bg-zinc-800 p-2 rounded-lg font-mono text-japan-charcoal-600 dark:text-zinc-300 border border-japan-charcoal-100 dark:border-zinc-700">
          {grammar.structure}
        </div>
      </div>

      {/* Example preview */}
      {grammar.examples && grammar.examples.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-japan-charcoal-100 dark:border-zinc-800 text-xs">
          <div className="font-japanese text-japan-charcoal-700 dark:text-zinc-300 line-clamp-1">
            {grammar.examples[0].japanese}
          </div>
          <div className="text-[11px] text-japan-charcoal-400 line-clamp-1">
            {grammar.examples[0].english}
          </div>
        </div>
      )}
    </div>
  );
};
