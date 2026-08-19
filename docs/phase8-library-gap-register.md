# Phase 8 — English Library, Reference Center & Resource System

## Delivery intent

Phase 8 adds a **local, searchable reference library** to English Academy. The main course remains the teaching path; the Library is a Bangla-supported place to look up, compare, save, annotate and resume English reference material. This phase stops after the English Library release and does not begin Phase 9.

> **Hard boundary:** This release contains no AI, AI tutor, chatbot, external AI dependency, cloud sync, remote learner analytics, fabricated popularity data, fabricated ratings or official-certification claim.

## Reconciled architecture

| Requirement | Delivery decision |
|---|---|
| Expandable reference catalogue | Use versioned `LibraryResource`, `LibraryCategory` and `LibrarySource` records instead of hard-coded page content. Each record carries level, bilingual explanation, tags, related content and rights metadata. |
| Search without full-database scans | Build a local, tokenized search-document store with IndexedDB multi-entry indexes. Query resource tokens and existing vocabulary prefix indexes; return grouped, paginated results. |
| Existing learning content | Reuse the current vocabulary, grammar, phrases, lessons, audio metadata and skill activities through references, rather than duplicate their records. |
| Personal library work | Persist bookmarks, notes, viewed history, local search history, reading positions and usage signals locally. Existing bookmark/note contracts are extended only where necessary for library resources. |
| Copyright and source safety | Phase 8 seed content is original and explicitly marked as such. Non-original imports must provide creator, source, license, license URL, commercial-use permission and attribution before they can be accepted. |
| Language support | Every learner-facing reference record offers English, Bangla or mixed wording where appropriate and follows the existing language preference. |
| Media | No unlicensed audio, copied textbook, dictionary, article, video, podcast or worksheet is included. Audio-dependent references show an honest availability state and route to existing licensed browser-audio experiences when available. |

## Information architecture

The library will provide a hub, global search, type/category explorer, reference detail pages and a personal shelf. The data model supports grammar, tense, preposition, irregular-verb, phrasal-verb, idiom, collocation, common-error, confusing-word, word-family, synonym/antonym, sentence-pattern, useful-phrase, pronunciation/IPA, writing, reading, listening, communication and English-usage resources.

Each detail page presents a scan-friendly summary, bilingual explanation, examples, related records, source card and available quick actions. Long resources remember a local reading position. Rule-based recommendations may draw on locally recorded skill or grammar evidence; they never infer knowledge through an external service.

## Sample-content boundary

The Phase 8 catalogue proves all supported resource types with original, attribution-ready sample records and reusable schemas. It is **not** presented as a complete commercial dictionary, corpus, audio collection or replacement for copyrighted courseware. The existing 20,000+ vocabulary and 50,000 sentence corpus remain available through their dedicated learning surfaces and are linked where an indexed lookup is meaningful.

## Validation obligations

The final release must verify IndexedDB migration safety, tokenized English/Bangla/partial search, grouped results, category and level filters, bookmarks, notes, recent history, reading-position restore, keyboard and mobile navigation, source/import validation, offline local behavior, automated tests, a GitHub Pages production build and published-route checks.
