import React, { useEffect } from 'react';
import { GrammarItem } from '../../types';
import { useProgress } from '../../context/ProgressContext';
import { soundEffects } from '../../utils/audio';
import { X, ChevronLeft, ChevronRight, Check, Layers, BookOpen } from 'lucide-react';

interface GrammarDetailModalProps {
  grammar: GrammarItem | null;
  isOpen: boolean;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export const GrammarDetailModal: React.FC<GrammarDetailModalProps> = ({
  grammar,
  isOpen,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}) => {
  const { getItemProgress, markItemLearningStatus } = useProgress();

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

  if (!isOpen || !grammar) return null;

  const progress = getItemProgress(grammar.id);
  const isLearned = progress?.learningStatus === 'learned';

  const handleToggleLearned = () => {
    soundEffects.playClick();
    const next = isLearned ? 'unlearned' : 'learned';
    markItemLearningStatus(grammar.id, grammar.jlptLevel, 'grammar', next);
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
      <div className="relative w-full max-w-xl bg-white dark:bg-zinc-900 rounded-2xl shadow-elevated border border-japan-charcoal-200 dark:border-zinc-800 overflow-hidden my-4">
        {/* Header */}
        <div className="px-6 py-3.5 bg-[#FAF8F5] dark:bg-zinc-800/80 border-b border-japan-charcoal-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-amber-600 text-white">
              {grammar.jlptLevel.toUpperCase()}
            </span>
            <span className="text-xs text-japan-charcoal-500 font-medium">Grammar Pattern</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-japan-charcoal-400 hover:text-japan-charcoal-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div className="p-5 rounded-2xl bg-[#FDFBF7] dark:bg-zinc-800/40 border border-japan-charcoal-100 dark:border-zinc-800 space-y-2">
            <div className="text-2xl font-bold font-japanese text-japan-charcoal-900 dark:text-zinc-100">
              {grammar.pattern}
            </div>
            <div className="text-sm font-semibold text-japan-indigo-800 dark:text-indigo-400">
              {grammar.meaning}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-japan-charcoal-400">Structure</div>
            <div className="p-3 rounded-xl bg-japan-charcoal-50 dark:bg-zinc-800 font-mono text-xs text-japan-charcoal-800 dark:text-zinc-200 border border-japan-charcoal-200/60 dark:border-zinc-700">
              {grammar.structure}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-japan-charcoal-400">Usage & Nuance</div>
            <p className="text-xs text-japan-charcoal-600 dark:text-zinc-300 leading-relaxed">
              {grammar.usage}
            </p>
          </div>

          {grammar.examples && grammar.examples.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-japan-charcoal-400">
                Examples
              </div>
              <div className="space-y-2">
                {grammar.examples.map((ex, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#FAF8F5] dark:bg-zinc-800/80 border border-japan-charcoal-200/60 dark:border-zinc-700 text-xs">
                    <div className="font-japanese font-semibold text-japan-charcoal-900 dark:text-zinc-100 mb-0.5">
                      {ex.japanese}
                    </div>
                    <div className="text-japan-charcoal-500">{ex.english}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {grammar.notes && (
            <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
              <strong>Note: </strong> {grammar.notes}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#FAF8F5] dark:bg-zinc-800/80 border-t border-japan-charcoal-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={onPrev} disabled={!hasPrev} className="p-2 rounded-xl border border-japan-charcoal-200 dark:border-zinc-700 disabled:opacity-30">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={onNext} disabled={!hasNext} className="p-2 rounded-xl border border-japan-charcoal-200 dark:border-zinc-700 disabled:opacity-30">
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
