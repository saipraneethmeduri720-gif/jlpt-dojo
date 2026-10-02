import React from 'react';
import { Filter, ArrowUpDown } from 'lucide-react';

export type FilterOption = 'all' | 'learned' | 'unlearned' | 'review' | 'weak';
export type SortOption = 'default' | 'alphabetical' | 'progress' | 'weakest';

interface FilterBarProps {
  activeFilter: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
  activeSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  counts: {
    all: number;
    learned: number;
    unlearned: number;
    review: number;
    weak: number;
  };
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  activeFilter,
  onFilterChange,
  activeSort,
  onSortChange,
  counts,
  className = '',
}) => {
  const filterButtons: { id: FilterOption; label: string; count: number; color?: string }[] = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'learned', label: 'Learned', count: counts.learned, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    { id: 'unlearned', label: 'Not Learned', count: counts.unlearned, color: 'text-zinc-700 bg-zinc-100 border-zinc-200' },
    { id: 'review', label: 'Needs Review', count: counts.review, color: 'text-amber-700 bg-amber-50 border-amber-200' },
    { id: 'weak', label: 'Weak Area', count: counts.weak, color: 'text-rose-700 bg-rose-50 border-rose-200' },
  ];

  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 ${className}`}>
      {/* Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs font-semibold text-japan-charcoal-500 mr-1 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </span>
        {filterButtons.map((btn) => {
          const isActive = activeFilter === btn.id;
          return (
            <button
              key={btn.id}
              onClick={() => onFilterChange(btn.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                isActive
                  ? 'bg-japan-indigo-800 text-white border-japan-indigo-800 shadow-sm'
                  : 'bg-white dark:bg-zinc-800 text-japan-charcoal-700 dark:text-zinc-300 border-japan-charcoal-200 dark:border-zinc-700 hover:border-japan-charcoal-400'
              }`}
            >
              <span>{btn.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-japan-charcoal-100 dark:bg-zinc-700 text-japan-charcoal-600 dark:text-zinc-300'
                }`}
              >
                {btn.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sort Dropdown */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-japan-charcoal-500 flex items-center gap-1">
          <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
        </span>
        <select
          value={activeSort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="text-xs bg-white dark:bg-zinc-800 border border-japan-charcoal-200 dark:border-zinc-700 text-japan-charcoal-800 dark:text-zinc-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-japan-indigo-800 cursor-pointer shadow-subtle"
        >
          <option value="default">JLPT Standard Order</option>
          <option value="alphabetical">Alphabetical / Reading</option>
          <option value="progress">Highest Progress</option>
          <option value="weakest">Weakest First</option>
        </select>
      </div>
    </div>
  );
};
