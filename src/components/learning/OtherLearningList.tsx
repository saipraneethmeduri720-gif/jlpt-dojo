import React, { useState, useMemo, useEffect } from 'react';
import { JLPTLevel, OtherItem } from '../../types';
import { getCategoryItems } from '../../data';
import { useProgress } from '../../context/ProgressContext';
import { OtherCard } from '../cards/OtherCard';
import { SearchBar } from '../common/SearchBar';
import { FilterBar, FilterOption, SortOption } from '../common/FilterBar';
import { Compass } from 'lucide-react';

interface OtherLearningListProps {
  level: JLPTLevel;
}

export const OtherLearningList: React.FC<OtherLearningListProps> = ({ level }) => {
  const { itemProgressMap, weakAreasMap, reviewQueue } = useProgress();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  const [activeSort, setActiveSort] = useState<SortOption>('default');
  const [visibleCount, setVisibleCount] = useState(60);

  useEffect(() => {
    setVisibleCount(60);
  }, [level, activeFilter, searchQuery, activeSort]);

  const allOther = useMemo(() => {
    return getCategoryItems<OtherItem>(level, 'other');
  }, [level]);

  const filterCounts = useMemo(() => {
    let learned = 0;
    let unlearned = 0;
    let review = 0;
    let weak = 0;

    const weakItemIds = Object.values(weakAreasMap)
      .filter((w) => w.level === level && w.category === 'other')
      .map((w) => w.itemId);

    allOther.forEach((o) => {
      const prog = itemProgressMap[o.id];
      if (prog?.learningStatus === 'learned') learned++;
      else unlearned++;

      if (reviewQueue.includes(o.id) || prog?.quizStatus === 'needs_review' || prog?.quizStatus === 'wrong') {
        review++;
      }
      if (weakItemIds.includes(o.id)) weak++;
    });

    return {
      all: allOther.length,
      learned,
      unlearned,
      review,
      weak,
    };
  }, [allOther, itemProgressMap, reviewQueue, weakAreasMap, level]);

  const filteredOther = useMemo(() => {
    return allOther.filter((o) => {
      const prog = itemProgressMap[o.id];
      const isLearned = prog?.learningStatus === 'learned';
      const isReviewDue = reviewQueue.includes(o.id) || prog?.quizStatus === 'needs_review' || prog?.quizStatus === 'wrong';

      if (activeFilter === 'learned' && !isLearned) return false;
      if (activeFilter === 'unlearned' && isLearned) return false;
      if (activeFilter === 'review' && !isReviewDue) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          o.title.toLowerCase().includes(q) ||
          o.japanese.includes(q) ||
          o.reading.includes(q) ||
          o.meaning.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allOther, itemProgressMap, reviewQueue, activeFilter, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="washi-card p-4 md:p-5 rounded-2xl border border-japan-charcoal-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-subtle space-y-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search items by title, Japanese text, reading, or meaning..."
        />

        <FilterBar
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          counts={filterCounts}
        />
      </div>

      {filteredOther.length > 0 ? (
        <>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredOther.slice(0, visibleCount).map((item) => (
            <OtherCard
              key={item.id}
              item={item}
              progress={itemProgressMap[item.id]}
              isReviewDue={reviewQueue.includes(item.id)}
              onClick={() => {}}
            />
          ))}
        </div>
        {visibleCount < filteredOther.length && (
          <div className="flex justify-center pt-2">
            <button
              onClick={() => setVisibleCount((c) => c + 60)}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-zinc-800 text-japan-indigo-800 dark:text-indigo-400 border border-japan-charcoal-200/80 dark:border-zinc-700 hover:bg-japan-charcoal-50 dark:hover:bg-zinc-700 transition-all"
            >
              Load More ({filteredOther.length - visibleCount} remaining)
            </button>
          </div>
        )}
        </>
      ) : (
        <div className="washi-card p-12 rounded-3xl text-center space-y-3 bg-white dark:bg-zinc-900 border border-japan-charcoal-200 dark:border-zinc-800 my-4">
          <Compass className="w-8 h-8 text-japan-charcoal-400 mx-auto" />
          <h3 className="text-base font-bold text-japan-charcoal-800 dark:text-zinc-200">
            No Items Found
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
    </div>
  );
};
