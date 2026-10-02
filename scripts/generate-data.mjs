import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dl = (f) => join(__dirname, 'downloads', f);
const out = (f) => join(__dirname, '..', 'src', 'data', f);

const LEVELS = ['n5', 'n4', 'n3', 'n2', 'n1'];
const LEVEL_RANK = Object.fromEntries(LEVELS.map((l, i) => [l, i]));

const load = (f) => JSON.parse(readFileSync(dl(f), 'utf8'));
const kanjiByLevel = Object.fromEntries(LEVELS.map((l) => [l, load(`openjlpt-kanji-${l}.json`)]));
const vocabByLevel = Object.fromEntries(LEVELS.map((l) => [l, load(`openjlpt-vocab-${l}.json`)]));
const grammarByLevel = Object.fromEntries(LEVELS.map((l) => [l, load(`openjlpt-grammar-${l}.json`)]));

const POS_MAP = {
  n: 'Noun', 'n-adv': 'Noun / Adverb', 'n-t': 'Noun / Adverb', 'n-suf': 'Noun Suffix',
  'n-pr': 'Proper Noun', 'n-prec': 'Noun (Precedural)',
  v1: 'Ichidan Verb (る-verb)', 'v1-s': 'Ichidan Verb (る-verb)',
  v5u: 'Godan Verb (う-verb)', 'v5k': 'Godan Verb (く-verb)', 'v5k-s': 'Godan Verb (く-verb)',
  v5s: 'Godan Verb (す-verb)', v5t: 'Godan Verb (つ-verb)', v5n: 'Godan Verb (ぬ-verb)',
  v5m: 'Godan Verb (む-verb)', v5g: 'Godan Verb (ぐ-verb)', v5b: 'Godan Verb (ぶ-verb)',
  v5r: 'Godan Verb (る-verb)', 'v5u-s': 'Godan Verb', 'v5aru': 'Godan Verb (ある-verb)',
  vk: 'Irregular Verb (カ変)', vs: 'Irregular Verb (サ変)', 'vs-i': 'Irregular Verb (サ変)',
  'vs-s': 'Irregular Verb (サ変)', vz: 'Irregular Verb (ザ変)',
  vi: 'Intransitive Verb', vt: 'Transitive Verb',
  'adj-i': 'い-Adjective', 'adj-ix': 'い-Adjective', 'adj-na': 'な-Adjective',
  'adj-no': 'の-Adjective', 'adj-t': 'たる-Adjective', 'adj-f': 'Adjective (Pre-noun)',
  'adj-pn': 'Adjective (Pre-noun)', 'adj-nari': 'な-Adjective (Archaic)',
  'adj-ku': 'Adjective (Archaic)', 'adj-shiku': 'Adjective (Archaic)',
  adv: 'Adverb', 'adv-to': 'Adverb (と)', int: 'Interjection', exp: 'Expression',
  prt: 'Particle', conj: 'Conjunction', aux: 'Auxiliary Verb', 'aux-v': 'Auxiliary Verb',
  'aux-adj': 'Auxiliary Adjective', num: 'Number', pn: 'Pronoun', ctr: 'Counter',
  pref: 'Prefix', suf: 'Suffix', cop: 'Copula (だ/です)', unc: 'Unclassified',
};

function posLabel(posList) {
  const labels = [];
  for (const p of posList || []) {
    if (POS_MAP[p]) labels.push(POS_MAP[p]);
  }
  return labels.length ? labels.join(' / ') : (posList || []).join('/');
}

function stripFurigana(furigana) {
  if (!furigana) return undefined;
  return furigana.replace(/\{([^}]*)\|([^}]*)\}/g, '$2');
}

// ------------------------------------------------------------
// Cross-reference indexes built from the vocabulary dataset
// ------------------------------------------------------------

// char -> vocab words containing it, same-level first
const charWordIndex = new Map();
// char -> example sentences containing it, same-level first
const charSentenceIndex = new Map();

for (const l of LEVELS) {
  for (const v of vocabByLevel[l]) {
    const meaning = (v.meanings || []).join(', ');
    for (const ch of [...v.word]) {
      if (!/[\u4e00-\u9fff]/.test(ch)) continue;
      if (!charWordIndex.has(ch)) charWordIndex.set(ch, []);
      const list = charWordIndex.get(ch);
      if (!list.some((w) => w.word === v.word)) {
        list.push({ word: v.word, reading: v.reading, meaning, level: l });
      }
    }
    for (const ex of v.examples || []) {
      for (const ch of [...ex.ja]) {
        if (!/[\u4e00-\u9fff]/.test(ch)) continue;
        if (!charSentenceIndex.has(ch)) charSentenceIndex.set(ch, []);
        const list = charSentenceIndex.get(ch);
        if (list.length >= 15) continue;
        if (!list.some((s) => s.japanese === ex.ja)) {
          list.push({
            japanese: ex.ja,
            reading: stripFurigana(ex.furigana),
            english: ex.en,
            level: l,
          });
        }
      }
    }
  }
}

function pickByLevelRank(arr, level, max) {
  const ranked = [...(arr || [])].sort((a, b) => {
    const da = a.level === level ? 0 : LEVEL_RANK[a.level] ?? 9;
    const db = b.level === level ? 0 : LEVEL_RANK[b.level] ?? 9;
    return da - db;
  });
  return ranked.slice(0, max);
}

// ------------------------------------------------------------
// Kanji generation
// ------------------------------------------------------------
function genKanji(level, list) {
  const sorted = [...list].sort((a, b) => {
    const fa = typeof a.freq === 'number' ? a.freq : 99999;
    const fb = typeof b.freq === 'number' ? b.freq : 99999;
    return fa - fb;
  });
  return sorted.map((k, i) => {
    const words = pickByLevelRank(charWordIndex.get(k.character), level, 4).map((w) => ({
      word: w.word,
      reading: w.reading,
      meaning: w.meaning,
    }));
    const sentences = pickByLevelRank(charSentenceIndex.get(k.character), level, 2).map((s) => ({
      japanese: s.japanese,
      reading: s.reading,
      english: s.english,
    }));
    return {
      id: `${level}-k-${String(i + 1).padStart(4, '0')}`,
      character: k.character,
      meaning: (k.meanings || []).slice(0, 4).join(', '),
      onyomi: k.onyomi || [],
      kunyomi: k.kunyomi || [],
      strokeCount: typeof k.strokes === 'number' ? k.strokes : undefined,
      radical: k.radical,
      grade: typeof k.grade === 'number' ? k.grade : undefined,
      exampleWords: words,
      exampleSentences: sentences,
      jlptLevel: level,
    };
  });
}

// ------------------------------------------------------------
// Vocabulary generation
// ------------------------------------------------------------
function genVocab(level, list) {
  return list.map((v, i) => {
    const first = (v.examples || [])[0];
    const item = {
      id: `${level}-v-${String(i + 1).padStart(4, '0')}`,
      word: v.word,
      reading: v.reading,
      meaning: (v.meanings || []).slice(0, 4).join(', '),
      kanji: (v.other_forms && v.other_forms[0]) || v.word,
      jlptLevel: level,
      partOfSpeech: posLabel(v.pos),
    };
    if (first) {
      item.exampleSentence = { japanese: first.ja, english: first.en };
    }
    return item;
  });
}

// ------------------------------------------------------------
// Grammar generation
// ------------------------------------------------------------
function genGrammar(level, list) {
  return list.map((g, i) => ({
    id: `${level}-g-${String(i + 1).padStart(4, '0')}`,
    pattern: g.pattern,
    meaning: g.meaning,
    structure: g.formation || '',
    usage: g.notes || '',
    jlptLevel: level,
    examples: (g.examples || []).slice(0, 3).map((ex) => ({
      japanese: ex.ja,
      english: ex.en,
    })),
    notes: '',
    categoryTag: (g.tags && g.tags[0]) || undefined,
  }));
}

// ------------------------------------------------------------
// Write output
// ------------------------------------------------------------
const counts = {};
for (const l of LEVELS) {
  const kanji = genKanji(l, kanjiByLevel[l]);
  const vocab = genVocab(l, vocabByLevel[l]);
  const grammar = genGrammar(l, grammarByLevel[l]);
  counts[l] = { kanji: kanji.length, vocabulary: vocab.length, grammar: grammar.length };
  writeFileSync(out(`${l}/kanji.json`), JSON.stringify(kanji, null, 2) + '\n');
  writeFileSync(out(`${l}/vocabulary.json`), JSON.stringify(vocab, null, 2) + '\n');
  writeFileSync(out(`${l}/grammar.json`), JSON.stringify(grammar, null, 2) + '\n');
  console.log(`${l.toUpperCase()}: kanji ${kanji.length}, vocab ${vocab.length}, grammar ${grammar.length}`);
}

// Quality spot-checks
let kanjiNoWords = 0, kanjiNoSent = 0, grammarNoNotes = 0, vocabNoExample = 0;
for (const l of LEVELS) {
  for (const k of kanjiByLevel[l]) {
    if (!charWordIndex.has(k.character)) kanjiNoWords++;
    if (!charSentenceIndex.has(k.character)) kanjiNoSent++;
  }
  for (const g of grammarByLevel[l]) if (!g.notes) grammarNoNotes++;
  for (const v of vocabByLevel[l]) if (!(v.examples || []).length) vocabNoExample++;
}
console.log('---');
console.log('kanji without any example word:', kanjiNoWords);
console.log('kanji without any example sentence:', kanjiNoSent);
console.log('grammar without notes:', grammarNoNotes);
console.log('vocab without example sentence:', vocabNoExample);

// Cumulative kanji
let cum = 0;
for (const l of LEVELS) {
  cum += counts[l].kanji;
  console.log(`kanji cumulative ${l.toUpperCase()}: ${cum}`);
}
