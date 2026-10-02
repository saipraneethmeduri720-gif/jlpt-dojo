import {
  JLPTLevel,
  CategoryType,
  KanjiItem,
  VocabularyItem,
  GrammarItem,
  OtherItem,
  JLPTItem,
} from '../types';

import n5Kanji from './n5/kanji.json';
import n5Vocab from './n5/vocabulary.json';
import n5Grammar from './n5/grammar.json';
import n5Other from './n5/other.json';

import n4Kanji from './n4/kanji.json';
import n4Vocab from './n4/vocabulary.json';
import n4Grammar from './n4/grammar.json';
import n4Other from './n4/other.json';

import n3Kanji from './n3/kanji.json';
import n3Vocab from './n3/vocabulary.json';
import n3Grammar from './n3/grammar.json';
import n3Other from './n3/other.json';

import n2Kanji from './n2/kanji.json';
import n2Vocab from './n2/vocabulary.json';
import n2Grammar from './n2/grammar.json';
import n2Other from './n2/other.json';

import n1Kanji from './n1/kanji.json';
import n1Vocab from './n1/vocabulary.json';
import n1Grammar from './n1/grammar.json';
import n1Other from './n1/other.json';

export interface LevelMeta {
  level: JLPTLevel;
  title: string;
  subtitle: string;
  kanjiTitle: string;
  description: string;
  color: string;
  accentColor: string;
  badge: string;
}

export const JLPT_LEVEL_INFO: Record<JLPTLevel, LevelMeta> = {
  n5: {
    level: 'n5',
    title: 'N5',
    subtitle: 'JLPT Beginner Level (初級)',
    kanjiTitle: '基礎入門',
    description: 'The ability to understand some basic Japanese. Ability to read and understand typical expressions and sentences written in hiragana, katakana, and basic kanji.',
    color: '#059669',
    accentColor: '#10B981',
    badge: 'Beginner',
  },
  n4: {
    level: 'n4',
    title: 'N4',
    subtitle: 'JLPT Elementary Level (初中級)',
    kanjiTitle: '日常会話',
    description: 'The ability to understand basic Japanese used in daily life, basic conversations, and slightly complex sentence structures.',
    color: '#0284C7',
    accentColor: '#38BDF8',
    badge: 'Elementary',
  },
  n3: {
    level: 'n3',
    title: 'N3',
    subtitle: 'JLPT Intermediate Level (中級)',
    kanjiTitle: '中級架け橋',
    description: 'The bridge between basic and advanced Japanese. The ability to understand Japanese used in everyday situations to a certain degree.',
    color: '#D97706',
    accentColor: '#FBBF24',
    badge: 'Intermediate',
  },
  n2: {
    level: 'n2',
    title: 'N2',
    subtitle: 'JLPT Pre-Advanced Level (上級中)',
    kanjiTitle: 'ビジネス実務',
    description: 'The ability to understand Japanese used in everyday situations, and in a variety of business and specialized circumstances.',
    color: '#7C3AED',
    accentColor: '#A78BFA',
    badge: 'Pre-Advanced',
  },
  n1: {
    level: 'n1',
    title: 'N1',
    subtitle: 'JLPT Advanced Mastery Level (最上級)',
    kanjiTitle: '完全制覇',
    description: 'The highest level. The ability to understand Japanese used in a wide range of complex, abstract, and literary circumstances.',
    color: '#E83929',
    accentColor: '#F87171',
    badge: 'Mastery',
  },
};

export const CATEGORY_INFO: Record<CategoryType, { title: string; kanjiTitle: string; iconName: string; description: string }> = {
  kanji: {
    title: 'Kanji',
    kanjiTitle: '漢字',
    iconName: 'Sparkles',
    description: 'Character stroke order, on/kun readings, compounds, and mnemonics',
  },
  vocabulary: {
    title: 'Vocabulary',
    kanjiTitle: '語彙',
    iconName: 'BookOpen',
    description: 'High-frequency words, phrases, meanings, and practical usage contexts',
  },
  grammar: {
    title: 'Grammar',
    kanjiTitle: '文法',
    iconName: 'Layers',
    description: 'Sentence structures, particle rules, conjugations, and patterns',
  },
  other: {
    title: 'Other',
    kanjiTitle: 'その他',
    iconName: 'Compass',
    description: 'Kana, numbers, counters, dates, time, keigo, and cultural expressions',
  },
};

const DATA_REGISTRY: Record<JLPTLevel, Record<CategoryType, JLPTItem[]>> = {
  n5: {
    kanji: n5Kanji as KanjiItem[],
    vocabulary: n5Vocab as VocabularyItem[],
    grammar: n5Grammar as GrammarItem[],
    other: n5Other as OtherItem[],
  },
  n4: {
    kanji: n4Kanji as KanjiItem[],
    vocabulary: n4Vocab as VocabularyItem[],
    grammar: n4Grammar as GrammarItem[],
    other: n4Other as OtherItem[],
  },
  n3: {
    kanji: n3Kanji as KanjiItem[],
    vocabulary: n3Vocab as VocabularyItem[],
    grammar: n3Grammar as GrammarItem[],
    other: n3Other as OtherItem[],
  },
  n2: {
    kanji: n2Kanji as KanjiItem[],
    vocabulary: n2Vocab as VocabularyItem[],
    grammar: n2Grammar as GrammarItem[],
    other: n2Other as OtherItem[],
  },
  n1: {
    kanji: n1Kanji as KanjiItem[],
    vocabulary: n1Vocab as VocabularyItem[],
    grammar: n1Grammar as GrammarItem[],
    other: n1Other as OtherItem[],
  },
};

export function getCategoryItems<T extends JLPTItem = JLPTItem>(
  level: JLPTLevel,
  category: CategoryType
): T[] {
  const levelData = DATA_REGISTRY[level];
  if (!levelData) return [];
  return (levelData[category] || []) as T[];
}

export function getAllItemsForLevel(level: JLPTLevel): JLPTItem[] {
  const levelData = DATA_REGISTRY[level];
  if (!levelData) return [];
  return [
    ...levelData.kanji,
    ...levelData.vocabulary,
    ...levelData.grammar,
    ...levelData.other,
  ];
}

export function getItemById(id: string): JLPTItem | undefined {
  for (const level of ['n5', 'n4', 'n3', 'n2', 'n1'] as JLPTLevel[]) {
    for (const cat of ['kanji', 'vocabulary', 'grammar', 'other'] as CategoryType[]) {
      const items = DATA_REGISTRY[level][cat];
      const found = items.find((it) => it.id === id);
      if (found) return found;
    }
  }
  return undefined;
}

export function getLevelItemCounts(level: JLPTLevel): Record<CategoryType, number> {
  const data = DATA_REGISTRY[level];
  return {
    kanji: data.kanji.length,
    vocabulary: data.vocabulary.length,
    grammar: data.grammar.length,
    other: data.other.length,
  };
}

export function getTotalCountForLevel(level: JLPTLevel): number {
  const counts = getLevelItemCounts(level);
  return counts.kanji + counts.vocabulary + counts.grammar + counts.other;
}
