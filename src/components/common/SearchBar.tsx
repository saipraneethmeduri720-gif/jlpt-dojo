import React, { useRef } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search by character, reading (hiragana/romaji), or English meaning...',
  className = '',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-japan-charcoal-400" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-zinc-800 border border-japan-charcoal-200 dark:border-zinc-700 rounded-xl text-sm text-japan-charcoal-800 dark:text-zinc-100 placeholder:text-japan-charcoal-400 focus:outline-none focus:ring-2 focus:ring-japan-indigo-800 focus:border-transparent transition-all shadow-subtle"
      />
      {value && (
        <button
          onClick={() => {
            onChange('');
            inputRef.current?.focus();
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-japan-charcoal-400 hover:text-japan-charcoal-700 rounded-md"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
