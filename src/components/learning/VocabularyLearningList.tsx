import React, { useState, useMemo, useEffect } from 'react';
import { JLPTLevel, VocabularyItem } from '../../types';
import { getCategoryItems } from '../../data';
import { useProgress } from '../../context/ProgressContext';
import { VocabularyCard } from '../cards/VocabularyCard';
import { VocabularyDetailModal } from '../modals/VocabularyDetailModal';
import { SearchBar } from '../common/SearchBar';
import { FilterBar, FilterOption, SortOption } from '../common/FilterBar';
import { BookOpen } from 'lucide-react';

interface VocabularyLearningListProps {
  level: JLPTLevel;
}

export const VocabularyLearningList: React.FC<VocabularyLearningListProps> = ({ level }) => {
  const { itemProgressMap, weakAreasMap, reviewQueue } = useProgress();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  const [activeSort, setActiveSort] = useState<SortOption>('default');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(40);

  useEffect(() => {
    setVisibleCount(40);
  }, [level, activeFilter, searchQuery, activeSort]);

  const allVocab = useMemo(() => {
    return getCategoryItems<VocabularyItem>(level, 'vocabulary');
  }, [level]);

  const filterCounts = useMemo(() => {
    let learned = 0;
    let unlearned = 0;
    let review = 0;
    let weak = 0;

    const weakItemIds = Object.values(weakAreasMap)
      .filter((w) => w.level === level && w.category === 'vocabulary')
      .map((w) => w.itemId);

    allVocab.forEach((v) => {
      const prog = itemProgressMap[v.id];
      if (prog?.learningStatus === 'learned') learned++;
      else unlearned++;

      if (reviewQueue.includes(v.id) || prog?.quizStatus === 'needs_review' || prog?.quizStatus === 'wrong') {
        review++;
      }
      if (weakItemIds.includes(v.id)) weak++;
    });

    return {
      all: allVocab.length,
      learned,
      unlearned,
      review,
      weak,
    };
  }, [allVocab, itemProgressMap, reviewQueue, weakAreasMap, level]);

  const filteredVocab = useMemo(() => {
    const weakItemIds = Object.values(weakAreasMap)
      .filter((w) => w.level === level && w.category === 'vocabulary')
      .map((w) => w.itemId);

    return allVocab
      .filter((v) => {
        const prog = itemProgressMap[v.id];
        const isLearned = prog?.learningStatus === 'learned';
        const isReviewDue = reviewQueue.includes(v.id) || prog?.quizStatus === 'needs_review' || prog?.quizStatus === 'wrong';
        const isWeak = weakItemIds.includes(v.id);

        if (activeFilter === 'learned' && !isLearned) return false;
        if (activeFilter === 'unlearned' && isLearned) return false;
        if (activeFilter === 'review' && !isReviewDue) return false;
        if (activeFilter === 'weak' && !isWeak) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          return (
            v.word.includes(q) ||
            v.reading.includes(q) ||
            v.meaning.toLowerCase().includes(q) ||
            v.partOfSpeech.toLowerCase().includes(q)
          );
        }

        return true;
      })
      .sort((a, b) => {
        if (activeSort === 'alphabetical') {
          return a.reading.localeCompare(b.reading);
        }
        return 0;
      });
  }, [allVocab, itemProgressMap, reviewQueue, weakAreasMap, level, activeFilter, searchQuery, activeSort]);

  const selectedVocab = selectedIndex !== null ? filteredVocab[selectedIndex] : null;
  const visibleVocab = filteredVocab.slice(0, visibleCount);

  return (
    <div className="space-y-6">
      <div className="washi-card p-4 md:p-5 rounded-2xl border border-japan-charcoal-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-subtle space-y-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search vocabulary by word (学生), reading (がくせい), or meaning (Student)..."
        />

        <FilterBar
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          counts={filterCounts}
        />
      </div>

      {filteredVocab.length > 0 ? (
        <>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {visibleVocab.map((vocab, idx) => (
            <VocabularyCard
              key={vocab.id}
              vocab={vocab}
              progress={itemProgressMap[vocab.id]}
              isReviewDue={reviewQueue.includes(vocab.id)}
              onClick={() => setSelectedIndex(idx)}
            />
          ))}
        </div>
        {visibleCount < filteredVocab.length && (
          <div className="flex justify-center pt-2">
            <button
              onClick={() => setVisibleCount((c) => c + 40)}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-zinc-800 text-japan-indigo-800 dark:text-indigo-400 border border-japan-charcoal-200/80 dark:border-zinc-700 hover:bg-japan-charcoal-50 dark:hover:bg-zinc-700 transition-all"
            >
              Load More ({filteredVocab.length - visibleCount} remaining)
            </button>
          </div>
        )}
        </>
      ) : (
        <div className="washi-card p-12 rounded-3xl text-center space-y-3 bg-white dark:bg-zinc-900 border border-japan-charcoal-200 dark:border-zinc-800 my-4">
          <BookOpen className="w-8 h-8 text-japan-charcoal-400 mx-auto" />
          <h3 className="text-base font-bold text-japan-charcoal-800 dark:text-zinc-200">
            No Vocabulary Matches
          </h3>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveFilter('all');
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-japan-indigo-800 text-white shadow-xs"
          >
            Reset Filters
          </button>
        </div>
      )}

      <VocabularyDetailModal
        vocab={selectedVocab}
        isOpen={selectedIndex !== null}
        onClose={() => setSelectedIndex(null)}
        hasPrev={selectedIndex !== null && selectedIndex > 0}
        hasNext={selectedIndex !== null && selectedIndex < filteredVocab.length - 1}
        onPrev={() => setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev))}
        onNext={() => setSelectedIndex((prev) => (prev !== null && prev < filteredVocab.length - 1 ? prev + 1 : prev))}
      />
    </div>
  );
};
