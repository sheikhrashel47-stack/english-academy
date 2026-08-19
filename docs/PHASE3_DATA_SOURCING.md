# Phase 3 Data-Sourcing Register

> **Status:** Candidate sources only. Nothing is eligible for publication until its current license, attribution terms, version, and field-level provenance are verified at import time.

| Candidate | Intended use | Reported license / condition | Publication decision |
|---|---|---|---|
| [wordfreq](https://github.com/rspeer/wordfreq) | Frequency-ranked English lemma inventory | The package is Apache-licensed, while included data also has source-specific conditions, including CC BY-SA 4.0 and SUBTLEX credit requirements | Candidate for frequency metadata only. The manifest must retain version, NOTICE text, upstream citations and all applicable attribution; do not flatten this into a single "Apache" claim. |
| [Tatoeba downloads](https://tatoeba.org/en/downloads) | Example sentences and optional translations | The official terms state that data is released under various Creative Commons licenses | Import only rows with a usable, explicit per-record license and required attribution. Audio remains a separately licensed asset class. |
| [Wiktionary copyright policy](https://en.wiktionary.org/wiki/Wiktionary:Copyrights) | Optional reference material | Entries are dual-licensed under CC BY-SA 4.0 / GFDL | Excluded from the default shipped corpus because share-alike and provenance obligations require a dedicated compliance review. |

## Guardrails

The production vocabulary importer must reject records when `commercialUseAllowed` is unknown, when `license` or `sourceId` is absent, or when required attribution text is not supplied. Multi-license source datasets must keep their source-specific attribution rather than being relabelled under the package's software license. The deployed application will ship only a small, clearly labelled demonstration set. Larger corpora are importable local data packages with a manifest, licensing metadata, hashes, and row-level source references.

## Capacity target

The engine must be benchmarked at **20,000+ vocabulary records** and **50,000+ sentence records** using a synthetic structural fixture or an externally licensed data package. A benchmark fixture is not learner-facing content and must never be represented as an authored educational corpus.
