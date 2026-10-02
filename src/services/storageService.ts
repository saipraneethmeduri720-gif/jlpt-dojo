import {
  ItemProgressRecord,
  QuizAnswerRecord,
  DailyLogEntry,
  UserStreak,
  UserSettings,
  UserProfile,
  WeakAreaItem,
  JLPTLevel,
  CategoryType,
  ItemLearningStatus,
  ItemQuizStatus,
} from '../types';

const STORAGE_KEYS = {
  AUTH_USER: 'jlpt_auth_user',
  ITEM_PROGRESS: 'jlpt_item_progress_v1',
  QUIZ_HISTORY: 'jlpt_quiz_history_v1',
  DAILY_LOGS: 'jlpt_daily_logs_v1',
  USER_STREAK: 'jlpt_user_streak_v1',
  USER_SETTINGS: 'jlpt_user_settings_v1',
  WEAK_AREAS: 'jlpt_weak_areas_v1',
  REVIEW_QUEUE: 'jlpt_review_queue_v1',
};

export interface ExportDataPayload {
  version: string;
  exportedAt: string;
  user: UserProfile | null;
  itemProgress: Record<string, ItemProgressRecord>;
  quizHistory: QuizAnswerRecord[];
  dailyLogs: Record<string, DailyLogEntry>;
  streak: UserStreak;
  settings: UserSettings;
  weakAreas: Record<string, WeakAreaItem>;
  reviewQueue: string[]; // itemIds
}

export const defaultSettings: UserSettings = {
  theme: 'light',
  dailyStudyGoalMinutes: 20,
  dailyNewItemsGoal: 10,
  defaultQuizCount: 20,
  soundEnabled: true,
  animationsEnabled: true,
  furiganaAlwaysVisible: true,
};

export const defaultStreak: UserStreak = {
  currentStreak: 1,
  longestStreak: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
};

class StorageService {
  // Generic safe JSON getter
  private get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item) as T;
    } catch (e) {
      console.error(`Error reading storage key ${key}:`, e);
      return defaultValue;
    }
  }

  // Generic safe JSON setter
  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error writing storage key ${key}:`, e);
    }
  }

  // --- Auth Session ---
  public getAuthUser(): UserProfile | null {
    return this.get<UserProfile | null>(STORAGE_KEYS.AUTH_USER, null);
  }

  public setAuthUser(user: UserProfile | null): void {
    this.set(STORAGE_KEYS.AUTH_USER, user);
  }

  // --- Item Progress Map ---
  public getItemProgressMap(): Record<string, ItemProgressRecord> {
    return this.get<Record<string, ItemProgressRecord>>(STORAGE_KEYS.ITEM_PROGRESS, {});
  }

  public setItemProgressMap(map: Record<string, ItemProgressRecord>): void {
    this.set(STORAGE_KEYS.ITEM_PROGRESS, map);
  }

  public getItemProgress(itemId: string): ItemProgressRecord | undefined {
    const map = this.getItemProgressMap();
    return map[itemId];
  }

  public saveItemLearningStatus(
    itemId: string,
    level: JLPTLevel,
    category: CategoryType,
    status: ItemLearningStatus
  ): ItemProgressRecord {
    const map = this.getItemProgressMap();
    const existing = map[itemId] || {
      itemId,
      level,
      category,
      learningStatus: 'unlearned',
      quizStatus: 'untested',
      attempts: 0,
      correct: 0,
      wrong: 0,
      skillBreakdown: {},
    };

    const updated: ItemProgressRecord = {
      ...existing,
      learningStatus: status,
      learnedAt: status === 'learned' ? (existing.learnedAt || new Date().toISOString()) : existing.learnedAt,
      lastReviewedAt: new Date().toISOString(),
    };

    map[itemId] = updated;
    this.setItemProgressMap(map);
    return updated;
  }

  public recordQuizAnswer(answer: QuizAnswerRecord): ItemProgressRecord {
    const map = this.getItemProgressMap();
    const existing = map[answer.itemId] || {
      itemId: answer.itemId,
      level: answer.level,
      category: answer.category,
      learningStatus: 'unlearned',
      quizStatus: 'untested',
      attempts: 0,
      correct: 0,
      wrong: 0,
      skillBreakdown: {},
    };

    // Update skill breakdown
    const currentSkill = existing.skillBreakdown[answer.skill] || { correct: 0, total: 0 };
    const updatedSkill = {
      correct: currentSkill.correct + (answer.isCorrect ? 1 : 0),
      total: currentSkill.total + 1,
    };

    const newAttempts = existing.attempts + 1;
    const newCorrect = existing.correct + (answer.isCorrect ? 1 : 0);
    const newWrong = existing.wrong + (answer.isCorrect ? 0 : 1);

    // Quiz status: wrong answers make it 'needs_review' or 'wrong', correct updates to 'correct' if no unresolved review
    let newQuizStatus: ItemQuizStatus = answer.isCorrect ? 'correct' : 'needs_review';

    const updated: ItemProgressRecord = {
      ...existing,
      attempts: newAttempts,
      correct: newCorrect,
      wrong: newWrong,
      quizStatus: newQuizStatus,
      lastAttemptAt: answer.timestamp,
      skillBreakdown: {
        ...existing.skillBreakdown,
        [answer.skill]: updatedSkill,
      },
    };

    map[answer.itemId] = updated;
    this.setItemProgressMap(map);

    // Save answer to quiz history
    this.appendQuizHistory(answer);

    // Update review queue & weak areas
    if (!answer.isCorrect) {
      this.addToReviewQueue(answer.itemId);
      this.recordWeakArea(answer);
    } else {
      // If correct and user has multiple correct answers, we can resolve review status
      if (newAttempts > 0 && newCorrect / newAttempts >= 0.75) {
        this.removeFromReviewQueue(answer.itemId);
      }
    }

    // Update Daily Log
    this.logDailyQuizAnswer(answer);

    return updated;
  }

  // --- Quiz History ---
  public getQuizHistory(): QuizAnswerRecord[] {
    return this.get<QuizAnswerRecord[]>(STORAGE_KEYS.QUIZ_HISTORY, []);
  }

  public appendQuizHistory(entry: QuizAnswerRecord): void {
    const history = this.getQuizHistory();
    // Keep max 5000 recent records to prevent unbounded storage
    const trimmed = history.length > 5000 ? history.slice(-4999) : history;
    trimmed.push(entry);
    this.set(STORAGE_KEYS.QUIZ_HISTORY, trimmed);
  }

  // --- Review Queue ---
  public getReviewQueue(): string[] {
    return this.get<string[]>(STORAGE_KEYS.REVIEW_QUEUE, []);
  }

  public addToReviewQueue(itemId: string): void {
    const queue = new Set(this.getReviewQueue());
    queue.add(itemId);
    this.set(STORAGE_KEYS.REVIEW_QUEUE, Array.from(queue));
  }

  public removeFromReviewQueue(itemId: string): void {
    const queue = new Set(this.getReviewQueue());
    queue.delete(itemId);
    this.set(STORAGE_KEYS.REVIEW_QUEUE, Array.from(queue));
  }

  // --- Weak Areas ---
  public getWeakAreas(): Record<string, WeakAreaItem> {
    return this.get<Record<string, WeakAreaItem>>(STORAGE_KEYS.WEAK_AREAS, {});
  }

  public recordWeakArea(answer: QuizAnswerRecord): void {
    const weakMap = this.getWeakAreas();
    const key = `${answer.itemId}_${answer.skill}`;
    const existing = weakMap[key];

    weakMap[key] = {
      id: key,
      itemId: answer.itemId,
      itemTitle: answer.prompt,
      level: answer.level,
      category: answer.category,
      skill: answer.skill,
      mistakeCount: (existing?.mistakeCount || 0) + 1,
      lastMistakeAt: answer.timestamp,
    };

    this.set(STORAGE_KEYS.WEAK_AREAS, weakMap);
  }

  // --- Daily Logs ---
  public getDailyLogs(): Record<string, DailyLogEntry> {
    return this.get<Record<string, DailyLogEntry>>(STORAGE_KEYS.DAILY_LOGS, {});
  }

  public getDailyLogFor(dateStr: string, level: JLPTLevel, category: CategoryType): DailyLogEntry {
    const key = `${dateStr}_${level}_${category}`;
    const all = this.getDailyLogs();
    return all[key] || {
      date: dateStr,
      level,
      category,
      newLearnedCount: 0,
      questionsAnswered: 0,
      correctCount: 0,
      wrongCount: 0,
      studyTimeMinutes: 0,
      reviewedItemIds: [],
      wrongItemIds: [],
      correctItemIds: [],
    };
  }

  public saveDailyLog(log: DailyLogEntry): void {
    const key = `${log.date}_${log.level}_${log.category}`;
    const all = this.getDailyLogs();
    all[key] = log;
    this.set(STORAGE_KEYS.DAILY_LOGS, all);
  }

  public logDailyQuizAnswer(answer: QuizAnswerRecord): void {
    const today = answer.timestamp.split('T')[0];
    const log = this.getDailyLogFor(today, answer.level, answer.category);
    
    log.questionsAnswered += 1;
    if (answer.isCorrect) {
      log.correctCount += 1;
      if (!log.correctItemIds.includes(answer.itemId)) {
        log.correctItemIds.push(answer.itemId);
      }
    } else {
      log.wrongCount += 1;
      if (!log.wrongItemIds.includes(answer.itemId)) {
        log.wrongItemIds.push(answer.itemId);
      }
    }

    this.saveDailyLog(log);
    this.updateStreakForToday(today);
  }

  public incrementStudyTime(level: JLPTLevel, category: CategoryType, minutes: number = 1): void {
    const today = new Date().toISOString().split('T')[0];
    const log = this.getDailyLogFor(today, level, category);
    log.studyTimeMinutes += minutes;
    this.saveDailyLog(log);
    this.updateStreakForToday(today);
  }

  public logDailyNewLearned(itemId: string, level: JLPTLevel, category: CategoryType): void {
    const today = new Date().toISOString().split('T')[0];
    const log = this.getDailyLogFor(today, level, category);
    log.newLearnedCount += 1;
    if (!log.reviewedItemIds.includes(itemId)) {
      log.reviewedItemIds.push(itemId);
    }
    this.saveDailyLog(log);
    this.updateStreakForToday(today);
  }

  // --- Streak Management ---
  public getStreak(): UserStreak {
    return this.get<UserStreak>(STORAGE_KEYS.USER_STREAK, defaultStreak);
  }

  public updateStreakForToday(todayStr?: string): UserStreak {
    const today = todayStr || new Date().toISOString().split('T')[0];
    const current = this.getStreak();

    if (current.lastActiveDate === today) {
      return current;
    }

    const lastDate = new Date(current.lastActiveDate);
    const currentDate = new Date(today);
    const diffDays = Math.round((currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

    let newStreak = current.currentStreak;
    if (diffDays === 1) {
      newStreak += 1;
    } else if (diffDays > 1) {
      newStreak = 1;
    }

    const longest = Math.max(newStreak, current.longestStreak);
    const updated: UserStreak = {
      currentStreak: newStreak,
      longestStreak: longest,
      lastActiveDate: today,
    };

    this.set(STORAGE_KEYS.USER_STREAK, updated);
    return updated;
  }

  // --- Settings ---
  public getSettings(): UserSettings {
    return this.get<UserSettings>(STORAGE_KEYS.USER_SETTINGS, defaultSettings);
  }

  public saveSettings(settings: UserSettings): void {
    this.set(STORAGE_KEYS.USER_SETTINGS, settings);
  }

  // --- Export & Import ---
  public exportAllData(): string {
    const payload: ExportDataPayload = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      user: this.getAuthUser(),
      itemProgress: this.getItemProgressMap(),
      quizHistory: this.getQuizHistory(),
      dailyLogs: this.getDailyLogs(),
      streak: this.getStreak(),
      settings: this.getSettings(),
      weakAreas: this.getWeakAreas(),
      reviewQueue: this.getReviewQueue(),
    };
    return JSON.stringify(payload, null, 2);
  }

  public importAllData(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString) as ExportDataPayload;
      if (!parsed || !parsed.itemProgress) {
        throw new Error('Invalid JSON format for JLPT progress.');
      }

      if (parsed.user) this.setAuthUser(parsed.user);
      if (parsed.itemProgress) this.setItemProgressMap(parsed.itemProgress);
      if (parsed.quizHistory) this.set(STORAGE_KEYS.QUIZ_HISTORY, parsed.quizHistory);
      if (parsed.dailyLogs) this.set(STORAGE_KEYS.DAILY_LOGS, parsed.dailyLogs);
      if (parsed.streak) this.set(STORAGE_KEYS.USER_STREAK, parsed.streak);
      if (parsed.settings) this.saveSettings(parsed.settings);
      if (parsed.weakAreas) this.set(STORAGE_KEYS.WEAK_AREAS, parsed.weakAreas);
      if (parsed.reviewQueue) this.set(STORAGE_KEYS.REVIEW_QUEUE, parsed.reviewQueue);

      return true;
    } catch (e) {
      console.error('Failed to import user progress data:', e);
      return false;
    }
  }

  public resetAllProgress(): void {
    localStorage.removeItem(STORAGE_KEYS.ITEM_PROGRESS);
    localStorage.removeItem(STORAGE_KEYS.QUIZ_HISTORY);
    localStorage.removeItem(STORAGE_KEYS.DAILY_LOGS);
    localStorage.removeItem(STORAGE_KEYS.WEAK_AREAS);
    localStorage.removeItem(STORAGE_KEYS.REVIEW_QUEUE);
    this.set(STORAGE_KEYS.USER_STREAK, defaultStreak);
  }
}

export const storageService = new StorageService();
