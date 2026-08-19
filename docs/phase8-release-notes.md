# Phase 8 — English Library, Reference Center & Resource System

## Release Scope

Phase 8 adds an **offline-first bilingual reference system** to English Academy. It introduces an English Library hub, a readable resource desk, category navigation, structured local search, saved references, personal notes, recent-resource history and a continuation strip for resources opened previously on the same device.

The system maintains the Emerald Study House language: Academy Emerald, mint paper surfaces, Manrope for interface hierarchy and Noto Sans Bengali for Bangla learning explanations. It deliberately avoids reward-style visual language, AI, chat, remote content fetching and external learner-data transmission.

## Content and Rights Boundary

The initial library catalogue includes original bilingual reference samples across the complete Phase 8 taxonomy: grammar, tenses, prepositions, irregular verbs, phrasal verbs, idioms, collocations, common errors, confusing words, word families, synonym/antonym, sentence patterns, useful phrases, pronunciation, IPA, writing, reading, listening, communication, English usage and quick reference.

Every seeded item carries immutable local source, attribution, rights and commercial-use metadata. The catalogue is a **scalable, rights-labelled reference foundation**, not a claim that the included samples constitute a complete dictionary, grammar book, corpus or audio library.

## Local Data Boundary

Library resources and search tokens are seeded into IndexedDB v10. Saved resources reuse the application’s local bookmark store. Notes, views, last-opened order, search history and reading continuation remain in the learner’s browser by default; they do not leave the device. A representative detail route is `/library/library-grammar-parts-of-speech`.

## Validation Record

| Check | Result |
|---|---|
| Static typing | Passed (`pnpm check`) |
| Automated regression | Passed: 11 test files, 30 tests (`pnpm test`) |
| GitHub Pages packaging | Passed (`GITHUB_ACTIONS=true pnpm build`) |
| Interface review | Desktop and 375px mobile inspections completed after the applied reference-ledger refinement |
| GitHub Pages publication | Corrected artifact published successfully; public fresh `/library` route verified with all 21 reference records |

## Interface Review Record

The final visual pass strengthened the **English Academy reference ledger** rather than introducing a separate catalogue aesthetic. Library cards now foreground the English learning object, then a calmer Bangla explanation, Academy Emerald focus edge, CEFR/time evidence and original-local provenance. The hub, saved list and detail reader each present a factual next action before secondary browsing; detail records also show a concise CEFR/provenance ledger. The Academy sidebar wordmark was refined into a compact editorial lockup to better match the reference workspace.

## Publication Verification Note

The initial Phase 8 GitHub Pages artifact deployment completed successfully, but a fresh production visit to `/library` remained at the local-index loading state. The local seed/read chain was diagnosed and corrected: the migration now avoids replaying the existing 20,000+ licensed vocabulary records, and a fresh development session completed the Phase 8 seed and rendered all 21 reference resources. The corrected build was published successfully through GitHub Pages Actions run [#32252720804](https://github.com/sheikhrashel47-stack/english-academy/actions/runs/32252720804). A new public visit to [`/library`](https://sheikhrashel47-stack.github.io/english-academy/library) rendered the full 21-item catalogue, all 17 category paths and the CEFR/local-provenance reference ledger.
