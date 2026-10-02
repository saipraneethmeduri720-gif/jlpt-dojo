import React from 'react';
import { OtherItem, ItemProgressRecord } from '../../types';
import { Check, AlertCircle, Compass } from 'lucide-react';

interface OtherCardProps {
  item: OtherItem;
  progress?: ItemProgressRecord;
  isReviewDue?: boolean;
  onClick: (item: OtherItem) => void;
}

export const OtherCard: React.FC<OtherCardProps> = ({
  item,
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
      onClick={() => onClick(item)}
      className={`washi-card p-5 rounded-2xl border ${borderStyle} bg-white dark:bg-zinc-900 cursor-pointer flex flex-col justify-between hover:border-japan-indigo-800 transition-all shadow-subtle hover:shadow-card group`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
            {item.subCategory}
          </span>
          <div className="flex items-center gap-1">
            {learningStatus === 'learned' && <Check className="w-4 h-4 text-emerald-600" />}
            {(isReviewDue || quizStatus === 'needs_review') && <AlertCircle className="w-4 h-4 text-rose-500" />}
          </div>
        </div>

        <div className="font-bold text-base text-japan-charcoal-900 dark:text-zinc-100 group-hover:text-japan-indigo-800 transition-colors mb-1">
          {item.title}
        </div>

        <div className="text-xl font-bold font-japanese text-japan-indigo-800 dark:text-indigo-400 mb-1">
          {item.japanese}
        </div>

        <div className="text-xs text-japan-charcoal-500 font-japanese mb-2">
          {item.reading}
        </div>

        <div className="text-xs font-semibold text-japan-charcoal-700 dark:text-zinc-300">
          {item.meaning}
        </div>
      </div>

      {item.notes && (
        <div className="mt-3 pt-2 border-t border-japan-charcoal-100 dark:border-zinc-800 text-[11px] text-japan-charcoal-500">
          {item.notes}
        </div>
      )}
    </div>
  );
};
