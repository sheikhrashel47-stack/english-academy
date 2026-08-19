# Phase 9 Content Contract

## Target coverage

Phase 9 targets **50,000 unique English lemmas** distributed across the existing 200-category master map. The allocation target is exactly **250 words per category**, while a word may carry secondary category tags when the lexical evidence supports more than one domain. The canonical unique key is the normalized lower-case lemma; inflectional duplicates and punctuation-only variants are rejected during ingestion.

| Entity | Required target | Canonical storage | Validation rule |
| --- | ---: | --- | --- |
| Category | 200 | `phase9CategorySeed.ts` | Every category has a stable slug and exactly 250 primary slots |
| Vocabulary word | 50,000 | `VocabularyItem` | Unique normalized lemma; no empty word or meaning |
| Synonym set | 50,000 records | `VocabularyItem.synonyms` | At least one important same-POS relation where WordNet/approved source supports it; otherwise explicit `[]` plus `relationStatus: unavailable` in audit output |
| Antonym set | 50,000 records | `VocabularyItem.antonyms` | Same rule as synonyms; no fabricated antonyms |
| Example sentences | 150,000 | `VocabularySentence` | Exactly three English sentences linked to each vocabulary id |
| Bangla translations | 150,000 | `VocabularySentence.banglaTranslation` | Non-empty natural translation for every shipped sentence |
| Rights/provenance | Every record | `VocabularySource` + item/sentence metadata | Source id, license, URL, attribution and commercial-use flag must be present |

## Existing TypeScript compatibility

The existing domain already supports `VocabularyItem.synonyms`, `VocabularyItem.antonyms`, and separate `VocabularySentence` records with `vocabularyId` and `banglaTranslation`. The base `example` field remains the first preview sentence for backward compatibility; the three canonical examples are stored as sentence records. No schema-breaking change is required for the first import. The import manifest must carry a `phase9ContentVersion`, source registry entries, and measured counts.

## Content quality rules

Words must be English lemmas suitable for a learner-facing vocabulary course. Proper names, URLs, isolated symbols, offensive slurs, malformed tokens, and entries whose only evidence is a spelling variant are excluded from the core 50,000. Synonyms and antonyms are relation-aware: they should match the source word's part of speech and sense whenever the source exposes that information. A missing relation is represented honestly as an empty list and is reported in the audit; it is never filled with a guessed opposite.

Each word receives three distinct English examples. The examples must use the target lemma in a natural grammatical context, avoid circular definitions, and remain short enough for mobile display. Each example receives a faithful Bengali translation. The examples are pedagogical content generated or curated under the project content license, and their provenance is recorded separately from WordNet definitions and relations.

## Source policy

The current 20,500-word package remains a separately attributable WordNet-3.0 source. Additional lexical candidates may be selected using an open frequency list, while definitions and relations must be taken from a separately documented lexical source. Bengali meanings and sentence translations must carry their own provenance metadata. The app must show source attribution in the About/Corpus panel and must not claim the 50,000 target until the import audit reports exactly 50,000 unique lemmas and 150,000 linked bilingual sentence records.

## Import acceptance gate

A release is accepted only when the audit reports: `uniqueLemmas === 50000`, `primaryCategorySlots === 50000`, `sentenceCount === 150000`, `sentencesPerWord.every(count === 3)`, zero duplicate normalized lemmas, zero orphan sentence links, zero missing required rights fields, and a generated manifest whose counts match the records actually shipped to the app. Any lower count is displayed as an explicit partial-coverage state.
