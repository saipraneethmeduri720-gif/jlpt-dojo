import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'src', 'data');
const LEVELS = ['n5', 'n4', 'n3', 'n2', 'n1'];
const CATS = ['kanji', 'vocabulary', 'grammar', 'other'];

const KATAKANA_RE = /^[\u30a0-\u30ff、・ー\-\.]+$/;
const HIRAGANA_RE = /^[\u3040-\u309f、・ー\-\.]+$/;
// rare but legitimate: unit kanji like 籵 carry katakana loanword readings as ja_kun in KANJIDIC2
const KUNYOMI_RE = /^[\u3040-\u309f\u30a0-\u30ff、・ー\-\.]+$/;
// CJK Unified Ideographs + Extension B (𠮟 U+20B9F is the standard form of 叱)
const KANJI_CHAR_RE = /^[\u4e00-\u9fff\u{20000}-\u{2a6df}]$/u;
const PLACEHOLDER_RE = /\b(placeholder|todo|fixme|lorem ipsum|sample data|test data|fake data)\b/i;
const VOCAB_READING_RE = /^[\u3040-\u309f\u30a0-\u30ff、・ー\.]+$/;

const problems = [];
const report = (cat, msg) => problems.push(`[${cat}] ${msg}`);

const counts = {};
const kanjiSeen = new Map(); // char -> level
const vocabSeen = new Map(); // word|reading -> level
const grammarSeen = new Map(); // pattern -> level

// KANJIDIC2 cross-reference for kanji fields
const kanjidic = JSON.parse(readFileSync(join(__dirname, 'downloads', 'kanjidic2-parsed.json'), 'utf8'));
const kanjidicByChar = new Map(kanjidic.map((k) => [k.character, k]));
let readingMismatches = 0;

for (const l of LEVELS) {
  counts[l] = {};
  for (const c of CATS) {
    const file = join(dataDir, l, `${c}.json`);
    const raw = readFileSync(file, 'utf8');
    if (raw.charCodeAt(0) === 0xfeff) report('encoding', `${l}/${c}.json has UTF-8 BOM`);
    let items;
    try {
      items = JSON.parse(raw);
    } catch (e) {
      report('malformed', `${l}/${c}.json failed to parse: ${e.message}`);
      continue;
    }
    if (!Array.isArray(items)) {
      report('malformed', `${l}/${c}.json is not an array`);
      continue;
    }
    counts[l][c] = items.length;

    items.forEach((it, i) => {
      const where = `${l}/${c}#${i} (${it.id || 'no-id'})`;
      if (!it.id) return report('missing', `${where}: no id`);
      if (it.jlptLevel !== l) report('level', `${where}: jlptLevel=${it.jlptLevel} expected ${l}`);

      const allText = JSON.stringify(it);
      if (PLACEHOLDER_RE.test(allText)) report('placeholder', `${where}: placeholder-like text found`);

      if (c === 'kanji') {
        if (!it.character || !KANJI_CHAR_RE.test(it.character))
          return report('invalid-char', `${where}: bad character "${it.character}"`);
        if (!it.meaning) report('missing', `${where}: no meaning`);
        if (!Array.isArray(it.onyomi) || !Array.isArray(it.kunyomi))
          report('malformed', `${where}: onyomi/kunyomi not arrays`);
        else {
          for (const r of it.onyomi) if (r !== '-' && !KATAKANA_RE.test(r)) report('invalid-reading', `${where}: onyomi "${r}" not katakana`);
          for (const r of it.kunyomi) if (r !== '-' && !KUNYOMI_RE.test(r)) report('invalid-reading', `${where}: kunyomi "${r}" not kana`);
        }
        if (kanjiSeen.has(it.character)) report('duplicate-kanji', `${where}: "${it.character}" already in ${kanjiSeen.get(it.character)}`);
        else kanjiSeen.set(it.character, l);

        const ref = kanjidicByChar.get(it.character);
        if (ref) {
          const onMatch = JSON.stringify([...it.onyomi].sort()) === JSON.stringify([...ref.onyomi].sort());
          const kunMatch = JSON.stringify([...it.kunyomi].sort()) === JSON.stringify([...ref.kunyomi].sort());
          if (!onMatch || !kunMatch) readingMismatches++;
          if (typeof it.strokeCount === 'number' && ref.strokeCount !== it.strokeCount)
            report('crosscheck', `${where}: strokes ${it.strokeCount} vs KANJIDIC2 ${ref.strokeCount}`);
        }
      }

      if (c === 'vocabulary') {
        if (!it.word) return report('missing', `${where}: no word`);
        if (!it.reading || !VOCAB_READING_RE.test(it.reading.replace(/[・、]/g, '')))
          report('invalid-reading', `${where}: reading "${it.reading}"`);
        if (!it.meaning) report('missing', `${where}: no meaning`);
        const key = `${it.word}|${it.reading}`;
        if (vocabSeen.has(key)) report('duplicate-vocab', `${where}: "${it.word}" already in ${vocabSeen.get(key)}`);
        else vocabSeen.set(key, l);
        if (it.exampleSentence && (!it.exampleSentence.japanese || !it.exampleSentence.english))
          report('malformed', `${where}: incomplete exampleSentence`);
      }

      if (c === 'grammar') {
        if (!it.pattern) return report('missing', `${where}: no pattern`);
        if (!it.meaning) report('missing', `${where}: no meaning`);
        if (grammarSeen.has(it.pattern)) report('duplicate-grammar', `${where}: "${it.pattern}" already in ${grammarSeen.get(it.pattern)}`);
        else grammarSeen.set(it.pattern, l);
        for (const ex of it.examples || []) {
          if (!ex.japanese || !ex.english) report('malformed', `${where}: incomplete example`);
        }
      }

      if (c === 'other') {
        if (!it.title || !it.japanese || !it.reading || !it.meaning)
          report('missing', `${where}: missing required field`);
      }
    });
  }
}

// Quiz compatibility: enough items for distractors
for (const l of LEVELS) {
  for (const c of CATS) {
    if (counts[l][c] < 4) report('quiz', `${l}/${c} has only ${counts[l][c]} items (<4 needed for distractors)`);
  }
}

console.log('=== COUNTS ===');
for (const l of LEVELS) {
  console.log(`${l.toUpperCase()}: kanji ${counts[l].kanji}, vocabulary ${counts[l].vocabulary}, grammar ${counts[l].grammar}, other ${counts[l].other}`);
}
let cum = 0;
for (const l of LEVELS) {
  cum += counts[l].kanji;
  console.log(`kanji cumulative ${l.toUpperCase()}: ${cum}`);
}

console.log('\n=== PROBLEMS ===');
if (problems.length === 0) console.log('none');
else problems.forEach((p) => console.log(p));

console.log('\n=== CROSS-CHECK vs KANJIDIC2 ===');
console.log(`kanji with on/kun reading mismatches vs KANJIDIC2: ${readingMismatches} / ${kanjiSeen.size}`);
