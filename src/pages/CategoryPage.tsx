import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { JLPTLevel, CategoryType, SectionTab, QuizQuestion } from '../types';
import { JLPT_LEVEL_INFO, CATEGORY_INFO, getCategoryItems } from '../data';
import { useProgress } from '../context/ProgressContext';
import { generateQuiz } from '../utils/quizEngine';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { KanjiLearningList } from '../components/learning/KanjiLearningList';
import { VocabularyLearningList } from '../components/learning/VocabularyLearningList';
import { GrammarLearningList } from '../components/learning/GrammarLearningList';
import { OtherLearningList } from '../components/learning/OtherLearningList';
import { QuizEngineView } from '../components/quiz/QuizEngineView';
import { CategoryDailyProgressView } from '../components/progress/CategoryDailyProgressView';
import { QuizSettingsModal, QuizConfig } from '../components/modals/QuizSettingsModal';
import { ListFilter, Play, Calendar, Sliders, RotateCcw } from 'lucide-react';

export const CategoryPage: React.FC = () => {
  const { levelId, categoryId, tab } = useParams<{
    levelId: string;
    categoryId: string;
    tab?: string;
  }>();
  const navigate = useNavigate();

  const {
    itemProgressMap,
    weakAreasMap,
    reviewQueue,
    getCategoryStats,
  } = useProgress();

  const validLevels: JLPTLevel[] = ['n5', 'n4', 'n3', 'n2', 'n1'];
  const validCategories: CategoryType[] = ['kanji', 'vocabulary', 'grammar', 'other'];

  const level = (levelId?.toLowerCase() || 'n5') as JLPTLevel;
  const category = (categoryId?.toLowerCase() || 'kanji') as CategoryType;

  // Active section tab
  const activeTab: SectionTab =
    tab === 'quiz' ? 'quiz' : tab === 'progress' ? 'progress' : 'learning';

  const levelInfo = JLPT_LEVEL_INFO[level] || JLPT_LEVEL_INFO.n5;
  const categoryInfo = CATEGORY_INFO[category] || CATEGORY_INFO.kanji;
  const stats = getCategoryStats(level, category);

  // Quiz generator state
  const [isQuizSettingsOpen, setIsQuizSettingsOpen] = useState(false);
  const [currentQuizQuestions, setCurrentQuizQuestions] = useState<QuizQuestion[]>([]);

  // Generate initial quiz on mount or tab change to quiz
  const handleStartConfiguredQuiz = (config: QuizConfig) => {
    const generated = generateQuiz({
      level,
      category,
      questionCount: config.count,
      mode: config.mode,
      selectedSkills: config.selectedSkills,
      progressMap: itemProgressMap,
      weakAreasMap,
      reviewQueue,
    });
    setCurrentQuizQuestions(generated);
  };

  useEffect(() => {
    if (activeTab === 'quiz' && currentQuizQuestions.length === 0) {
      const generated = generateQuiz({
        level,
        category,
        questionCount: 20,
        mode: 'random',
        progressMap: itemProgressMap,
        weakAreasMap,
        reviewQueue,
      });
      setCurrentQuizQuestions(generated);
    }
  }, [activeTab, level, category, itemProgressMap, weakAreasMap, reviewQueue]);

  if (!validLevels.includes(level) || !validCategories.includes(category)) {
    return <Link to="/dashboard">Invalid category. Return to Dashboard</Link>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: `${level.toUpperCase()} Overview`, href: `/level/${level}` },
          { label: `${categoryInfo.title} (${categoryInfo.kanjiTitle})`, isCurrent: true },
        ]}
      />

      {/* Header Bar */}
      <div className="washi-card p-6 rounded-3xl border border-japan-charcoal-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-elevated flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="px-2.5 py-0.5 rounded-md text-xs font-black text-white"
              style={{ backgroundColor: levelInfo.color }}
            >
              {level.toUpperCase()}
            </span>
            <h1 className="text-xl md:text-2xl font-black text-japan-charcoal-900 dark:text-zinc-100 uppercase tracking-tight">
              {categoryInfo.title} • {categoryInfo.kanjiTitle}
            </h1>
          </div>
          <p className="text-xs text-japan-charcoal-500 max-w-xl">
            {categoryInfo.description}
          </p>
        </div>

        {/* Stats Pill */}
        <div className="flex items-center gap-3 bg-[#FAF8F5] dark:bg-zinc-800 p-2.5 px-4 rounded-2xl border border-japan-charcoal-200/80 dark:border-zinc-700 text-xs">
          <div>
            <span className="text-japan-charcoal-400 block text-[10px] uppercase font-bold">Progress</span>
            <span className="font-bold text-japan-charcoal-800 dark:text-zinc-200">
              {stats.learnedCount} / {stats.totalItems} ({stats.completionPercentage}%)
            </span>
          </div>
          <div className="h-6 w-px bg-japan-charcoal-200 dark:bg-zinc-700" />
          <div>
            <span className="text-japan-charcoal-400 block text-[10px] uppercase font-bold">Accuracy</span>
            <span className="font-bold text-japan-indigo-800 dark:text-indigo-400">
              {stats.quizAccuracy}%
            </span>
          </div>
        </div>
      </div>

      {/* 3 Core Section Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-japan-charcoal-200/80 dark:border-zinc-800 pb-2">
        <button
          onClick={() => navigate(`/level/${level}/${category}/learning`)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'learning'
              ? 'bg-japan-indigo-800 text-white shadow-sm'
              : 'bg-white dark:bg-zinc-800 text-japan-charcoal-600 dark:text-zinc-300 hover:bg-japan-charcoal-50 border border-japan-charcoal-200/80 dark:border-zinc-700'
          }`}
        >
          <ListFilter className="w-4 h-4" />
          <span>1. Learning List</span>
        </button>

        <button
          onClick={() => navigate(`/level/${level}/${category}/quiz`)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'quiz'
              ? 'bg-japan-indigo-800 text-white shadow-sm'
              : 'bg-white dark:bg-zinc-800 text-japan-charcoal-600 dark:text-zinc-300 hover:bg-japan-charcoal-50 border border-japan-charcoal-200/80 dark:border-zinc-700'
          }`}
        >
          <Play className="w-4 h-4" />
          <span>2. Quiz Engine</span>
        </button>

        <button
          onClick={() => navigate(`/level/${level}/${category}/progress`)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'progress'
              ? 'bg-japan-indigo-800 text-white shadow-sm'
              : 'bg-white dark:bg-zinc-800 text-japan-charcoal-600 dark:text-zinc-300 hover:bg-japan-charcoal-50 border border-japan-charcoal-200/80 dark:border-zinc-700'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>3. Daily Progress</span>
        </button>
      </div>

      {/* Tab 1: Learning List */}
      {activeTab === 'learning' && (
        <div>
          {category === 'kanji' && <KanjiLearningList level={level} />}
          {category === 'vocabulary' && <VocabularyLearningList level={level} />}
          {category === 'grammar' && <GrammarLearningList level={level} />}
          {category === 'other' && <OtherLearningList level={level} />}
        </div>
      )}

      {/* Tab 2: Quiz Engine */}
      {activeTab === 'quiz' && (
        <QuizEngineView
          questions={currentQuizQuestions}
          level={level}
          category={category}
          onRestart={() => {
            const regenerated = generateQuiz({
              level,
              category,
              questionCount: 20,
              mode: 'random',
              progressMap: itemProgressMap,
              weakAreasMap,
              reviewQueue,
            });
            setCurrentQuizQuestions(regenerated);
          }}
          onOpenSettings={() => setIsQuizSettingsOpen(true)}
          onBackToLearning={() => navigate(`/level/${level}/${category}/learning`)}
        />
      )}

      {/* Tab 3: Daily Progress */}
      {activeTab === 'progress' && (
        <CategoryDailyProgressView level={level} category={category} />
      )}

      {/* Quiz Settings Modal */}
      <QuizSettingsModal
        isOpen={isQuizSettingsOpen}
        onClose={() => setIsQuizSettingsOpen(false)}
        level={level}
        category={category}
        totalAvailable={getCategoryItems(level, category).length}
        dueReviewCount={reviewQueue.length}
        onStartQuiz={handleStartConfiguredQuiz}
      />
    </div>
  );
};
