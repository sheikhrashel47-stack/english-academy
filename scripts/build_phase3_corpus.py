#!/usr/bin/env python3
"""Build an auditable English Academy corpus from approved public sources.

Inputs stay outside the deployed app. The generated base package is reviewed,
translated and converted to a TypeScript seed in separate steps.
"""
from __future__ import annotations

import argparse
import csv
import json
import re
from collections import defaultdict
from pathlib import Path

from wordfreq import zipf_frequency

TIMESTAMP = "2026-08-19T00:00:00.000Z"
WORD_PATTERN = re.compile(r"^[a-z]+(?:'[a-z]+)?$")
SAFE_SENTENCE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9 ,;:'\"“”!?()\-—/]+[.!?…]$")
POS_LABELS = {"n": "noun", "v": "verb", "a": "adjective", "s": "adjective", "r": "adverb"}


def wordnet_sources(wordnet_root: Path) -> tuple[dict[str, str], dict[tuple[str, str], str]]:
    """Read WordNet 3.0 index and data files without copying non-selected records."""
    glosses: dict[tuple[str, str], str] = {}
    for pos, filename in {"n": "noun", "v": "verb", "a": "adj", "r": "adv"}.items():
        with (wordnet_root / "dict" / f"data.{filename}").open(encoding="utf-8") as handle:
            for line in handle:
                if line.startswith("  ") or " | " not in line:
                    continue
                offset = line[:8]
                gloss = line.split(" | ", 1)[1].strip()
                if gloss:
                    glosses[(pos, offset)] = gloss

    candidates: dict[str, list[tuple[str, str]]] = defaultdict(list)
    for pos, filename in {"n": "noun", "v": "verb", "a": "adj", "r": "adv"}.items():
        with (wordnet_root / "dict" / f"index.{filename}").open(encoding="utf-8") as handle:
            for line in handle:
                if line.startswith("  "):
                    continue
                columns = line.split()
                if len(columns) < 7:
                    continue
                lemma = columns[0].replace("_", " ").lower()
                if not WORD_PATTERN.fullmatch(lemma):
                    continue
                pointer_count = int(columns[3])
                offset_index = 6 + pointer_count
                if offset_index >= len(columns):
                    continue
                offset = columns[offset_index]
                if (pos, offset) in glosses:
                    candidates[lemma].append((pos, glosses[(pos, offset)]))
    return candidates, glosses


def level_for_rank(rank: int) -> str:
    if rank <= 1000:
        return "A1"
    if rank <= 3000:
        return "A2"
    if rank <= 6500:
        return "B1"
    if rank <= 11500:
        return "B2"
    if rank <= 17000:
        return "C1"
    return "C2"


def topic_for_pos(pos: str) -> str:
    return {"noun": "Ideas & things", "verb": "Actions", "adjective": "Description", "adverb": "Usage"}[pos]


def build_vocabulary(wordnet_root: Path, count: int) -> list[dict[str, object]]:
    candidates, _ = wordnet_sources(wordnet_root)
    ranked: list[tuple[float, str, list[tuple[str, str]]]] = []
    for lemma, entries in candidates.items():
        frequency = zipf_frequency(lemma, "en")
        if frequency < 2.15:
            continue
        ranked.append((frequency, lemma, entries))
    ranked.sort(key=lambda row: (-row[0], row[1]))
    if len(ranked) < count:
        raise RuntimeError(f"Only {len(ranked)} suitable WordNet lemmas found; need {count}.")

    output: list[dict[str, object]] = []
    for rank, (_, lemma, entries) in enumerate(ranked[:count], start=1):
        primary_pos, gloss = entries[0]
        part_of_speech = POS_LABELS.get(primary_pos, "noun")
        output.append({
            "id": f"wordnet-{lemma.replace("'", "-")}",
            "schemaVersion": 6,
            "createdAt": TIMESTAMP,
            "updatedAt": TIMESTAMP,
            "word": lemma,
            "lemma": lemma,
            "meaning": "",  # Filled only by the Bangla translation pass.
            "definition": gloss,
            "partOfSpeech": part_of_speech,
            "pronunciation": "",
            "example": "",  # Filled only by the original-example generation pass.
            "topic": topic_for_pos(part_of_speech),
            "level": level_for_rank(rank),
            "difficulty": 1 if rank <= 1000 else 2 if rank <= 3000 else 3 if rank <= 6500 else 4 if rank <= 11500 else 5,
            "synonyms": [],
            "antonyms": [],
            "collocations": [],
            "frequencyRank": rank,
            "sourceId": "princeton-wordnet-3.0",
            "license": "WordNet-3.0",
            "licenseUrl": "https://wordnet.princeton.edu/license-and-commercial-use",
            "commercialUseAllowed": True,
            "attribution": "WordNet 3.0 © 2006 Princeton University",
        })
    return output


def safe_sentence(text: str) -> bool:
    normalized = " ".join(text.split())
    if not (8 <= len(normalized) <= 220) or "http" in normalized.lower() or not SAFE_SENTENCE.fullmatch(normalized):
        return False
    alpha = sum(character.isalpha() for character in normalized)
    return alpha / max(1, len(normalized)) >= 0.45 and len(normalized.split()) >= 3


def build_sentences(detailed_csv: Path, count: int, vocabulary: list[dict[str, object]]) -> list[dict[str, object]]:
    """Select attributable sentences that maximise exact learner-lemma coverage first."""
    selected: list[tuple[str, str, str]] = []
    selected_ids: set[str] = set()
    target_lemmas = {str(item["lemma"]) for item in vocabulary}
    covered_lemmas: set[str] = set()

    # Pass one retains only rows that add learner-lemma coverage.
    with detailed_csv.open(encoding="utf-8", newline="") as handle:
        reader = csv.reader(handle, delimiter="\t")
        for row in reader:
            if len(row) < 4 or row[1] != "eng":
                continue
            sentence_id, _, text, owner = row[:4]
            normalized = " ".join(text.split())
            if not owner or owner == r"\N" or not safe_sentence(normalized):
                continue
            tokens = set(re.findall(r"[a-z]+(?:'[a-z]+)?", normalized.lower()))
            covered = tokens & target_lemmas
            if covered - covered_lemmas:
                selected.append((sentence_id, normalized, owner))
                selected_ids.add(sentence_id)
                covered_lemmas.update(covered)

    # Pass two fills the target with unique, safe English sentences without
    # retaining the full Tatoeba export in process memory.
    seen_text: set[str] = {text.casefold() for _, text, _ in selected}
    with detailed_csv.open(encoding="utf-8", newline="") as handle:
        reader = csv.reader(handle, delimiter="\t")
        for row in reader:
            if len(selected) >= count:
                break
            if len(row) < 4 or row[1] != "eng":
                continue
            sentence_id, _, text, owner = row[:4]
            normalized = " ".join(text.split())
            key = normalized.casefold()
            if sentence_id in selected_ids or not owner or owner == r"\N" or key in seen_text or not safe_sentence(normalized):
                continue
            selected.append((sentence_id, normalized, owner))
            selected_ids.add(sentence_id)
            seen_text.add(key)
    if len(selected) < count:
        raise RuntimeError(f"Only {len(selected)} safe, attributable English sentences found; need {count}.")

    sentences: list[dict[str, object]] = []
    for sentence_id, normalized, owner in selected[:count]:
        sentences.append({
                "id": f"tatoeba-{sentence_id}",
                "schemaVersion": 6,
                "createdAt": TIMESTAMP,
                "updatedAt": TIMESTAMP,
                "text": normalized,
                "language": "en",
                "sourceId": "tatoeba-cc-by-2-fr",
                "license": "CC-BY-2.0-FR",
                "licenseUrl": "https://creativecommons.org/licenses/by/2.0/fr/deed.en",
                "commercialUseAllowed": True,
                "attribution": f"Tatoeba sentence {sentence_id} by {owner}, CC BY 2.0 FR",
            })
    print(f"Selected {len(sentences)} sentences covering {len(covered_lemmas)} of {len(target_lemmas)} learner lemmas.")
    return sentences


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--wordnet", type=Path, required=True)
    parser.add_argument("--sentences", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--vocabulary-count", type=int, default=20500)
    parser.add_argument("--sentence-count", type=int, default=50000)
    arguments = parser.parse_args()

    wordnet_notice = (arguments.wordnet / "LICENSE").read_text(encoding="utf-8").strip()
    vocabulary = build_vocabulary(arguments.wordnet, arguments.vocabulary_count)
    package = {
        "sources": [
            {
                "id": "princeton-wordnet-3.0",
                "schemaVersion": 6,
                "createdAt": TIMESTAMP,
                "updatedAt": TIMESTAMP,
                "name": "Princeton WordNet 3.0",
                "url": "https://wordnet.princeton.edu/",
                "license": "WordNet-3.0",
                "licenseUrl": "https://wordnet.princeton.edu/license-and-commercial-use",
                "commercialUseAllowed": True,
                "attribution": "WordNet 3.0 © 2006 Princeton University. All rights reserved.",
                "dataVersion": "3.0",
                "notice": wordnet_notice,
            },
            {
                "id": "tatoeba-cc-by-2-fr",
                "schemaVersion": 6,
                "createdAt": TIMESTAMP,
                "updatedAt": TIMESTAMP,
                "name": "Tatoeba detailed sentence export",
                "url": "https://tatoeba.org/en/downloads",
                "license": "CC-BY-2.0-FR",
                "licenseUrl": "https://creativecommons.org/licenses/by/2.0/fr/deed.en",
                "commercialUseAllowed": True,
                "attribution": "Tatoeba contributors; individual sentence creator attribution is preserved per record.",
                "dataVersion": "2026-08-15 export",
                "notice": "Tatoeba sentence records retain sentence ID, contributor username, license and source URL.",
            },
        ],
        "vocabulary": vocabulary,
        "sentences": build_sentences(arguments.sentences, arguments.sentence_count, vocabulary),
    }
    arguments.output.parent.mkdir(parents=True, exist_ok=True)
    arguments.output.write_text(json.dumps(package, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(json.dumps({"vocabulary": len(package["vocabulary"]), "sentences": len(package["sentences"]), "output": str(arguments.output)}))


if __name__ == "__main__":
    main()
