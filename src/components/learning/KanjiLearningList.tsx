import React, { useState, useMemo, useEffect } from 'react';
import { JLPTLevel, KanjiItem } from '../../types';
import { getCategoryItems } from '../../data';
import { useProgress } from '../../context/ProgressContext';
import { KanjiCard } from '../cards/KanjiCard';
import { KanjiDetailModal } from '../modals/KanjiDetailModal';
import { SearchBar } from '../common/SearchBar';
import { FilterBar, FilterOption, SortOption } from '../common/FilterBar';
import { Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';

interface KanjiLearningListProps {
  level: JLPTLevel;
}

export const KanjiLearningList: React.FC<KanjiLearningListProps> = ({ level }) => {
  const { itemProgressMap, weakAreasMap, reviewQueue } = useProgress();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  const [activeSort, setActiveSort] = useState<SortOption>('default');
  const [selectedKanjiIndex, setSelectedKanjiIndex] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(48);

  useEffect(() => {
    setVisibleCount(48);
  }, [level, activeFilter, searchQuery, activeSort]);

  // Load all Kanji for this level
  const allKanji = useMemo(() => {
    return getCategoryItems<KanjiItem>(level, 'kanji');
  }, [level]);

  // Compute counts for filter pills
  const filterCounts = useMemo(() => {
    let learned = 0;
    let unlearned = 0;
    let review = 0;
    let weak = 0;

    const weakItemIds = Object.values(weakAreasMap)
      .filter((w) => w.level === level && w.category === 'kanji')
      .map((w) => w.itemId);

    allKanji.forEach((k) => {
      const prog = itemProgressMap[k.id];
      if (prog?.learningStatus === 'learned') {
        learned++;
      } else {
        unlearned++;
      }

      if (reviewQueue.includes(k.id) || prog?.quizStatus === 'needs_review' || prog?.quizStatus === 'wrong') {
        review++;
      }

      if (weakItemIds.includes(k.id)) {
        weak++;
      }
    });

    return {
      all: allKanji.length,
      learned,
      unlearned,
      review,
      weak,
    };
  }, [allKanji, itemProgressMap, reviewQueue, weakAreasMap, level]);

  // Filter & Search & Sort
  const filteredKanji = useMemo(() => {
    const weakItemIds = Object.values(weakAreasMap)
      .filter((w) => w.level === level && w.category === 'kanji')
      .map((w) => w.itemId);

    return allKanji
      .filter((k) => {
        const prog = itemProgressMap[k.id];
        const isLearned = prog?.learningStatus === 'learned';
        const isReviewDue = reviewQueue.includes(k.id) || prog?.quizStatus === 'needs_review' || prog?.quizStatus === 'wrong';
        const isWeak = weakItemIds.includes(k.id);

        // Filter condition
        if (activeFilter === 'learned' && !isLearned) return false;
        if (activeFilter === 'unlearned' && isLearned) return false;
        if (activeFilter === 'review' && !isReviewDue) return false;
        if (activeFilter === 'weak' && !isWeak) return false;

        // Search condition
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchChar = k.character.includes(q);
          const matchMeaning = k.meaning.toLowerCase().includes(q);
          const matchOnyomi = k.onyomi.some((o) => o.toLowerCase().includes(q));
          const matchKunyomi = k.kunyomi.some((kun) => kun.toLowerCase().includes(q));
          const matchCompound = k.exampleWords.some(
            (w) => w.word.includes(q) || w.reading.includes(q) || w.meaning.toLowerCase().includes(q)
          );
          return matchChar || matchMeaning || matchOnyomi || matchKunyomi || matchCompound;
        }

        return true;
      })
      .sort((a, b) => {
        const progA = itemProgressMap[a.id];
        const progB = itemProgressMap[b.id];

        if (activeSort === 'alphabetical') {
          return a.meaning.localeCompare(b.meaning);
        }
        if (activeSort === 'progress') {
          const accA = progA && progA.attempts > 0 ? progA.correct / progA.attempts : 0;
          const accB = progB && progB.attempts > 0 ? progB.correct / progB.attempts : 0;
          return accB - accA;
        }
        if (activeSort === 'weakest') {
          const wrongA = progA?.wrong || 0;
          const wrongB = progB?.wrong || 0;
          return wrongB - wrongA;
        }
        return 0; // Default JLPT order
      });
  }, [allKanji, itemProgressMap, reviewQueue, weakAreasMap, level, activeFilter, searchQuery, activeSort]);

  const selectedKanji = selectedKanjiIndex !== null ? filteredKanji[selectedKanjiIndex] : null;
  const visibleKanji = filteredKanji.slice(0, visibleCount);

  return (
    <div className="space-y-6">
      {/* Search & Filter Header Bar */}
      <div className="washi-card p-4 md:p-5 rounded-2xl border border-japan-charcoal-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-subtle space-y-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search Kanji by character (日), reading (ひ/ニチ), or English meaning (Sun)..."
        />

        <FilterBar
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          activeSort={activeSort}
          onSortChange={setActiveSort}
          counts={filterCounts}
        />
      </div>

      {/* Legend & Summary Info */}
      <div className="flex flex-wrap items-center justify-between text-xs text-japan-charcoal-500 gap-2 px-1">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Learned ({filterCounts.learned})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            <span>Unlearned ({filterCounts.unlearned})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Needs Review ({filterCounts.review})</span>
          </div>
        </div>

        <div>
          Showing <strong>{filteredKanji.length}</strong> of {allKanji.length} Kanji
        </div>
      </div>

      {/* Kanji Grid */}
      {filteredKanji.length > 0 ? (
        <>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
          {visibleKanji.map((kanji, idx) => (
            <KanjiCard
              key={kanji.id}
              kanji={kanji}
              progress={itemProgressMap[kanji.id]}
              isReviewDue={reviewQueue.includes(kanji.id)}
              onClick={() => setSelectedKanjiIndex(idx)}
            />
          ))}
        </div>
        {visibleCount < filteredKanji.length && (
          <div className="flex justify-center pt-2">
            <button
              onClick={() => setVisibleCount((c) => c + 48)}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-zinc-800 text-japan-indigo-800 dark:text-indigo-400 border border-japan-charcoal-200/80 dark:border-zinc-700 hover:bg-japan-charcoal-50 dark:hover:bg-zinc-700 transition-all"
            >
              Load More ({filteredKanji.length - visibleCount} remaining)
            </button>
          </div>
        )}
        </>
      ) : (
        <div className="washi-card p-12 rounded-3xl text-center space-y-3 bg-white dark:bg-zinc-900 border border-japan-charcoal-200 dark:border-zinc-800 my-4">
          <Sparkles className="w-8 h-8 text-japan-charcoal-400 mx-auto" />
          <h3 className="text-base font-bold text-japan-charcoal-800 dark:text-zinc-200">
            No Kanji Match Your Filter
          </h3>
          <p className="text-xs text-japan-charcoal-500">
            Try adjusting your search query or choosing the 'All' filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveFilter('all');
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-japan-indigo-800 text-white shadow-xs"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Reusable Kanji Detail Modal with Prev/Next navigation */}
      <KanjiDetailModal
        kanji={selectedKanji}
        isOpen={selectedKanjiIndex !== null}
        onClose={() => setSelectedKanjiIndex(null)}
        hasPrev={selectedKanjiIndex !== null && selectedKanjiIndex > 0}
        hasNext={selectedKanjiIndex !== null && selectedKanjiIndex < filteredKanji.length - 1}
        onPrev={() => setSelectedKanjiIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev))}
        onNext={() => setSelectedKanjiIndex((prev) => (prev !== null && prev < filteredKanji.length - 1 ? prev + 1 : prev))}
      />
    </div>
  );
};
