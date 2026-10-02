import React, { useState } from 'react';
import { JLPTLevel, CategoryType, JLPTItem } from '../../types';
import { useProgress } from '../../context/ProgressContext';
import { useSettings } from '../../context/SettingsContext';
import { getCategoryItems, getItemById } from '../../data';
import { ProgressBar } from '../common/ProgressBar';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Target,
  Sparkles,
  BookOpen,
  Award,
  ChevronRight,
  Flame,
} from 'lucide-react';

interface CategoryDailyProgressViewProps {
  level: JLPTLevel;
  category: CategoryType;
}

export const CategoryDailyProgressView: React.FC<CategoryDailyProgressViewProps> = ({
  level,
  category,
}) => {
  const { getDailyLog, streak, itemProgressMap, reviewQueue } = useProgress();
  const { settings } = useSettings();

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const dailyLog = getDailyLog(selectedDate, level, category);

  const totalQuestions = dailyLog.questionsAnswered;
  const correctCount = dailyLog.correctCount;
  const wrongCount = dailyLog.wrongCount;
  const accuracy = totalQuestions > 0 ? ((correctCount / totalQuestions) * 100).toFixed(1) : '0.0';

  const dailyGoal = settings.dailyNewItemsGoal || 10;
  const goalPercentage = Math.min(100, Math.round((dailyLog.newLearnedCount / dailyGoal) * 100));

  // Retrieve item objects for today's studied items
  const studiedItemsList = React.useMemo(() => {
    const ids = Array.from(
      new Set([...dailyLog.correctItemIds, ...dailyLog.wrongItemIds, ...dailyLog.reviewedItemIds])
    );
    return ids.map((id) => {
      const item = getItemById(id);
      const isCorrect = dailyLog.correctItemIds.includes(id);
      const isWrong = dailyLog.wrongItemIds.includes(id);
      const isReview = reviewQueue.includes(id);

      return {
        id,
        item,
        isCorrect,
        isWrong,
        isReview,
      };
    });
  }, [dailyLog, reviewQueue]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Date Header & Title Bar */}
      <div className="washi-card p-5 rounded-2xl border border-japan-charcoal-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-subtle flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 border border-amber-200 dark:border-amber-800 flex items-center justify-center shadow-xs">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-japan-charcoal-900 dark:text-zinc-100 uppercase tracking-wide">
              {level.toUpperCase()} {category.toUpperCase()} • Daily Progress
            </h2>
            <div className="text-xs text-japan-charcoal-500">
              Activity log and retention tracker for {selectedDate === todayStr ? 'Today' : selectedDate}
            </div>
          </div>
        </div>

        {/* Date Selector input */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-japan-charcoal-500 font-medium">Select Date:</span>
          <input
            type="date"
            value={selectedDate}
            max={todayStr}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-japan-charcoal-200 dark:border-zinc-700 bg-[#FAF8F5] dark:bg-zinc-800 text-japan-charcoal-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-japan-indigo-800 shadow-xs"
          />
        </div>
      </div>

      {/* Primary 2x4 Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Today's Goal */}
        <div className="washi-card p-4 rounded-2xl border border-japan-charcoal-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-subtle space-y-2">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-japan-charcoal-400">
            <span>New Items Goal</span>
            <Target className="w-3.5 h-3.5 text-japan-indigo-800" />
          </div>
          <div className="text-2xl font-black text-japan-charcoal-900 dark:text-zinc-100">
            {dailyLog.newLearnedCount} <span className="text-sm font-semibold text-japan-charcoal-400">/ {dailyGoal}</span>
          </div>
          <ProgressBar value={goalPercentage} height="h-1.5" color="bg-japan-indigo-800" />
        </div>

        {/* Quiz Questions */}
        <div className="washi-card p-4 rounded-2xl border border-japan-charcoal-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-subtle space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-japan-charcoal-400">
            <span>Quiz Questions</span>
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-japan-charcoal-900 dark:text-zinc-100">
            {totalQuestions}
          </div>
          <div className="text-[11px] text-japan-charcoal-500">
            {correctCount} Correct • {wrongCount} Wrong
          </div>
        </div>

        {/* Accuracy */}
        <div className="washi-card p-4 rounded-2xl border border-japan-charcoal-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-subtle space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-japan-charcoal-400">
            <span>Accuracy</span>
            <Award className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {accuracy}%
          </div>
          <div className="text-[11px] text-japan-charcoal-500">
            {totalQuestions > 0 ? `${correctCount} of ${totalQuestions} passed` : 'No quiz yet'}
          </div>
        </div>

        {/* Study Time */}
        <div className="washi-card p-4 rounded-2xl border border-japan-charcoal-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-subtle space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-japan-charcoal-400">
            <span>Study Time</span>
            <Clock className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-japan-charcoal-900 dark:text-zinc-100">
            {dailyLog.studyTimeMinutes} <span className="text-xs font-semibold text-japan-charcoal-400">min</span>
          </div>
          <div className="text-[11px] text-japan-charcoal-500">
            Goal: {settings.dailyStudyGoalMinutes} min
          </div>
        </div>
      </div>

      {/* Today's Studied Items List */}
      <div className="washi-card p-6 rounded-3xl border border-japan-charcoal-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-japan-charcoal-800 dark:text-zinc-200 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-japan-indigo-800" />
            <span>Today's Studied Material</span>
          </h3>
          <span className="text-xs font-mono text-japan-charcoal-500">
            {studiedItemsList.length} Item(s) Recorded
          </span>
        </div>

        {studiedItemsList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {studiedItemsList.map(({ id, item, isCorrect, isWrong, isReview }) => {
              const title = (item as any)?.character || (item as any)?.word || (item as any)?.pattern || (item as any)?.title || id;
              const sub = (item as any)?.meaning || '';

              return (
                <div
                  key={id}
                  className="p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-zinc-800/80 border border-japan-charcoal-200/60 dark:border-zinc-700 flex items-center justify-between gap-3"
                >
                  <div className="truncate">
                    <div className="font-japanese font-bold text-base text-japan-charcoal-900 dark:text-zinc-100 truncate">
                      {title}
                    </div>
                    <div className="text-xs text-japan-charcoal-500 truncate">{sub}</div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {isCorrect && (
                      <span title="Answered Correctly" className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        ✓ Correct
                      </span>
                    )}
                    {isWrong && (
                      <span title="Made Mistake" className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                        ✕ Wrong
                      </span>
                    )}
                    {isReview && (
                      <span title="Needs Review" className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                        ! Review
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-japan-charcoal-400 space-y-1">
            <p>No activity logged for this date yet.</p>
            <p className="text-japan-indigo-800 dark:text-indigo-400 font-semibold">
              Complete a quiz or mark items as learned to populate today's stats!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
