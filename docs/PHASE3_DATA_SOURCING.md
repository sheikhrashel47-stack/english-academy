# Phase 3 Data-Sourcing Register

> **Status:** Candidate sources only. Nothing is eligible for publication until its current license, attribution terms, version, and field-level provenance are verified at import time.

| Candidate | Intended use | Reported license / condition | Publication decision |
|---|---|---|---|
| [wordfreq](https://github.com/rspeer/wordfreq) | Frequency-ranked English lemma inventory | The package is Apache-licensed, while included data has source-specific conditions, including CC BY-SA-style attribution and SUBTLEX credit requirements; its README explicitly advises against CSV conversion. | **Excluded as a distributable vocabulary-list source.** It may be used only as a non-distributed local ranking reference; do not export a derived CSV from it. |
| [Princeton WordNet 3.0](https://wordnet.princeton.edu/license-and-commercial-use) | English lemma inventory, part of speech and short glosses | WordNet may be used, copied, modified and distributed for any purpose without fee or royalty, provided its copyright notice and disclaimer are retained. | **Approved.** A distributable vocabulary inventory will preserve the source version, license URL, copyright notice and required attribution in the registry and per record. |
| [Tatoeba downloads](https://tatoeba.org/en/downloads) | Example sentences and optional translations | The official corpus guide identifies default textual sentences as CC BY 2.0 FR, which permits reuse and modification with author attribution. | **Approved conditionally.** Import only English, learning-safe rows with usable author-level attribution; audio remains a separately licensed asset class. |
| [Wiktionary copyright policy](https://en.wiktionary.org/wiki/Wiktionary:Copyrights) | Optional reference material | Entries are dual-licensed under CC BY-SA 4.0 / GFDL | Excluded from the default shipped corpus because share-alike and provenance obligations require a dedicated compliance review. |

## Guardrails

The production vocabulary importer must reject records when `commercialUseAllowed` is unknown, when `license` or `sourceId` is absent, or when required attribution text is not supplied. Multi-license source datasets must keep their source-specific attribution rather than being relabelled under the package's software license. The deployed application will ship only a small, clearly labelled demonstration set. Larger corpora are importable local data packages with a manifest, licensing metadata, hashes, and row-level source references.

## Capacity target

The engine must be benchmarked at **20,000+ vocabulary records** and **50,000+ sentence records** using a synthetic structural fixture or an externally licensed data package. A benchmark fixture is not learner-facing content and must never be represented as an authored educational corpus.

## Official verification — 2026-08-19

The wordfreq README says its data combines multiple upstream datasets and has attribution conditions resembling CC BY-SA. It further says its data should not be converted to CSV because the format cannot preserve its licensing information. This prevents using it as the app's downloadable vocabulary inventory. [1]

Tatoeba's official corpus guide says its default textual-sentence license is **CC BY 2.0 FR**: reuse, modification and distribution are permitted when the sentence author is credited. The guide also recommends filtering for proofread material and identifies a large proofread English list, so imported records must retain `author`, source URL, license and attribution per sentence. [2]

## Revised acquisition rule

The 50,000-sentence goal will use Tatoeba only with attribution-preserving row metadata. The 20,000-word goal requires a separate export-permitted lexical source with field-level license evidence. No wordfreq CSV export will be created.

**Selected vocabulary path:** Princeton WordNet 3.0 provides enough English lemma coverage for a 20,000+ inventory and expressly permits commercial use, redistribution and modification when its copyright and disclaimer remain with each copy. It is the required attribution-preserving source for the learner-facing vocabulary corpus. [3]

## Acquisition manifest

| Dataset | Official archive | Fields used | Corpus rule |
|---|---|---|---|
| Princeton WordNet 3.0 | `https://wordnetcode.princeton.edu/3.0/WordNet-3.0.tar.gz` | lemma, part of speech, short gloss | Deduplicate normalized single-word English lemmas; preserve WordNet 3.0 notice and source URL in all derived records. |
| Tatoeba detailed sentences | `https://downloads.tatoeba.org/exports/sentences_detailed.tar.bz2` | sentence ID, language, text, owner ID, timestamps | Select English learning-safe records; join contributor data only when required author metadata exists. |
| Tatoeba users | `https://downloads.tatoeba.org/exports/users.csv` | user ID, username | Use only to form the required record-level sentence attribution. |

The current Tatoeba downloads page lists `sentences.tar.bz2`, `sentences_detailed.tar.bz2`, `sentences_base.tar.bz2`, `sentences_CC0.tar.bz2` and `users_sentences.csv`. The former guessed `sentences_detailed.csv.bz2` path is invalid and will not be used. [4]

## Bangla explanation generation (local build tool)

The reproducible corpus builder uses the local Apache-2.0-licensed [`shhossain/opus-mt-en-to-bn`](https://huggingface.co/shhossain/opus-mt-en-to-bn) model to produce concise English-to-Bangla study explanations. The model card identifies it as an English-to-Bangla model fine-tuned from `Helsinki-NLP/opus-mt-en-inc` and reports a 75.8M-parameter model. This generation step does not remove or replace the WordNet and Tatoeba source, license, attribution, or commercial-use fields retained on the deployed content records. [5]

## References

[1]: https://github.com/rspeer/wordfreq "wordfreq README and licensing notes"
[2]: https://en.wiki.tatoeba.org/articles/show/using-the-tatoeba-corpus "Using the Tatoeba Corpus for Your Own Projects"
[3]: https://wordnet.princeton.edu/license-and-commercial-use "Princeton WordNet License and Commercial Use"
[4]: https://tatoeba.org/en/downloads "Tatoeba Download Sentences"
[5]: https://huggingface.co/shhossain/opus-mt-en-to-bn "shhossain English-to-Bangla model card"
