import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  ItemProgressRecord,
  QuizAnswerRecord,
  DailyLogEntry,
  UserStreak,
  WeakAreaItem,
  JLPTLevel,
  CategoryType,
  ItemLearningStatus,
  ItemQuizStatus,
} from '../types';
import { storageService, defaultStreak } from '../services/storageService';
import { getCategoryItems, getLevelItemCounts } from '../data';

export interface CategoryStats {
  totalItems: number;
  learnedCount: number;
  unlearnedCount: number;
  reviewCount: number;
  completionPercentage: number;
  quizAccuracy: number;
  totalAttempts: number;
}

export interface LevelStats {
  level: JLPTLevel;
  totalItems: number;
  learnedCount: number;
  completionPercentage: number;
  categories: Record<CategoryType, CategoryStats>;
}

export interface GlobalStats {
  totalLearnedAllLevels: number;
  totalItemsAllLevels: number;
  overallMasteryPercentage: number;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  totalWrong: number;
  overallAccuracy: number;
  reviewItemsCount: number;
  streak: UserStreak;
  levelBreakdown: Record<JLPTLevel, LevelStats>;
}

interface ProgressContextType {
  itemProgressMap: Record<string, ItemProgressRecord>;
  quizHistory: QuizAnswerRecord[];
  weakAreasMap: Record<string, WeakAreaItem>;
  reviewQueue: string[];
  streak: UserStreak;
  dailyLogs: Record<string, DailyLogEntry>;

  // Status Actions
  markItemLearningStatus: (itemId: string, level: JLPTLevel, category: CategoryType, status: ItemLearningStatus) => void;
  recordQuizResult: (answer: QuizAnswerRecord) => void;
  addToReview: (itemId: string) => void;
  removeFromReview: (itemId: string) => void;

  // Stats Queries
  getItemProgress: (itemId: string) => ItemProgressRecord | undefined;
  getCategoryStats: (level: JLPTLevel, category: CategoryType) => CategoryStats;
  getLevelStats: (level: JLPTLevel) => LevelStats;
  getGlobalStats: () => GlobalStats;
  getDailyLog: (dateStr: string, level: JLPTLevel, category: CategoryType) => DailyLogEntry;
  getTodayTotalLog: () => { questionsAnswered: number; correct: number; wrong: number; newLearned: number; studyTimeMinutes: number; accuracy: number };

  // Study Time Tracking
  trackStudyTime: (level: JLPTLevel, category: CategoryType, minutes?: number) => void;

  // Export / Import / Reset
  exportProgressJSON: () => string;
  importProgressJSON: (json: string) => boolean;
  resetAllProgress: () => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [itemProgressMap, setItemProgressMap] = useState<Record<string, ItemProgressRecord>>({});
  const [quizHistory, setQuizHistory] = useState<QuizAnswerRecord[]>([]);
  const [weakAreasMap, setWeakAreasMap] = useState<Record<string, WeakAreaItem>>({});
  const [reviewQueue, setReviewQueue] = useState<string[]>([]);
  const [streak, setStreak] = useState<UserStreak>(defaultStreak);
  const [dailyLogs, setDailyLogs] = useState<Record<string, DailyLogEntry>>({});

  // Reload state from storage
  const reloadFromStorage = useCallback(() => {
    setItemProgressMap(storageService.getItemProgressMap());
    setQuizHistory(storageService.getQuizHistory());
    setWeakAreasMap(storageService.getWeakAreas());
    setReviewQueue(storageService.getReviewQueue());
    setStreak(storageService.updateStreakForToday());
    setDailyLogs(storageService.getDailyLogs());
  }, []);

  useEffect(() => {
    reloadFromStorage();
  }, [reloadFromStorage]);

  // Mark item learning status
  const markItemLearningStatus = useCallback(
    (itemId: string, level: JLPTLevel, category: CategoryType, status: ItemLearningStatus) => {
      const updated = storageService.saveItemLearningStatus(itemId, level, category, status);
      setItemProgressMap((prev) => ({ ...prev, [itemId]: updated }));

      if (status === 'learned') {
        storageService.logDailyNewLearned(itemId, level, category);
        setDailyLogs(storageService.getDailyLogs());
      }
    },
    []
  );

  // Record quiz answer
  const recordQuizResult = useCallback((answer: QuizAnswerRecord) => {
    const updatedRecord = storageService.recordQuizAnswer(answer);
    setItemProgressMap((prev) => ({ ...prev, [answer.itemId]: updatedRecord }));
    setQuizHistory(storageService.getQuizHistory());
    setWeakAreasMap(storageService.getWeakAreas());
    setReviewQueue(storageService.getReviewQueue());
    setDailyLogs(storageService.getDailyLogs());
    setStreak(storageService.getStreak());
  }, []);

  const addToReview = useCallback((itemId: string) => {
    storageService.addToReviewQueue(itemId);
    setReviewQueue(storageService.getReviewQueue());
  }, []);

  const removeFromReview = useCallback((itemId: string) => {
    storageService.removeFromReviewQueue(itemId);
    setReviewQueue(storageService.getReviewQueue());
  }, []);

  const getItemProgress = useCallback(
    (itemId: string): ItemProgressRecord | undefined => {
      return itemProgressMap[itemId];
    },
    [itemProgressMap]
  );

  // Compute category stats
  const getCategoryStats = useCallback(
    (level: JLPTLevel, category: CategoryType): CategoryStats => {
      const allCategoryItems = getCategoryItems(level, category);
      const totalItems = allCategoryItems.length;

      let learnedCount = 0;
      let reviewCount = 0;
      let totalAttempts = 0;
      let totalCorrect = 0;

      allCategoryItems.forEach((item) => {
        const prog = itemProgressMap[item.id];
        if (prog) {
          if (prog.learningStatus === 'learned') learnedCount++;
          if (reviewQueue.includes(item.id) || prog.quizStatus === 'needs_review' || prog.quizStatus === 'wrong') {
            reviewCount++;
          }
          totalAttempts += prog.attempts || 0;
          totalCorrect += prog.correct || 0;
        }
      });

      const unlearnedCount = Math.max(0, totalItems - learnedCount);
      const completionPercentage = totalItems > 0 ? Math.round((learnedCount / totalItems) * 100) : 0;
      const quizAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

      return {
        totalItems,
        learnedCount,
        unlearnedCount,
        reviewCount,
        completionPercentage,
        quizAccuracy,
        totalAttempts,
      };
    },
    [itemProgressMap, reviewQueue]
  );

  // Compute level stats
  const getLevelStats = useCallback(
    (level: JLPTLevel): LevelStats => {
      const categories: Record<CategoryType, CategoryStats> = {
        kanji: getCategoryStats(level, 'kanji'),
        vocabulary: getCategoryStats(level, 'vocabulary'),
        grammar: getCategoryStats(level, 'grammar'),
        other: getCategoryStats(level, 'other'),
      };

      const totalItems =
        categories.kanji.totalItems +
        categories.vocabulary.totalItems +
        categories.grammar.totalItems +
        categories.other.totalItems;

      const learnedCount =
        categories.kanji.learnedCount +
        categories.vocabulary.learnedCount +
        categories.grammar.learnedCount +
        categories.other.learnedCount;

      const completionPercentage = totalItems > 0 ? Math.round((learnedCount / totalItems) * 100) : 0;

      return {
        level,
        totalItems,
        learnedCount,
        completionPercentage,
        categories,
      };
    },
    [getCategoryStats]
  );

  // Compute global stats
  const getGlobalStats = useCallback((): GlobalStats => {
    const levels: JLPTLevel[] = ['n5', 'n4', 'n3', 'n2', 'n1'];
    const levelBreakdown: Record<JLPTLevel, LevelStats> = {
      n5: getLevelStats('n5'),
      n4: getLevelStats('n4'),
      n3: getLevelStats('n3'),
      n2: getLevelStats('n2'),
      n1: getLevelStats('n1'),
    };

    let totalLearnedAllLevels = 0;
    let totalItemsAllLevels = 0;

    levels.forEach((lvl) => {
      totalLearnedAllLevels += levelBreakdown[lvl].learnedCount;
      totalItemsAllLevels += levelBreakdown[lvl].totalItems;
    });

    const overallMasteryPercentage =
      totalItemsAllLevels > 0 ? Math.round((totalLearnedAllLevels / totalItemsAllLevels) * 100) : 0;

    let totalQuestionsAnswered = 0;
    let totalCorrect = 0;
    let totalWrong = 0;

    quizHistory.forEach((rec) => {
      totalQuestionsAnswered++;
      if (rec.isCorrect) totalCorrect++;
      else totalWrong++;
    });

    const overallAccuracy =
      totalQuestionsAnswered > 0 ? Math.round((totalCorrect / totalQuestionsAnswered) * 100) : 0;

    return {
      totalLearnedAllLevels,
      totalItemsAllLevels,
      overallMasteryPercentage,
      totalQuestionsAnswered,
      totalCorrect,
      totalWrong,
      overallAccuracy,
      reviewItemsCount: reviewQueue.length,
      streak,
      levelBreakdown,
    };
  }, [getLevelStats, quizHistory, reviewQueue, streak]);

  const getDailyLog = useCallback(
    (dateStr: string, level: JLPTLevel, category: CategoryType): DailyLogEntry => {
      return storageService.getDailyLogFor(dateStr, level, category);
    },
    []
  );

  const getTodayTotalLog = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const logs = storageService.getDailyLogs();
    let questionsAnswered = 0;
    let correct = 0;
    let wrong = 0;
    let newLearned = 0;
    let studyTimeMinutes = 0;

    Object.values(logs).forEach((log) => {
      if (log.date === today) {
        questionsAnswered += log.questionsAnswered;
        correct += log.correctCount;
        wrong += log.wrongCount;
        newLearned += log.newLearnedCount;
        studyTimeMinutes += log.studyTimeMinutes;
      }
    });

    const accuracy = questionsAnswered > 0 ? Math.round((correct / questionsAnswered) * 100) : 0;

    return {
      questionsAnswered,
      correct,
      wrong,
      newLearned,
      studyTimeMinutes,
      accuracy,
    };
  }, []);

  const trackStudyTime = useCallback((level: JLPTLevel, category: CategoryType, minutes: number = 1) => {
    storageService.incrementStudyTime(level, category, minutes);
    setDailyLogs(storageService.getDailyLogs());
  }, []);

  const exportProgressJSON = useCallback(() => {
    return storageService.exportAllData();
  }, []);

  const importProgressJSON = useCallback(
    (json: string) => {
      const ok = storageService.importAllData(json);
      if (ok) {
        reloadFromStorage();
      }
      return ok;
    },
    [reloadFromStorage]
  );

  const resetAllProgress = useCallback(() => {
    storageService.resetAllProgress();
    reloadFromStorage();
  }, [reloadFromStorage]);

  return (
    <ProgressContext.Provider
      value={{
        itemProgressMap,
        quizHistory,
        weakAreasMap,
        reviewQueue,
        streak,
        dailyLogs,
        markItemLearningStatus,
        recordQuizResult,
        addToReview,
        removeFromReview,
        getItemProgress,
        getCategoryStats,
        getLevelStats,
        getGlobalStats,
        getDailyLog,
        getTodayTotalLog,
        trackStudyTime,
        exportProgressJSON,
        importProgressJSON,
        resetAllProgress,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = (): ProgressContextType => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};
