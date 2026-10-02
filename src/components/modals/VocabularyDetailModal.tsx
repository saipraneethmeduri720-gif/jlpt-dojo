import React, { useEffect } from 'react';
import { VocabularyItem } from '../../types';
import { useProgress } from '../../context/ProgressContext';
import { soundEffects } from '../../utils/audio';
import { X, ChevronLeft, ChevronRight, Check, AlertCircle, Volume2, BookOpen } from 'lucide-react';

interface VocabularyDetailModalProps {
  vocab: VocabularyItem | null;
  isOpen: boolean;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export const VocabularyDetailModal: React.FC<VocabularyDetailModalProps> = ({
  vocab,
  isOpen,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}) => {
  const { getItemProgress, markItemLearningStatus, addToReview, removeFromReview, reviewQueue } = useProgress();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowLeft' && hasPrev && onPrev) onPrev();
      else if (e.key === 'ArrowRight' && hasNext && onNext) onNext();
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasPrev, hasNext, onPrev, onNext, onClose]);

  if (!isOpen || !vocab) return null;

  const progress = getItemProgress(vocab.id);
  const isLearned = progress?.learningStatus === 'learned';
  const isReviewQueueDue = reviewQueue.includes(vocab.id);

  const handleToggleLearned = () => {
    soundEffects.playClick();
    const next = isLearned ? 'unlearned' : 'learned';
    markItemLearningStatus(vocab.id, vocab.jlptLevel, 'vocabulary', next);
  };

  const speakText = (text: string) => {
    soundEffects.playClick();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-japan-charcoal-900/60 backdrop-blur-xs animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-elevated border border-japan-charcoal-200 dark:border-zinc-800 overflow-hidden my-4">
        {/* Header */}
        <div className="px-6 py-3.5 bg-[#FAF8F5] dark:bg-zinc-800/80 border-b border-japan-charcoal-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-indigo-700 text-white">
              {vocab.jlptLevel.toUpperCase()}
            </span>
            <span className="text-xs text-japan-charcoal-500 font-medium">Vocabulary Details</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-japan-charcoal-400 hover:text-japan-charcoal-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div className="text-center p-5 rounded-2xl bg-[#FDFBF7] dark:bg-zinc-800/40 border border-japan-charcoal-100 dark:border-zinc-800 space-y-1 relative">
            <div className="text-sm font-japanese text-japan-charcoal-500 font-medium">
              {vocab.reading}
            </div>
            <div className="text-3xl font-bold font-japanese text-japan-charcoal-900 dark:text-zinc-100">
              {vocab.word}
            </div>
            <div className="text-base font-semibold text-japan-charcoal-700 dark:text-zinc-300 pt-1">
              {vocab.meaning}
            </div>
            <button
              onClick={() => speakText(vocab.word || vocab.reading)}
              title="Pronounce"
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white dark:bg-zinc-800 border border-japan-charcoal-200 dark:border-zinc-700 text-japan-indigo-800 dark:text-indigo-400 hover:bg-japan-indigo-50 shadow-xs"
            >
              <Volume2 className="w-3.5 h-3.5" /> Listen Audio
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#FAF8F5] dark:bg-zinc-800 border border-japan-charcoal-200/60 dark:border-zinc-700">
              <span className="text-japan-charcoal-400 block text-[10px] uppercase font-bold">Part of Speech</span>
              <span className="font-semibold text-japan-charcoal-800 dark:text-zinc-200">{vocab.partOfSpeech}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#FAF8F5] dark:bg-zinc-800 border border-japan-charcoal-200/60 dark:border-zinc-700">
              <span className="text-japan-charcoal-400 block text-[10px] uppercase font-bold">Kanji</span>
              <span className="font-japanese font-semibold text-japan-charcoal-800 dark:text-zinc-200">{vocab.kanji}</span>
            </div>
          </div>

          {vocab.exampleSentence && (
            <div className="p-4 rounded-xl bg-white dark:bg-zinc-800 border border-japan-charcoal-200/80 dark:border-zinc-700 space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-japan-charcoal-400">
                Example Sentence
              </div>
              <div className="font-japanese font-semibold text-japan-charcoal-900 dark:text-zinc-100 text-sm">
                {vocab.exampleSentence.japanese}
              </div>
              <div className="text-xs text-japan-charcoal-500">
                {vocab.exampleSentence.english}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#FAF8F5] dark:bg-zinc-800/80 border-t border-japan-charcoal-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onPrev}
              disabled={!hasPrev}
              className="p-2 rounded-xl border border-japan-charcoal-200 dark:border-zinc-700 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onNext}
              disabled={!hasNext}
              className="p-2 rounded-xl border border-japan-charcoal-200 dark:border-zinc-700 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleToggleLearned}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold ${
              isLearned ? 'bg-emerald-600 text-white' : 'bg-japan-indigo-800 text-white'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{isLearned ? 'Learned ✓' : 'Mark as Learned'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
