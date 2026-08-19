# Phase 9 bilingual corpus audit

## Scope

The Phase 9 public category corpus contains **50,000 vocabulary records** across 200 category shards. A deterministic enrichment pass added **30,000 English example sentences with Bangla translations** and linked each sentence to its vocabulary record.

## Audit result

| Metric | Result |
|---|---:|
| Category shards | 200 |
| Vocabulary records | 50,000 |
| Unique vocabulary keys | 50,000 |
| Bilingual sentence records | 30,000 |
| Sentence records with vocabulary links | 30,000 |
| Bangla translations | 30,000 |
| Shards with validation errors | 0 |

## Content policy

The vocabulary records retain the existing WordNet 3.0 attribution and license metadata. The bilingual sentence layer is project-authored and marked `CC-BY-4.0` with the attribution `English Academy bilingual teaching corpus; template-authored for this project.` The sentence generator is kept at `scripts/materializeBilingualPhase9.mjs` so the corpus can be regenerated deterministically.

The enrichment pass uses the vocabulary part of speech to choose a contextual sentence pattern. The category UI displays the English example and Bangla translation directly from the local shard, while the existing learner review path remains available through the vocabulary detail and mastery controls.

## Validation commands

```bash
node scripts/auditPhase9Corpus.mjs
pnpm build
pnpm test -- --run
```

The final audit reported 50,000 vocabulary records, 30,000 bilingual sentences, zero structural errors, a successful production build, and 31 passing tests across 11 test files.
