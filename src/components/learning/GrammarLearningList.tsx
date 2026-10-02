import React, { useState, useMemo, useEffect } from 'react';
import { JLPTLevel, GrammarItem } from '../../types';
import { getCategoryItems } from '../../data';
import { useProgress } from '../../context/ProgressContext';
import { GrammarCard } from '../cards/GrammarCard';
import { GrammarDetailModal } from '../modals/GrammarDetailModal';
import { SearchBar } from '../common/SearchBar';
import { FilterBar, FilterOption, SortOption } from '../common/FilterBar';
import { Layers } from 'lucide-react';

interface GrammarLearningListProps {
  level: JLPTLevel;
}

export const GrammarLearningList: React.FC<GrammarLearningListProps> = ({ level }) => {
  const { itemProgressMap, weakAreasMap, reviewQueue } = useProgress();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  const [activeSort, setActiveSort] = useState<SortOption>('default');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(30);

  useEffect(() => {
    setVisibleCount(30);
  }, [level, activeFilter, searchQuery, activeSort]);

  const allGrammar = useMemo(() => {
    return getCategoryItems<GrammarItem>(level, 'grammar');
  }, [level]);

  const filterCounts = useMemo(() => {
    let learned = 0;
    let unlearned = 0;
    let review = 0;
    let weak = 0;

    const weakItemIds = Object.values(weakAreasMap)
      .filter((w) => w.level === level && w.category === 'grammar')
      .map((w) => w.itemId);

    allGrammar.forEach((g) => {
      const prog = itemProgressMap[g.id];
      if (prog?.learningStatus === 'learned') learned++;
      else unlearned++;

      if (reviewQueue.includes(g.id) || prog?.quizStatus === 'needs_review' || prog?.quizStatus === 'wrong') {
        review++;
      }
      if (weakItemIds.includes(g.id)) weak++;
    });

    return {
      all: allGrammar.length,
      learned,
      unlearned,
      review,
      weak,
    };
  }, [allGrammar, itemProgressMap, reviewQueue, weakAreasMap, level]);

  const filteredGrammar = useMemo(() => {
    const weakItemIds = Object.values(weakAreasMap)
      .filter((w) => w.level === level && w.category === 'grammar')
      .map((w) => w.itemId);

    return allGrammar.filter((g) => {
      const prog = itemProgressMap[g.id];
      const isLearned = prog?.learningStatus === 'learned';
      const isReviewDue = reviewQueue.includes(g.id) || prog?.quizStatus === 'needs_review' || prog?.quizStatus === 'wrong';
      const isWeak = weakItemIds.includes(g.id);

      if (activeFilter === 'learned' && !isLearned) return false;
      if (activeFilter === 'unlearned' && isLearned) return false;
      if (activeFilter === 'review' && !isReviewDue) return false;
      if (activeFilter === 'weak' && !isWeak) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          g.pattern.toLowerCase().includes(q) ||
          g.meaning.toLowerCase().includes(q) ||
          g.structure.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [allGrammar, itemProgressMap, reviewQueue, weakAreasMap, level, activeFilter, searchQuery]);

  const selectedGrammar = selectedIndex !== null ? filteredGrammar[selectedIndex] : null;
  const visibleGrammar = filteredGrammar.slice(0, visibleCount);

  return (
    <div className="space-y-6">
      <div className="washi-card p-4 md:p-5 rounded-2xl border border-japan-charcoal-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-subtle space-y-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search grammar by pattern (〜てください), structure, or English meaning..."
        />

        <FilterBar
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          counts={filterCounts}
        />
      </div>

      {filteredGrammar.length > 0 ? (
        <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleGrammar.map((grammar, idx) => (
            <GrammarCard
              key={grammar.id}
              grammar={grammar}
              progress={itemProgressMap[grammar.id]}
              isReviewDue={reviewQueue.includes(grammar.id)}
              onClick={() => setSelectedIndex(idx)}
            />
          ))}
        </div>
        {visibleCount < filteredGrammar.length && (
          <div className="flex justify-center pt-2">
            <button
              onClick={() => setVisibleCount((c) => c + 30)}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-zinc-800 text-japan-indigo-800 dark:text-indigo-400 border border-japan-charcoal-200/80 dark:border-zinc-700 hover:bg-japan-charcoal-50 dark:hover:bg-zinc-700 transition-all"
            >
              Load More ({filteredGrammar.length - visibleCount} remaining)
            </button>
          </div>
        )}
        </>
      ) : (
        <div className="washi-card p-12 rounded-3xl text-center space-y-3 bg-white dark:bg-zinc-900 border border-japan-charcoal-200 dark:border-zinc-800 my-4">
          <Layers className="w-8 h-8 text-japan-charcoal-400 mx-auto" />
          <h3 className="text-base font-bold text-japan-charcoal-800 dark:text-zinc-200">
            No Grammar Patterns Match
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

      <GrammarDetailModal
        grammar={selectedGrammar}
        isOpen={selectedIndex !== null}
        onClose={() => setSelectedIndex(null)}
        hasPrev={selectedIndex !== null && selectedIndex > 0}
        hasNext={selectedIndex !== null && selectedIndex < filteredGrammar.length - 1}
        onPrev={() => setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev))}
        onNext={() => setSelectedIndex((prev) => (prev !== null && prev < filteredGrammar.length - 1 ? prev + 1 : prev))}
      />
    </div>
  );
};
