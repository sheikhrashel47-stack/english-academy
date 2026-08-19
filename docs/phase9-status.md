# Phase 9 Vocabulary Corpus Status

**Status:** Base-only release prepared; bilingual enrichment is pending generation access.

The current Phase 9 release contains a rights-attributed base lexicon of **50,000 unique normalized English lemmas** distributed across **200 categories**, with exactly **250 words per category**. The category data is exported as 200 lazy-loadable JSON shards under `client/public/data/phase9/categories/`, with an index at `client/public/data/phase9/index.json`.

The base audit reports **30,083 words with WordNet-derived synonym relations**, **3,520 words with WordNet-derived antonym relations**, **20,397 words with an existing Bangla meaning**, and **20,397 words with an existing English example**. The base release has **0 duplicate normalized lemmas** and valid source-rights metadata. It is intentionally marked `base-only-not-final` because the requested three bilingual examples per word are not yet present.

The intended final enrichment contract is three examples per word, each with an English sentence and a natural Bangla translation, plus a Bengali meaning and curated synonym/antonym arrays. The resumable generator is `scripts/enrich_phase9_content.py`; generated batches are intentionally ignored by Git so that staging artifacts are not committed. Once generation access is available, rerun the generator from the repository root; it skips existing batch files and resumes from missing batches. Then run `scripts/merge_phase9_enrichment.py` followed by `scripts/export_phase9_shards.py` to produce the final shards.

The category desk route loads each shard lazily and currently displays the base vocabulary, available lexical relations, local mastery controls, and an explicit notice that bilingual examples are pending. It does not claim that the base-only corpus is the completed bilingual course.

## Validation snapshot

| Measure | Current value |
|---|---:|
| Categories | 200 |
| Words | 50,000 |
| Words per category | 250 |
| Unique normalized lemmas | 50,000 |
| Duplicate normalized lemmas | 0 |
| Words with synonyms | 30,083 |
| Words with antonyms | 3,520 |
| Words with Bangla meaning | 20,397 |
| Bilingual examples | 0 complete records |
| Category shards | 200 |
| Production build | Passed |
