import React from 'react';
import { VocabularyItem, ItemProgressRecord } from '../../types';
import { Check, AlertCircle, Volume2 } from 'lucide-react';
import { soundEffects } from '../../utils/audio';

interface VocabularyCardProps {
  vocab: VocabularyItem;
  progress?: ItemProgressRecord;
  isReviewDue?: boolean;
  onClick: (vocab: VocabularyItem) => void;
}

export const VocabularyCard: React.FC<VocabularyCardProps> = ({
  vocab,
  progress,
  isReviewDue,
  onClick,
}) => {
  const learningStatus = progress?.learningStatus || 'unlearned';
  const quizStatus = progress?.quizStatus || 'untested';

  const speakJapanese = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.playClick();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(vocab.word || vocab.reading);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  let borderStyle = 'border-japan-charcoal-200/90 dark:border-zinc-800';
  if (isReviewDue || quizStatus === 'needs_review' || quizStatus === 'wrong') {
    borderStyle = 'border-rose-300 dark:border-rose-800 bg-rose-50/30';
  } else if (learningStatus === 'learned') {
    borderStyle = 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/20';
  }

  return (
    <div
      onClick={() => onClick(vocab)}
      className={`washi-card p-4 rounded-2xl border ${borderStyle} bg-white dark:bg-zinc-900 cursor-pointer flex flex-col justify-between hover:border-japan-indigo-800 transition-all shadow-subtle hover:shadow-card group`}
    >
      <div>
        {/* Top bar */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-japan-charcoal-100 dark:bg-zinc-800 text-japan-charcoal-600 dark:text-zinc-300">
            {vocab.partOfSpeech}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={speakJapanese}
              title="Pronounce"
              className="p-1 rounded-md text-japan-charcoal-400 hover:text-japan-indigo-800 hover:bg-japan-charcoal-100 dark:hover:bg-zinc-800"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
            {learningStatus === 'learned' && (
              <Check className="w-4 h-4 text-emerald-600" />
            )}
            {(isReviewDue || quizStatus === 'needs_review') && (
              <AlertCircle className="w-4 h-4 text-rose-500" />
            )}
          </div>
        </div>

        {/* Word & Reading */}
        <div className="mb-2">
          <div className="text-xs font-japanese text-japan-charcoal-500 font-medium">
            {vocab.reading}
          </div>
          <div className="text-xl font-bold font-japanese text-japan-charcoal-900 dark:text-zinc-100 group-hover:text-japan-indigo-800 transition-colors">
            {vocab.word}
          </div>
        </div>

        {/* English Meaning */}
        <div className="text-sm font-semibold text-japan-charcoal-800 dark:text-zinc-200">
          {vocab.meaning}
        </div>
      </div>

      {/* Example sentence excerpt */}
      {vocab.exampleSentence && (
        <div className="mt-3 pt-2.5 border-t border-japan-charcoal-100 dark:border-zinc-800 text-xs">
          <div className="font-japanese text-japan-charcoal-600 dark:text-zinc-400 line-clamp-1">
            {vocab.exampleSentence.japanese}
          </div>
          <div className="text-[11px] text-japan-charcoal-400 line-clamp-1">
            {vocab.exampleSentence.english}
          </div>
        </div>
      )}
    </div>
  );
};
