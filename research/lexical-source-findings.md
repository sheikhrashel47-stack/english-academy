# Phase 9 lexical-source findings

## Existing project corpus

The repository manifest points to the public package `https://engacademy-5pvsk4cz.manus.space/manus-storage/english-academy-phase3-licensed-corpus_a1a62db5.json`. Direct audit on 2026-08-19 found 20,500 vocabulary records, 50,000 sentences, two source records, 20,500 unique non-empty lemmas, zero duplicate lemmas, 49,949 linked sentences, and zero sentence-level Bangla translations. All vocabulary records use `WordNet-3.0` with `commercialUseAllowed=true`; all sentence records use `CC-BY-2.0-FR` with `commercialUseAllowed=true`.

## Open Multilingual Wordnet

Source: [Open Multilingual Wordnet overview](https://omwn.org/).

The project states that OMW and its components are open and may be freely used, modified, and shared for any purpose. It describes a shared format linking wordnets and reports 60 wordnets in 49 languages on the overview page. The page says users should cite the original projects and the OMW aggregation/normalization work. OMW is a possible rights-safe lexical relation source, but the exact Bengali wordnet coverage and per-component attribution must be recorded before import.

## Kaikki / Wiktionary-derived data

Source: [Kaikki machine-readable dictionary index](https://kaikki.org/dictionary/index.html).

The page says its data is extracted from Wiktionary and updated regularly. It lists English at 1,780,480 senses and Bengali at 15,641 senses on the observed page. It states that the data is made available under the same licenses as Wiktionary: CC-BY-SA and GFDL, with attribution and license obligations. Kaikki can provide a large lexical source, but the app must carry proper attribution and comply with share-alike/GFDL obligations; it should not be silently mixed into the existing WordNet-only source record.

## Decision

The current package does not contain the requested 50,000 words, synonym/antonym fields for all words, or bilingual examples. It contains 20,500 words and 50,000 English sentences. The next implementation step must either (a) import a documented open lexical source with its license metadata and generate/validate missing pedagogical fields transparently, or (b) obtain a user-provided licensed 50,000-word dataset. Counts must be read from the actual imported package rather than hard-coded UI copy.

## Princeton WordNet and WordFreq

Source: [Princeton WordNet license and commercial use](https://wordnet.princeton.edu/license-and-commercial-use).

Princeton states that WordNet is unencumbered for commercial applications under its license. The WordNet 3.0 license permits use, copying, modification and distribution for any purpose without fee or royalty, provided the copyright notice, statements and disclaimer appear on all copies and modifications, and Princeton's name is not used in advertising. The project must preserve the license notice in the shipped corpus metadata.

Source: [rspeer/wordfreq](https://github.com/rspeer/wordfreq).

The official repository describes WordFreq as a Python library with frequency estimates based on multiple sources, with small lists covering words appearing at least once per million words and large lists covering words appearing at least once per 100 million words. The repository is MIT/Apache-licensed according to its license history and current packaging metadata; the exact bundled data attribution must be retained. It is suitable for selecting common educational lemmas, but it is a frequency ranking source rather than a definition or translation source.

## Current content gap

The existing 20,500-word package has 20,500 Bangla meanings, definitions and English examples, but zero synonym edges and zero antonym edges. It uses only four topics (`Ideas & things`, `Description`, `Actions`, `Usage`). Therefore the requested Phase 9 expansion needs both a base-lexicon expansion and a new enrichment pass; it cannot be achieved by changing only the front-end count.
