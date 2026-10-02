import React, { useState } from 'react';
import { JLPTLevel, CategoryType } from '../../types';
import { Modal } from '../common/Modal';
import { Play, Sliders, CheckSquare, Square, Sparkles } from 'lucide-react';
import { soundEffects } from '../../utils/audio';

export interface QuizConfig {
  count: number | 'all';
  mode: 'all' | 'new' | 'review' | 'weak' | 'incorrect' | 'random';
  selectedSkills: string[];
}

interface QuizSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  level: JLPTLevel;
  category: CategoryType;
  totalAvailable: number;
  dueReviewCount: number;
  onStartQuiz: (config: QuizConfig) => void;
}

export const QuizSettingsModal: React.FC<QuizSettingsModalProps> = ({
  isOpen,
  onClose,
  level,
  category,
  totalAvailable,
  dueReviewCount,
  onStartQuiz,
}) => {
  const [countSelection, setCountSelection] = useState<number | 'all'>(10);
  const [customCount, setCustomCount] = useState<number>(15);
  const [mode, setMode] = useState<'all' | 'new' | 'review' | 'weak' | 'incorrect' | 'random'>('random');

  const kanjiSkills = [
    { id: 'meaning', label: 'Kanji ⇄ Meaning' },
    { id: 'onyomi', label: "On'yomi (音読み Katakana)" },
    { id: 'kunyomi', label: "Kun'yomi (訓読み Hiragana)" },
    { id: 'vocabulary', label: 'Compound Words (熟語)' },
    { id: 'sentence', label: 'Sentence Recognition' },
  ];

  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    'meaning',
    'onyomi',
    'kunyomi',
    'vocabulary',
    'sentence',
  ]);

  const toggleSkill = (skillId: string) => {
    soundEffects.playClick();
    if (selectedSkills.includes(skillId)) {
      if (selectedSkills.length > 1) {
        setSelectedSkills(selectedSkills.filter((s) => s !== skillId));
      }
    } else {
      setSelectedSkills([...selectedSkills, skillId]);
    }
  };

  const handleStart = () => {
    soundEffects.playClick();
    const finalCount = countSelection === 'all' ? 'all' : (countSelection === -1 ? customCount : countSelection);
    onStartQuiz({
      count: finalCount,
      mode,
      selectedSkills,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-japan-indigo-800 dark:text-indigo-400" />
          <span>Configure {level.toUpperCase()} {category.toUpperCase()} Quiz</span>
        </div>
      }
      maxWidth="max-w-xl"
    >
      <div className="space-y-5 text-xs">
        {/* Question Count Selection */}
        <div>
          <label className="block text-japan-charcoal-700 dark:text-zinc-300 font-bold mb-2 uppercase tracking-wide">
            Question Count
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
            {[10, 20, 30, 50, 100].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  setCountSelection(num);
                }}
                className={`py-2 px-1 rounded-xl font-bold border transition-all text-center ${
                  countSelection === num
                    ? 'bg-japan-indigo-800 text-white border-japan-indigo-800 shadow-sm'
                    : 'bg-[#FAF8F5] dark:bg-zinc-800 text-japan-charcoal-700 dark:text-zinc-300 border-japan-charcoal-200 dark:border-zinc-700 hover:border-japan-charcoal-400'
                }`}
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                soundEffects.playClick();
                setCountSelection('all');
              }}
              className={`py-2 px-1 rounded-xl font-bold border transition-all text-center ${
                countSelection === 'all'
                  ? 'bg-japan-indigo-800 text-white border-japan-indigo-800 shadow-sm'
                  : 'bg-[#FAF8F5] dark:bg-zinc-800 text-japan-charcoal-700 dark:text-zinc-300 border-japan-charcoal-200 dark:border-zinc-700 hover:border-japan-charcoal-400'
              }`}
            >
              All Due
            </button>
            <button
              type="button"
              onClick={() => {
                soundEffects.playClick();
                setCountSelection(-1);
              }}
              className={`py-2 px-1 rounded-xl font-bold border transition-all text-center ${
                countSelection === -1
                  ? 'bg-japan-indigo-800 text-white border-japan-indigo-800 shadow-sm'
                  : 'bg-[#FAF8F5] dark:bg-zinc-800 text-japan-charcoal-700 dark:text-zinc-300 border-japan-charcoal-200 dark:border-zinc-700 hover:border-japan-charcoal-400'
              }`}
            >
              Custom
            </button>
          </div>

          {countSelection === -1 && (
            <div className="mt-2.5 flex items-center gap-2">
              <span className="text-japan-charcoal-500">Custom Count:</span>
              <input
                type="number"
                min="1"
                max="200"
                value={customCount}
                onChange={(e) => setCustomCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 px-3 py-1.5 border border-japan-charcoal-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-center font-bold"
              />
            </div>
          )}
        </div>

        {/* Study Mode */}
        <div>
          <label className="block text-japan-charcoal-700 dark:text-zinc-300 font-bold mb-2 uppercase tracking-wide">
            Quiz Mode
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { id: 'random', label: 'Random Mixed', desc: 'Balanced selection' },
              { id: 'new', label: 'New Material', desc: 'Unlearned / untouched' },
              { id: 'review', label: `Review Due (${dueReviewCount})`, desc: 'Prioritize mistakes' },
              { id: 'weak', label: 'Weak Areas', desc: 'Lowest skill accuracy' },
              { id: 'incorrect', label: 'Past Mistakes', desc: 'Items with errors' },
              { id: 'all', label: 'Full Category', desc: 'Complete item pool' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  setMode(m.id as typeof mode);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  mode === m.id
                    ? 'bg-japan-indigo-50 dark:bg-zinc-800 text-japan-indigo-900 dark:text-zinc-100 border-japan-indigo-800 shadow-xs'
                    : 'bg-[#FAF8F5] dark:bg-zinc-800/60 text-japan-charcoal-600 dark:text-zinc-400 border-japan-charcoal-200/80 dark:border-zinc-700 hover:border-japan-charcoal-400'
                }`}
              >
                <div className="font-bold text-xs">{m.label}</div>
                <div className="text-[10px] opacity-75">{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Kanji Specific Skill Selection (Separated On'yomi and Kun'yomi!) */}
        {category === 'kanji' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-japan-charcoal-700 dark:text-zinc-300 font-bold uppercase tracking-wide">
                Target Question Types (On & Kun Separated)
              </label>
              <button
                type="button"
                onClick={() => setSelectedSkills(kanjiSkills.map((k) => k.id))}
                className="text-[10px] text-japan-indigo-800 dark:text-indigo-400 hover:underline font-semibold"
              >
                Select All
              </button>
            </div>
            <div className="space-y-1.5 bg-[#FAF8F5] dark:bg-zinc-800/80 p-3 rounded-xl border border-japan-charcoal-200/60 dark:border-zinc-700">
              {kanjiSkills.map((sk) => {
                const isChecked = selectedSkills.includes(sk.id);
                return (
                  <button
                    key={sk.id}
                    type="button"
                    onClick={() => toggleSkill(sk.id)}
                    className="w-full flex items-center justify-between p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-700 transition-colors text-left"
                  >
                    <span className="font-medium text-japan-charcoal-800 dark:text-zinc-200">
                      {sk.label}
                    </span>
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-japan-indigo-800 dark:text-indigo-400" />
                    ) : (
                      <Square className="w-4 h-4 text-japan-charcoal-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Start Button */}
        <div className="pt-3 border-t border-japan-charcoal-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={handleStart}
            className="w-full py-3 rounded-xl bg-japan-indigo-800 hover:bg-japan-indigo-900 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start Customized Quiz Now</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
