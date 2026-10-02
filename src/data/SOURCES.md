# Data Sources

The JLPT does not publish an official list of kanji, vocabulary, or grammar points.
The datasets in this directory are built from established, open JLPT-aligned references
and are documented here for transparency. No content is fabricated; example sentences
are real sentences sourced from Tatoeba.

## Primary dataset: OpenJLPT v0.3.0

- Repository: https://github.com/evanclan/OpenJLPT
- License: CC-BY-SA 4.0
- Used for: kanji (with readings, stroke counts, radicals), vocabulary (with readings,
  part-of-speech, JMdict IDs), grammar points (pattern, meaning, formation, notes,
  example sentences), and embedded Tatoeba example sentences.

OpenJLPT itself aggregates:

| Source | Used for | License |
| --- | --- | --- |
| Waller JLPT lists (tanos.co.uk) | JLPT level classification of kanji/vocabulary | CC BY |
| JMdict (EDRDG) | Vocabulary definitions, readings, POS | CC BY-SA |
| KANJIDIC2 (EDRDG) | Kanji readings, stroke counts, radicals | CC BY-SA |
| Tatoeba | Example sentences (ja/en) | CC BY |

## Cross-check reference: KANJIDIC2 (EDRDG)

- URL: https://www.edrdg.org/kanjidic/kanjidic2.xml.gz
- License: CC BY-SA (Electronic Dictionary Research and Development Group)
- Used as a validation cross-reference: all 2,383 kanji readings in the app match
  KANJIDIC2; stroke counts were verified against it.

## JLPT level assignment

Levels follow OpenJLPT's classification, which is based on the commonly used Waller
JLPT lists. These are approximate, widely accepted study targets — NOT official
JLPT-published counts. Actual cumulative kanji counts in this app: N5 84, N4 253,
N3 640, N2 1,038, N1 2,383.

## Generated content (no external dataset exists)

- `other.json` files: kana charts, numbers, counters, dates, time expressions,
  greetings, question words, basic patterns, verb/adjective conjugations, keigo,
  conjunctions, idioms, and formal patterns. These are standard textbook facts
  written for this app (not from a scraped source).

## Regeneration

- `scripts/generate-data.mjs` — rebuilds all kanji/vocabulary/grammar JSON from the
  OpenJLPT downloads in `scripts/downloads/`.
- `scripts/generate-other.mjs` — rebuilds the `other.json` files.
- `scripts/validate-data.mjs` — validates duplicates, readings, levels, placeholders,
  quiz compatibility, and cross-checks kanji fields against KANJIDIC2.
