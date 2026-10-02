import React, { useEffect } from 'react';
import { KanjiItem, JLPTLevel } from '../../types';
import { useProgress } from '../../context/ProgressContext';
import { soundEffects } from '../../utils/audio';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  CheckCircle2,
  AlertCircle,
  Volume2,
  Sparkles,
  BookOpen,
  Layers,
  RotateCcw,
} from 'lucide-react';

interface KanjiDetailModalProps {
  kanji: KanjiItem | null;
  isOpen: boolean;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export const KanjiDetailModal: React.FC<KanjiDetailModalProps> = ({
  kanji,
  isOpen,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}) => {
  const {
    getItemProgress,
    markItemLearningStatus,
    addToReview,
    removeFromReview,
    reviewQueue,
  } = useProgress();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowLeft' && hasPrev && onPrev) {
        onPrev();
      } else if (e.key === 'ArrowRight' && hasNext && onNext) {
        onNext();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasPrev, hasNext, onPrev, onNext, onClose]);

  if (!isOpen || !kanji) return null;

  const progress = getItemProgress(kanji.id);
  const isLearned = progress?.learningStatus === 'learned';
  const isReviewing = progress?.learningStatus === 'reviewing';
  const isReviewQueueDue = reviewQueue.includes(kanji.id);
  const attempts = progress?.attempts || 0;
  const correct = progress?.correct || 0;
  const accuracy = attempts > 0 ? Math.round((correct / attempts) * 100) : null;

  const handleToggleLearned = () => {
    soundEffects.playClick();
    const nextStatus = isLearned ? 'unlearned' : 'learned';
    markItemLearningStatus(kanji.id, kanji.jlptLevel, 'kanji', nextStatus);
  };

  const handleToggleReviewQueue = () => {
    soundEffects.playClick();
    if (isReviewQueueDue) {
      removeFromReview(kanji.id);
    } else {
      addToReview(kanji.id);
    }
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

  // Skill breakdown percentages
  const skills = [
    { key: 'meaning', label: 'Meaning' },
    { key: 'onyomi', label: "On'yomi (音読み)" },
    { key: 'kunyomi', label: "Kun'yomi (訓読み)" },
    { key: 'vocabulary', label: 'Vocabulary' },
    { key: 'sentence', label: 'Sentences' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 md:p-6 bg-japan-charcoal-900/60 backdrop-blur-xs animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-elevated border border-japan-charcoal-200 dark:border-zinc-800 overflow-hidden my-4">
        {/* Header Bar */}
        <div className="px-6 py-3.5 bg-[#FAF8F5] dark:bg-zinc-800/80 border-b border-japan-charcoal-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-japan-indigo-800 text-white">
              {kanji.jlptLevel.toUpperCase()}
            </span>
            <span className="text-xs text-japan-charcoal-500 font-medium">
              Kanji Details
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-1.5 rounded-lg text-japan-charcoal-400 hover:text-japan-charcoal-900 hover:bg-japan-charcoal-200/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[80vh] space-y-6">
          {/* Main Showcase Hero */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-[#FDFBF7] dark:bg-zinc-800/40 p-5 rounded-2xl border border-japan-charcoal-100 dark:border-zinc-800">
            {/* Big Kanji Character Box */}
            <div className="relative w-28 h-28 rounded-2xl bg-white dark:bg-zinc-900 border border-japan-charcoal-200 dark:border-zinc-700 shadow-sm flex flex-col items-center justify-center shrink-0">
              <span className="font-japanese text-6xl font-extrabold text-japan-charcoal-900 dark:text-zinc-100">
                {kanji.character}
              </span>
              <button
                onClick={() => speakText(kanji.character)}
                title="Pronounce Character"
                className="absolute bottom-1 right-1 p-1 rounded text-japan-charcoal-400 hover:text-japan-indigo-800 hover:bg-japan-charcoal-100"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Kanji Key Info */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div>
                <div className="text-xs uppercase tracking-wider text-japan-charcoal-400 font-bold">
                  English Meaning
                </div>
                <h2 className="text-2xl font-bold text-japan-charcoal-900 dark:text-zinc-100">
                  {kanji.meaning}
                </h2>
              </div>

              {/* Badges / Metadata */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-xs">
                <span className="px-2.5 py-1 rounded-md bg-japan-charcoal-100 dark:bg-zinc-800 text-japan-charcoal-700 dark:text-zinc-300 font-mono">
                  {kanji.strokeCount || 0} Strokes (画数)
                </span>
                {kanji.radical && (
                  <span className="px-2.5 py-1 rounded-md bg-japan-charcoal-100 dark:bg-zinc-800 text-japan-charcoal-700 dark:text-zinc-300 font-japanese">
                    Radical: {kanji.radical}
                  </span>
                )}
                {isLearned ? (
                  <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Learned
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-600 font-medium">
                    Not Learned
                  </span>
                )}
                {isReviewQueueDue && (
                  <span className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Needs Review
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Readings Section: Strictly Separated On'yomi & Kun'yomi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* On'yomi Box */}
            <div className="p-4 rounded-xl bg-white dark:bg-zinc-800 border border-japan-charcoal-200/80 dark:border-zinc-700">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-bold text-japan-indigo-800 dark:text-indigo-400 uppercase tracking-wide">
                  On'yomi (音読み - Chinese Reading)
                </div>
                <span className="text-[10px] text-japan-charcoal-400">Katakana</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {kanji.onyomi && kanji.onyomi.length > 0 ? (
                  kanji.onyomi.map((on, idx) => (
                    <button
                      key={idx}
                      onClick={() => speakText(on)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-japan-indigo-50 dark:bg-zinc-700/60 text-japan-indigo-900 dark:text-indigo-200 font-japanese text-base font-semibold hover:bg-japan-indigo-100 transition-colors"
                    >
                      <span>{on}</span>
                      <Volume2 className="w-3 h-3 opacity-60" />
                    </button>
                  ))
                ) : (
                  <span className="text-xs text-japan-charcoal-400">—</span>
                )}
              </div>
            </div>

            {/* Kun'yomi Box */}
            <div className="p-4 rounded-xl bg-white dark:bg-zinc-800 border border-japan-charcoal-200/80 dark:border-zinc-700">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-bold text-japan-vermilion-600 dark:text-rose-400 uppercase tracking-wide">
                  Kun'yomi (訓読み - Japanese Reading)
                </div>
                <span className="text-[10px] text-japan-charcoal-400">Hiragana</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {kanji.kunyomi && kanji.kunyomi.length > 0 ? (
                  kanji.kunyomi.map((kun, idx) => (
                    <button
                      key={idx}
                      onClick={() => speakText(kun.replace('.', ''))}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-japan-vermilion-50 dark:bg-zinc-700/60 text-japan-vermilion-700 dark:text-rose-300 font-japanese text-base font-semibold hover:bg-japan-vermilion-100 transition-colors"
                    >
                      <span>{kun}</span>
                      <Volume2 className="w-3 h-3 opacity-60" />
                    </button>
                  ))
                ) : (
                  <span className="text-xs text-japan-charcoal-400">—</span>
                )}
              </div>
            </div>
          </div>

          {/* Example Words Section */}
          {kanji.exampleWords && kanji.exampleWords.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-japan-charcoal-500 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Example Compound Words (熟語)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {kanji.exampleWords.map((word, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#FAF8F5] dark:bg-zinc-800/80 border border-japan-charcoal-200/60 dark:border-zinc-700 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs text-japan-charcoal-400 font-japanese">
                        {word.reading}
                      </div>
                      <div className="text-base font-bold font-japanese text-japan-charcoal-900 dark:text-zinc-100">
                        {word.word}
                      </div>
                      <div className="text-xs text-japan-charcoal-600 dark:text-zinc-400">
                        {word.meaning}
                      </div>
                    </div>
                    <button
                      onClick={() => speakText(word.word)}
                      className="p-2 text-japan-charcoal-400 hover:text-japan-indigo-800 hover:bg-white dark:hover:bg-zinc-700 rounded-lg transition-colors"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Example Sentences */}
          {kanji.exampleSentences && kanji.exampleSentences.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-japan-charcoal-500 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> Example Sentences (例文)
              </h4>
              <div className="space-y-2">
                {kanji.exampleSentences.map((sent, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#FAF8F5] dark:bg-zinc-800/80 border border-japan-charcoal-200/60 dark:border-zinc-700 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      {sent.reading && (
                        <div className="text-xs text-japan-charcoal-400 font-japanese">
                          {sent.reading}
                        </div>
                      )}
                      <div className="text-sm font-semibold font-japanese text-japan-charcoal-900 dark:text-zinc-100">
                        {sent.japanese}
                      </div>
                      <div className="text-xs text-japan-charcoal-500 dark:text-zinc-400">
                        {sent.english}
                      </div>
                    </div>
                    <button
                      onClick={() => speakText(sent.japanese)}
                      className="p-2 text-japan-charcoal-400 hover:text-japan-indigo-800 hover:bg-white dark:hover:bg-zinc-700 rounded-lg shrink-0 transition-colors"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance & Skill Breakdown */}
          <div className="p-4 rounded-xl bg-white dark:bg-zinc-800 border border-japan-charcoal-200/80 dark:border-zinc-700 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-japan-charcoal-700 dark:text-zinc-300">
                Performance & Skill Mastery
              </h4>
              <span className="text-xs font-mono text-japan-charcoal-500">
                {attempts} Attempts • {accuracy !== null ? `${accuracy}% Accuracy` : 'Not yet quizzed'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {skills.map((sk) => {
                const stat = progress?.skillBreakdown?.[sk.key];
                const pct = stat && stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : null;
                return (
                  <div
                    key={sk.key}
                    className="p-2 rounded-lg bg-[#FAF8F5] dark:bg-zinc-900/60 border border-japan-charcoal-100 dark:border-zinc-700/60 text-xs"
                  >
                    <div className="text-[10px] text-japan-charcoal-400 truncate">{sk.label}</div>
                    <div className="font-bold text-japan-charcoal-800 dark:text-zinc-200 mt-0.5">
                      {pct !== null ? `${pct}% (${stat?.correct}/${stat?.total})` : '—'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Navigation & Status Actions */}
        <div className="px-6 py-4 bg-[#FAF8F5] dark:bg-zinc-800/80 border-t border-japan-charcoal-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          {/* Prev / Next buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onPrev}
              disabled={!hasPrev}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-800 border border-japan-charcoal-200 dark:border-zinc-700 text-japan-charcoal-700 dark:text-zinc-300 hover:bg-japan-charcoal-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <button
              onClick={onNext}
              disabled={!hasNext}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-800 border border-japan-charcoal-200 dark:border-zinc-700 text-japan-charcoal-700 dark:text-zinc-300 hover:bg-japan-charcoal-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleReviewQueue}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isReviewQueueDue
                  ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                  : 'bg-white dark:bg-zinc-800 text-japan-charcoal-700 dark:text-zinc-300 border-japan-charcoal-200 dark:border-zinc-700 hover:bg-japan-charcoal-50'
              }`}
            >
              {isReviewQueueDue ? 'Remove from Review' : 'Mark for Review'}
            </button>

            <button
              onClick={handleToggleLearned}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                isLearned
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-japan-indigo-800 hover:bg-japan-indigo-900 text-white'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{isLearned ? 'Learned ✓' : 'Mark as Learned'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
