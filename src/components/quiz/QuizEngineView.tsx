import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  QuizQuestion,
  JLPTLevel,
  CategoryType,
  QuizAnswerRecord,
} from '../../types';
import { useProgress } from '../../context/ProgressContext';
import { soundEffects } from '../../utils/audio';
import {
  CheckCircle,
  XCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Trophy,
  AlertCircle,
  Layers,
  ChevronRight,
  ListFilter,
  Sliders,
} from 'lucide-react';

interface QuizEngineViewProps {
  questions: QuizQuestion[];
  level: JLPTLevel;
  category: CategoryType;
  onRestart: () => void;
  onOpenSettings: () => void;
  onBackToLearning: () => void;
}

export const QuizEngineView: React.FC<QuizEngineViewProps> = ({
  questions,
  level,
  category,
  onRestart,
  onOpenSettings,
  onBackToLearning,
}) => {
  const { recordQuizResult } = useProgress();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [sessionAnswers, setSessionAnswers] = useState<QuizAnswerRecord[]>([]);

  // Reset when questions list changes
  useEffect(() => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setQuizFinished(false);
    setSessionAnswers([]);
  }, [questions]);

  const currentQ = questions[currentIndex];
  const correctCount = sessionAnswers.filter((a) => a.isCorrect).length;
  const wrongCount = sessionAnswers.filter((a) => !a.isCorrect).length;
  const progressPercentage = Math.round(((currentIndex + (isAnswerSubmitted ? 1 : 0)) / questions.length) * 100);

  const handleSelectOption = (option: string) => {
    if (isAnswerSubmitted) return;
    soundEffects.playClick();
    setSelectedOption(option);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOption || isAnswerSubmitted) return;

    const isCorrect = selectedOption === currentQ.correctAnswer;
    setIsAnswerSubmitted(true);

    if (isCorrect) {
      soundEffects.playCorrect();
    } else {
      soundEffects.playWrong();
    }

    const answerRecord: QuizAnswerRecord = {
      questionId: currentQ.id,
      itemId: currentQ.itemId,
      level: currentQ.level,
      category: currentQ.category,
      skill: currentQ.skillType,
      prompt: currentQ.prompt,
      selectedAnswer: selectedOption,
      correctAnswer: currentQ.correctAnswer,
      isCorrect,
      timestamp: new Date().toISOString(),
    };

    setSessionAnswers((prev) => [...prev, answerRecord]);
    recordQuizResult(answerRecord);
  };

  const handleNextQuestion = () => {
    soundEffects.playClick();
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      // Finish quiz
      setQuizFinished(true);
      const finalCorrect = sessionAnswers.filter((a) => a.isCorrect).length;
      const finalAccuracy = (finalCorrect / questions.length) * 100;

      if (finalAccuracy >= 80) {
        soundEffects.playSuccessFanfare();
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#E83929', '#14213D', '#10B981', '#F59E0B'],
          });
        } catch {
          // Confetti fallback
        }
      }
    }
  };

  // Keyboard shortcut support (1, 2, 3, 4, Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (quizFinished) return;
      if (!isAnswerSubmitted) {
        const keyNum = parseInt(e.key);
        if (keyNum >= 1 && keyNum <= currentQ?.options.length) {
          handleSelectOption(currentQ.options[keyNum - 1]);
        } else if (e.key === 'Enter' && selectedOption) {
          handleSubmitAnswer();
        }
      } else if (e.key === 'Enter') {
        handleNextQuestion();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quizFinished, isAnswerSubmitted, selectedOption, currentQ]);

  if (!questions || questions.length === 0) {
    return (
      <div className="washi-card p-10 rounded-2xl text-center space-y-4 max-w-md mx-auto my-8">
        <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-japan-charcoal-900 dark:text-zinc-100">
          No Quiz Questions Available
        </h3>
        <p className="text-xs text-japan-charcoal-500">
          We couldn't generate questions for the selected criteria. Try adjusting your quiz settings or selecting more items.
        </p>
        <div className="flex gap-2 justify-center pt-2">
          <button
            onClick={onOpenSettings}
            className="px-4 py-2 rounded-xl bg-japan-indigo-800 text-white text-xs font-bold shadow-sm"
          >
            Adjust Quiz Settings
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------
  // SUMMARY VIEW AFTER COMPLETION
  // -------------------------------------------------------------------
  if (quizFinished) {
    const totalQ = sessionAnswers.length;
    const finalAccuracy = totalQ > 0 ? Math.round((correctCount / totalQ) * 100) : 0;

    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div className="washi-card p-6 md:p-8 rounded-3xl text-center border border-japan-charcoal-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-elevated">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 border border-amber-200 dark:border-amber-800 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Trophy className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-japan-charcoal-900 dark:text-zinc-100 tracking-tight">
            Quiz Completed! お疲れ様でした！
          </h2>
          <p className="text-xs text-japan-charcoal-500 mt-1">
            {level.toUpperCase()} {category.toUpperCase()} Session Summary
          </p>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 my-6 text-center">
            <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-zinc-800 border border-japan-charcoal-100 dark:border-zinc-700">
              <span className="text-[10px] uppercase font-bold text-japan-charcoal-400 block">Accuracy</span>
              <span className="text-2xl font-black text-japan-indigo-800 dark:text-indigo-400">{finalAccuracy}%</span>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block">Correct</span>
              <span className="text-2xl font-black text-emerald-600">{correctCount}</span>
            </div>
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800">
              <span className="text-[10px] uppercase font-bold text-rose-700 block">Mistakes</span>
              <span className="text-2xl font-black text-rose-600">{wrongCount}</span>
            </div>
          </div>

          {/* Review items note */}
          {wrongCount > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 mb-6 text-left flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Automatic Review Tracking: </strong>
                The {wrongCount} mistake(s) made in this quiz have been automatically added to your Review Queue.
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onRestart}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-japan-indigo-800 hover:bg-japan-indigo-900 text-white text-xs font-bold shadow-sm transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Quiz</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-japan-charcoal-200 dark:border-zinc-700 text-japan-charcoal-800 dark:text-zinc-200 text-xs font-semibold hover:bg-japan-charcoal-50 transition-all"
            >
              <Sliders className="w-4 h-4" />
              <span>Configure New Quiz</span>
            </button>

            <button
              onClick={onBackToLearning}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FAF8F5] dark:bg-zinc-800 border border-japan-charcoal-200 dark:border-zinc-700 text-japan-charcoal-800 dark:text-zinc-200 text-xs font-semibold hover:bg-japan-charcoal-100 transition-all"
            >
              <ListFilter className="w-4 h-4" />
              <span>Back to Learning List</span>
            </button>
          </div>
        </div>

        {/* Detailed Question Review List */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-japan-charcoal-500">
            Session Answer Review
          </h3>
          <div className="space-y-2">
            {sessionAnswers.map((ans, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl border text-xs flex items-start justify-between gap-3 ${
                  ans.isCorrect
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-japan-charcoal-400">Q{idx + 1}</span>
                    <span className="font-semibold text-japan-charcoal-800 dark:text-zinc-200">
                      {ans.prompt}
                    </span>
                  </div>
                  <div className="text-[11px]">
                    Your Answer: <strong className={ans.isCorrect ? 'text-emerald-700' : 'text-rose-700'}>{ans.selectedAnswer}</strong>
                    {!ans.isCorrect && (
                      <span className="text-emerald-700 ml-2">
                        (Correct: <strong>{ans.correctAnswer}</strong>)
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0">
                  {ans.isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------
  // ACTIVE QUESTION SCREEN
  // -------------------------------------------------------------------
  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-fade-in">
      {/* Top Header Bar: Progress, Question Counter & Accuracy */}
      <div className="flex items-center justify-between text-xs font-semibold text-japan-charcoal-500 bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-japan-charcoal-200/80 dark:border-zinc-800 shadow-subtle">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-japan-indigo-800 text-white font-bold uppercase text-[10px]">
            {level.toUpperCase()} {category.toUpperCase()}
          </span>
          <span>
            Question <strong>{currentIndex + 1}</strong> of {questions.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-emerald-600 font-bold">✓ {correctCount}</span>
          <span className="text-rose-600 font-bold">✕ {wrongCount}</span>
          <button
            onClick={onOpenSettings}
            className="p-1 rounded text-japan-charcoal-400 hover:text-japan-charcoal-800 hover:bg-japan-charcoal-100"
            title="Quiz settings"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-japan-charcoal-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-japan-indigo-800 transition-all duration-300 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="washi-card p-6 md:p-8 rounded-3xl border border-japan-charcoal-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-card space-y-6">
        {/* Skill Category Tag */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-japan-indigo-800 dark:text-indigo-400 px-2.5 py-0.5 rounded-md bg-japan-indigo-50 dark:bg-zinc-800 border border-japan-indigo-100 dark:border-zinc-700">
            Skill: {currentQ.skillType.toUpperCase()}
          </span>
          {currentQ.hint && (
            <span className="text-[11px] text-japan-charcoal-400 font-japanese">
              {currentQ.hint}
            </span>
          )}
        </div>

        {/* Question Prompt */}
        <div className="text-center space-y-3 py-2">
          <h2 className="text-lg md:text-xl font-bold text-japan-charcoal-900 dark:text-zinc-100 leading-snug">
            {currentQ.prompt}
          </h2>
          {currentQ.subPrompt && (
            <div className="text-base md:text-lg font-japanese font-semibold text-japan-indigo-800 dark:text-indigo-400 p-2.5 bg-[#FAF8F5] dark:bg-zinc-800 rounded-xl inline-block border border-japan-charcoal-100 dark:border-zinc-700">
              {currentQ.subPrompt}
            </div>
          )}
        </div>

        {/* 4 Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currentQ.options.map((opt, idx) => {
            const isSelected = selectedOption === opt;
            const isCorrectAnswer = opt === currentQ.correctAnswer;

            let buttonStyle = 'bg-[#FAF8F5] dark:bg-zinc-800/80 border-japan-charcoal-200 dark:border-zinc-700 hover:border-japan-indigo-800 text-japan-charcoal-800 dark:text-zinc-200';

            if (isAnswerSubmitted) {
              if (isCorrectAnswer) {
                // Correct option turns green
                buttonStyle = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/50 font-bold';
              } else if (isSelected && !isCorrectAnswer) {
                // Selected wrong option turns red
                buttonStyle = 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-900 dark:text-rose-200 ring-2 ring-rose-500/50';
              } else {
                buttonStyle = 'bg-japan-charcoal-50 dark:bg-zinc-800/40 border-transparent opacity-50';
              }
            } else if (isSelected) {
              buttonStyle = 'bg-japan-indigo-50 dark:bg-zinc-800 border-japan-indigo-800 text-japan-indigo-900 dark:text-zinc-100 ring-2 ring-japan-indigo-800/20 font-bold';
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectOption(opt)}
                disabled={isAnswerSubmitted}
                className={`p-4 rounded-2xl border text-sm font-medium flex items-center justify-between text-left transition-all duration-150 ${buttonStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-white dark:bg-zinc-700 border border-japan-charcoal-200/80 dark:border-zinc-600 flex items-center justify-center text-[11px] font-bold text-japan-charcoal-500 shrink-0">
                    {idx + 1}
                  </span>
                  <span className="font-japanese text-sm leading-snug">{opt}</span>
                </div>

                {isAnswerSubmitted && isCorrectAnswer && (
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 ml-2" />
                )}
                {isAnswerSubmitted && isSelected && !isCorrectAnswer && (
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation Card after submission */}
        {isAnswerSubmitted && (
          <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-zinc-800 border border-japan-charcoal-200/80 dark:border-zinc-700 space-y-1.5 animate-fade-in">
            <div className="text-[10px] font-bold uppercase tracking-wider text-japan-charcoal-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-japan-indigo-800" /> Explanation & Insight
            </div>
            <p className="text-xs text-japan-charcoal-700 dark:text-zinc-300 font-japanese leading-relaxed">
              {currentQ.explanation}
            </p>
          </div>
        )}

        {/* Action Controls */}
        <div className="pt-2">
          {!isAnswerSubmitted ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={!selectedOption}
              className="w-full py-3.5 rounded-2xl bg-japan-indigo-800 hover:bg-japan-indigo-900 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Submit Answer (Enter)</span>
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="w-full py-3.5 rounded-2xl bg-japan-indigo-800 hover:bg-japan-indigo-900 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>{currentIndex + 1 === questions.length ? 'See Final Results' : 'Next Question'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
