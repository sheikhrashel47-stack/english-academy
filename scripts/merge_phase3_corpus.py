"""Merge approved source data into the production English Academy corpus package.

The package retains row-level source, licence and attribution data. It is intended
for upload to project storage, not for inclusion in the Vite bundle.
"""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path


TOKEN_PATTERN = re.compile(r"[a-z]+(?:'[a-z]+)?")


def required(value: object, label: str) -> None:
    if value in (None, "", False):
        raise ValueError(f"Missing required licence-aware field: {label}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", type=Path, required=True)
    parser.add_argument("--bangla", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    arguments = parser.parse_args()

    base = json.loads(arguments.base.read_text(encoding="utf-8"))
    meanings = {str(row["id"]): str(row["meaning"]).strip() for row in json.loads(arguments.bangla.read_text(encoding="utf-8"))}
    vocabulary = list(base["vocabulary"])
    sentences = list(base["sentences"])
    vocabulary_by_lemma = {str(row["lemma"]): row for row in vocabulary}
    first_sentence_for_word: dict[str, str] = {}

    for sentence in sentences:
        required(sentence.get("sourceId"), "sentence.sourceId")
        required(sentence.get("license"), "sentence.license")
        required(sentence.get("commercialUseAllowed"), "sentence.commercialUseAllowed")
        required(sentence.get("attribution"), "sentence.attribution")
        tokens = TOKEN_PATTERN.findall(str(sentence["text"]).lower())
        linked = next((vocabulary_by_lemma[token] for token in tokens if token in vocabulary_by_lemma), None)
        if linked:
            sentence["vocabularyId"] = linked["id"]
            first_sentence_for_word.setdefault(str(linked["id"]), str(sentence["text"]))

    for row in vocabulary:
        required(row.get("sourceId"), "vocabulary.sourceId")
        required(row.get("license"), "vocabulary.license")
        required(row.get("commercialUseAllowed"), "vocabulary.commercialUseAllowed")
        required(row.get("attribution"), "vocabulary.attribution")
        meaning = meanings.get(str(row["id"]), "")
        if not meaning:
            raise ValueError(f"Missing Bangla explanation for {row['id']}")
        row["meaning"] = meaning
        row["example"] = first_sentence_for_word.get(
            str(row["id"]),
            f"Use the word {row['word']} accurately when you write an English sentence.",
        )

    if len(vocabulary) < 20_000 or len(sentences) < 50_000:
        raise ValueError(f"Corpus target missed: {len(vocabulary)} vocabulary, {len(sentences)} sentences")

    package = {
        "schemaVersion": 1,
        "generatedAt": "2026-08-19T00:00:00.000Z",
        "sources": base["sources"],
        "vocabulary": vocabulary,
        "sentences": sentences,
        "audit": {
            "vocabularyCount": len(vocabulary),
            "sentenceCount": len(sentences),
            "banglaMeaningCount": sum(1 for row in vocabulary if row["meaning"]),
            "attributedSentenceCount": sum(1 for row in sentences if row.get("attribution")),
            "linkedSentenceCount": sum(1 for row in sentences if row.get("vocabularyId")),
        },
    }
    arguments.output.parent.mkdir(parents=True, exist_ok=True)
    arguments.output.write_text(json.dumps(package, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(json.dumps(package["audit"], ensure_ascii=False))


if __name__ == "__main__":
    main()
