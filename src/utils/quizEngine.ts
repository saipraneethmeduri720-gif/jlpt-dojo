import {
  JLPTLevel,
  CategoryType,
  KanjiItem,
  VocabularyItem,
  GrammarItem,
  OtherItem,
  QuizQuestion,
  ItemProgressRecord,
  WeakAreaItem,
} from '../types';
import { getCategoryItems } from '../data';

export interface QuizGenerationOptions {
  level: JLPTLevel;
  category: CategoryType;
  questionCount: number | 'all';
  mode: 'all' | 'new' | 'review' | 'weak' | 'incorrect' | 'random';
  selectedSkills?: string[]; // e.g. ['meaning', 'onyomi', 'kunyomi', 'vocabulary', 'reading', 'sentence']
  progressMap: Record<string, ItemProgressRecord>;
  weakAreasMap: Record<string, WeakAreaItem>;
  reviewQueue: string[];
}

// Utility: shuffle array (Fisher-Yates)
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Pick N random distinct items from pool excluding target
function pickDistractors<T>(pool: T[], target: T, count: number, valueExtractor: (item: T) => string): string[] {
  const targetVal = valueExtractor(target);
  const candidates = pool
    .map(valueExtractor)
    .filter((val) => val && val !== targetVal && val.length > 0);
  
  const uniqueCandidates = Array.from(new Set(candidates));
  const shuffled = shuffleArray(uniqueCandidates);
  return shuffled.slice(0, count);
}

export function generateQuiz(options: QuizGenerationOptions): QuizQuestion[] {
  const { level, category, questionCount, mode, selectedSkills, progressMap, weakAreasMap, reviewQueue } = options;
  const allItems = getCategoryItems(level, category);

  if (allItems.length === 0) return [];

  // Filter items based on selected mode
  let targetItems = [...allItems];

  if (mode === 'new') {
    targetItems = allItems.filter((it) => {
      const prog = progressMap[it.id];
      return !prog || prog.learningStatus === 'unlearned' || prog.attempts === 0;
    });
  } else if (mode === 'review') {
    targetItems = allItems.filter((it) => {
      const prog = progressMap[it.id];
      return reviewQueue.includes(it.id) || (prog && (prog.quizStatus === 'needs_review' || prog.quizStatus === 'wrong'));
    });
  } else if (mode === 'weak') {
    const weakItemIds = Object.values(weakAreasMap)
      .filter((w) => w.level === level && w.category === category)
      .map((w) => w.itemId);
    targetItems = allItems.filter((it) => weakItemIds.includes(it.id));
  } else if (mode === 'incorrect') {
    targetItems = allItems.filter((it) => {
      const prog = progressMap[it.id];
      return prog && prog.wrong > 0;
    });
  }

  // Fallback to all items if filtered list is empty
  if (targetItems.length === 0) {
    targetItems = [...allItems];
  }

  // Generate question pool
  let questionPool: QuizQuestion[] = [];

  if (category === 'kanji') {
    questionPool = generateKanjiQuestions(targetItems as KanjiItem[], allItems as KanjiItem[], selectedSkills);
  } else if (category === 'vocabulary') {
    questionPool = generateVocabularyQuestions(targetItems as VocabularyItem[], allItems as VocabularyItem[]);
  } else if (category === 'grammar') {
    questionPool = generateGrammarQuestions(targetItems as GrammarItem[], allItems as GrammarItem[]);
  } else {
    questionPool = generateOtherQuestions(targetItems as OtherItem[], allItems as OtherItem[]);
  }

  // Shuffle all generated questions
  const randomized = shuffleArray(questionPool);

  // Slice to desired question count
  if (questionCount === 'all') {
    return randomized;
  }

  const count = typeof questionCount === 'number' ? questionCount : 20;
  return randomized.slice(0, Math.min(count, randomized.length));
}

// ----------------------------------------------------
// KANJI QUESTIONS GENERATOR
// NOTE: On'yomi and Kun'yomi are strictly SEPARATED and randomized!
// ----------------------------------------------------
function generateKanjiQuestions(
  items: KanjiItem[],
  allKanjiPool: KanjiItem[],
  selectedSkills?: string[]
): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  const activeSkills = selectedSkills && selectedSkills.length > 0
    ? selectedSkills
    : ['meaning', 'onyomi', 'kunyomi', 'vocabulary', 'reading', 'sentence'];

  items.forEach((kanji) => {
    // 1. Kanji -> Meaning
    if (activeSkills.includes('meaning')) {
      const distractors = pickDistractors(allKanjiPool, kanji, 3, (k) => k.meaning);
      if (distractors.length >= 2) {
        questions.push({
          id: `q-km-${kanji.id}-${Date.now()}-${Math.random()}`,
          itemId: kanji.id,
          level: kanji.jlptLevel,
          category: 'kanji',
          skillType: 'meaning',
          prompt: `What is the primary English meaning of the Kanji 「 ${kanji.character} 」?`,
          hint: kanji.radical ? `Radical: ${kanji.radical} (${kanji.strokeCount || 0} strokes)` : undefined,
          options: shuffleArray([kanji.meaning, ...distractors]),
          correctAnswer: kanji.meaning,
          explanation: `「 ${kanji.character} 」 means "${kanji.meaning}". On'yomi: ${kanji.onyomi.join(', ') || '—'} | Kun'yomi: ${kanji.kunyomi.join(', ') || '—'}`,
          itemDetails: kanji,
        });
      }
    }

    // 2. Meaning -> Kanji
    if (activeSkills.includes('meaning')) {
      const distractors = pickDistractors(allKanjiPool, kanji, 3, (k) => k.character);
      if (distractors.length >= 2) {
        questions.push({
          id: `q-mk-${kanji.id}-${Date.now()}-${Math.random()}`,
          itemId: kanji.id,
          level: kanji.jlptLevel,
          category: 'kanji',
          skillType: 'meaning',
          prompt: `Which Kanji corresponds to the meaning: "${kanji.meaning}"?`,
          options: shuffleArray([kanji.character, ...distractors]),
          correctAnswer: kanji.character,
          explanation: `"${kanji.meaning}" is represented by the Kanji 「 ${kanji.character} 」.`,
          itemDetails: kanji,
        });
      }
    }

    // 3. Kanji -> On'yomi (SEPARATE QUESTION)
    if (activeSkills.includes('onyomi') && kanji.onyomi.length > 0 && kanji.onyomi[0] !== '-') {
      const correctOnyomi = kanji.onyomi.join('、 ');
      const distractors = pickDistractors(
        allKanjiPool.filter((k) => k.onyomi.length > 0 && k.onyomi[0] !== '-'),
        kanji,
        3,
        (k) => k.onyomi.join('、 ')
      );
      if (distractors.length >= 2) {
        questions.push({
          id: `q-on-${kanji.id}-${Date.now()}-${Math.random()}`,
          itemId: kanji.id,
          level: kanji.jlptLevel,
          category: 'kanji',
          skillType: 'onyomi',
          prompt: `What is the On'yomi (音読み, Chinese-derived reading in Katakana) of 「 ${kanji.character} 」?`,
          subPrompt: `Meaning: ${kanji.meaning}`,
          options: shuffleArray([correctOnyomi, ...distractors]),
          correctAnswer: correctOnyomi,
          explanation: `The On'yomi reading of 「 ${kanji.character} 」 is ${correctOnyomi}.`,
          itemDetails: kanji,
        });
      }
    }

    // 4. Kanji -> Kun'yomi (SEPARATE QUESTION)
    if (activeSkills.includes('kunyomi') && kanji.kunyomi.length > 0 && kanji.kunyomi[0] !== '-') {
      const correctKunyomi = kanji.kunyomi.join('、 ');
      const distractors = pickDistractors(
        allKanjiPool.filter((k) => k.kunyomi.length > 0 && k.kunyomi[0] !== '-'),
        kanji,
        3,
        (k) => k.kunyomi.join('、 ')
      );
      if (distractors.length >= 2) {
        questions.push({
          id: `q-kun-${kanji.id}-${Date.now()}-${Math.random()}`,
          itemId: kanji.id,
          level: kanji.jlptLevel,
          category: 'kanji',
          skillType: 'kunyomi',
          prompt: `What is the Kun'yomi (訓読み, native Japanese reading in Hiragana) of 「 ${kanji.character} 」?`,
          subPrompt: `Meaning: ${kanji.meaning}`,
          options: shuffleArray([correctKunyomi, ...distractors]),
          correctAnswer: correctKunyomi,
          explanation: `The Kun'yomi reading of 「 ${kanji.character} 」 is ${correctKunyomi}.`,
          itemDetails: kanji,
        });
      }
    }

    // 5. Vocabulary containing Kanji
    if (activeSkills.includes('vocabulary') && kanji.exampleWords.length > 0) {
      const sampleWord = kanji.exampleWords[0];
      const otherWordsPool = allKanjiPool.flatMap((k) => k.exampleWords);
      const distractors = pickDistractors(otherWordsPool, sampleWord, 3, (w) => `${w.word} (${w.meaning})`);
      if (distractors.length >= 2) {
        const correctChoice = `${sampleWord.word} (${sampleWord.meaning})`;
        questions.push({
          id: `q-kv-${kanji.id}-${Date.now()}-${Math.random()}`,
          itemId: kanji.id,
          level: kanji.jlptLevel,
          category: 'kanji',
          skillType: 'vocabulary',
          prompt: `Which vocabulary word uses the Kanji 「 ${kanji.character} 」 with the reading "${sampleWord.reading}"?`,
          options: shuffleArray([correctChoice, ...distractors]),
          correctAnswer: correctChoice,
          explanation: `「 ${sampleWord.word} 」 is read as 「 ${sampleWord.reading} 」 and means "${sampleWord.meaning}".`,
          itemDetails: kanji,
        });
      }
    }

    // 6. Sentence recognition
    if (activeSkills.includes('sentence') && kanji.exampleSentences && kanji.exampleSentences.length > 0) {
      const sent = kanji.exampleSentences[0];
      const otherSentences = allKanjiPool.flatMap((k) => k.exampleSentences || []);
      const distractors = pickDistractors(otherSentences, sent, 3, (s) => s.english);
      if (distractors.length >= 2) {
        questions.push({
          id: `q-ks-${kanji.id}-${Date.now()}-${Math.random()}`,
          itemId: kanji.id,
          level: kanji.jlptLevel,
          category: 'kanji',
          skillType: 'sentence',
          prompt: `Select the correct English translation for this sentence containing 「 ${kanji.character} 」:`,
          subPrompt: sent.japanese,
          options: shuffleArray([sent.english, ...distractors]),
          correctAnswer: sent.english,
          explanation: `Sentence: "${sent.japanese}" translates to "${sent.english}".`,
          itemDetails: kanji,
        });
      }
    }
  });

  return questions;
}

// ----------------------------------------------------
// VOCABULARY QUESTIONS GENERATOR
// ----------------------------------------------------
function generateVocabularyQuestions(
  items: VocabularyItem[],
  allVocabPool: VocabularyItem[]
): QuizQuestion[] {
  const questions: QuizQuestion[] = [];

  items.forEach((vocab) => {
    // 1. Japanese -> Meaning
    const distractorsMeaning = pickDistractors(allVocabPool, vocab, 3, (v) => v.meaning);
    if (distractorsMeaning.length >= 2) {
      questions.push({
        id: `q-vm-${vocab.id}-${Date.now()}-${Math.random()}`,
        itemId: vocab.id,
        level: vocab.jlptLevel,
        category: 'vocabulary',
        skillType: 'meaning',
        prompt: `What is the meaning of the word 「 ${vocab.word} 」 (${vocab.reading})?`,
        options: shuffleArray([vocab.meaning, ...distractorsMeaning]),
        correctAnswer: vocab.meaning,
        explanation: `「 ${vocab.word} 」 (${vocab.reading}) means "${vocab.meaning}". Part of speech: ${vocab.partOfSpeech}.`,
        itemDetails: vocab,
      });
    }

    // 2. Japanese -> Reading
    const distractorsReading = pickDistractors(allVocabPool, vocab, 3, (v) => v.reading);
    if (distractorsReading.length >= 2) {
      questions.push({
        id: `q-vr-${vocab.id}-${Date.now()}-${Math.random()}`,
        itemId: vocab.id,
        level: vocab.jlptLevel,
        category: 'vocabulary',
        skillType: 'reading',
        prompt: `What is the correct Hiragana reading for 「 ${vocab.word} 」?`,
        subPrompt: `Meaning: ${vocab.meaning}`,
        options: shuffleArray([vocab.reading, ...distractorsReading]),
        correctAnswer: vocab.reading,
        explanation: `「 ${vocab.word} 」 is read as 「 ${vocab.reading} 」.`,
        itemDetails: vocab,
      });
    }

    // 3. Meaning -> Japanese Word
    const distractorsWord = pickDistractors(allVocabPool, vocab, 3, (v) => `${v.word} (${v.reading})`);
    if (distractorsWord.length >= 2) {
      const correctWord = `${vocab.word} (${vocab.reading})`;
      questions.push({
        id: `q-vw-${vocab.id}-${Date.now()}-${Math.random()}`,
        itemId: vocab.id,
        level: vocab.jlptLevel,
        category: 'vocabulary',
        skillType: 'meaning',
        prompt: `Which Japanese word means "${vocab.meaning}"?`,
        options: shuffleArray([correctWord, ...distractorsWord]),
        correctAnswer: correctWord,
        explanation: `"${vocab.meaning}" is 「 ${vocab.word} 」 (${vocab.reading}).`,
        itemDetails: vocab,
      });
    }
  });

  return questions;
}

// ----------------------------------------------------
// GRAMMAR QUESTIONS GENERATOR
// ----------------------------------------------------
function generateGrammarQuestions(
  items: GrammarItem[],
  allGrammarPool: GrammarItem[]
): QuizQuestion[] {
  const questions: QuizQuestion[] = [];

  items.forEach((grammar) => {
    // 1. Meaning & Usage
    const distractors = pickDistractors(allGrammarPool, grammar, 3, (g) => g.meaning);
    if (distractors.length >= 2) {
      questions.push({
        id: `q-gm-${grammar.id}-${Date.now()}-${Math.random()}`,
        itemId: grammar.id,
        level: grammar.jlptLevel,
        category: 'grammar',
        skillType: 'meaning',
        prompt: `What is the meaning / function of the grammar pattern 「 ${grammar.pattern} 」?`,
        subPrompt: `Structure: ${grammar.structure}`,
        options: shuffleArray([grammar.meaning, ...distractors]),
        correctAnswer: grammar.meaning,
        explanation: `「 ${grammar.pattern} 」: ${grammar.meaning}. Structure: ${grammar.structure}.${grammar.notes ? ` Notes: ${grammar.notes}` : ''}`,
        itemDetails: grammar,
      });
    }

    // 2. Example Sentence Fill-in-the-blank
    if (grammar.examples.length > 0) {
      const ex = grammar.examples[0];
      const distractorsPattern = pickDistractors(allGrammarPool, grammar, 3, (g) => g.pattern);
      if (distractorsPattern.length >= 2) {
        questions.push({
          id: `q-gs-${grammar.id}-${Date.now()}-${Math.random()}`,
          itemId: grammar.id,
          level: grammar.jlptLevel,
          category: 'grammar',
          skillType: 'sentence_fill',
          prompt: `Which grammar pattern completes this sentence appropriately?`,
          subPrompt: `Sentence: "${ex.japanese}"\nMeaning: "${ex.english}"`,
          options: shuffleArray([grammar.pattern, ...distractorsPattern]),
          correctAnswer: grammar.pattern,
          explanation: `The pattern 「 ${grammar.pattern} 」 fits this structure: ${grammar.structure}.`,
          itemDetails: grammar,
        });
      }
    }
  });

  return questions;
}

// ----------------------------------------------------
// OTHER QUESTIONS GENERATOR
// ----------------------------------------------------
function generateOtherQuestions(
  items: OtherItem[],
  allOtherPool: OtherItem[]
): QuizQuestion[] {
  const questions: QuizQuestion[] = [];

  items.forEach((item) => {
    const distractors = pickDistractors(allOtherPool, item, 3, (o) => `${o.meaning} (${o.reading})`);
    if (distractors.length >= 2) {
      const correctChoice = `${item.meaning} (${item.reading})`;
      questions.push({
        id: `q-om-${item.id}-${Date.now()}-${Math.random()}`,
        itemId: item.id,
        level: item.jlptLevel,
        category: 'other',
        skillType: 'recognition',
        prompt: `What is the reading and meaning of 「 ${item.japanese} 」?`,
        subPrompt: `Category: ${item.subCategory.toUpperCase()} - ${item.title}`,
        options: shuffleArray([correctChoice, ...distractors]),
        correctAnswer: correctChoice,
        explanation: `「 ${item.japanese} 」 is read as 「 ${item.reading} 」 and means "${item.meaning}".`,
        itemDetails: item,
      });
    }
  });

  return questions;
}
