import { readFileSync, writeFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { XMLParser } from 'fast-xml-parser';

const gz = readFileSync(new URL('./downloads/kanjidic2.xml.gz', import.meta.url));
const xml = gunzipSync(gz).toString('utf8');

const parser = new XMLParser({ ignoreAttributes: false, trimValues: true });
const doc = parser.parse(xml);

const out = [];
for (const entry of doc.kanjidic2.character) {
  const literal = entry.literal;
  if (!literal || typeof literal !== 'string' || [...literal].length !== 1) continue;

  const readings = { on: [], kun: [] };
  const meanings = [];
  let strokeCount;
  let radical;
  let grade;
  let frequency;

  const misc = entry.misc || {};
  const firstNum = (v) => {
    if (v === undefined || v === null || v === '') return undefined;
    const n = Number(Array.isArray(v) ? v[0] : v);
    return Number.isFinite(n) ? n : undefined;
  };
  strokeCount = firstNum(misc.stroke_count);
  grade = firstNum(misc.grade);
  frequency = firstNum(misc.freq);

  if (misc.rad_name) radical = misc.rad_name;

  const readingMatter = entry.reading_meaning || {};
  const rmGroup = readingMatter.rmgroup || [];
  for (const group of Array.isArray(rmGroup) ? rmGroup : [rmGroup]) {
    const readList = group.reading || [];
    for (const r of Array.isArray(readList) ? readList : [readList]) {
      const t = r['@_r_type'];
      if (t === 'ja_on') readings.on.push(r['#text']);
      else if (t === 'ja_kun') readings.kun.push(r['#text']);
    }
    const meanList = group.meaning || [];
    for (const m of Array.isArray(meanList) ? meanList : [meanList]) {
      if (typeof m === 'string') meanings.push(m);
      else if (m && (!m['@_m_lang'] || m['@_m_lang'] === 'en')) meanings.push(m['#text']);
    }
  }

  out.push({
    character: literal,
    strokeCount,
    radical,
    grade,
    frequency,
    onyomi: readings.on,
    kunyomi: readings.kun,
    meanings,
  });
}

writeFileSync(new URL('./downloads/kanjidic2-parsed.json', import.meta.url), JSON.stringify(out));
console.log(`Parsed ${out.length} kanji entries.`);
const sample = out.find((k) => k.character === '日');
console.log('Sample:', JSON.stringify(sample, null, 2));
