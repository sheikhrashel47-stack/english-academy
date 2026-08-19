from __future__ import annotations

import json
import re
from collections import Counter, defaultdict
from pathlib import Path

from wordfreq import zipf_frequency

ROOT = Path(__file__).resolve().parents[1]
DICT = ROOT / "research/vendor/wordnet/dict"
EXISTING = ROOT / "phase3-corpus-audit.json"
SEED = ROOT / "client/src/data/content/phase9CategorySeed.ts"
OUT = ROOT / "research/phase9-base-manifest.json"
WORD_RE = re.compile(r"^[a-z][a-z'-]{1,30}$")
TRIPLE_RE = re.compile(r'\["([^"]+)",\s*"([^"]*)",\s*"([^"]+)"\]')
FAMILY_RE = re.compile(r'\{ family: "([^"]+)".*?entries:', re.S)


def normalize(value: str) -> str:
    return value.strip().lower().replace("’", "'")


def parse_categories() -> list[dict]:
    text = SEED.read_text(encoding="utf-8")
    families = FAMILY_RE.findall(text)
    entries = TRIPLE_RE.findall(text)
    if len(families) != 20 or len(entries) != 200:
        raise RuntimeError(f"Expected 20 families/200 entries, got {len(families)}/{len(entries)}")
    categories = []
    for index, (title, bangla, topic) in enumerate(entries):
        family = families[index // 10]
        slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
        categories.append({
            "id": f"phase9-category-{index // 10 + 1}-{index % 10 + 1}",
            "slug": f"{slug}-{index // 10 + 1}-{index % 10 + 1}",
            "family": family,
            "title": title,
            "banglaTitle": bangla,
            "topic": topic,
            "targetWordCount": 250,
            "primaryWordCount": 0,
        })
    return categories


def load_existing() -> dict[str, dict]:
    data = json.loads(EXISTING.read_text(encoding="utf-8"))
    result = {}
    for item in data.get("vocabulary", []):
        lemma = normalize(item.get("lemma") or item.get("word") or "")
        if WORD_RE.fullmatch(lemma) and lemma not in result:
            result[lemma] = item
    return result


def parse_wordnet() -> tuple[dict[tuple[str, str], dict], dict[str, list[tuple[str, str]]]]:
    synsets: dict[tuple[str, str], dict] = {}
    lemma_index: dict[str, list[tuple[str, str]]] = defaultdict(list)
    for pos in ("noun", "verb", "adj", "adv"):
        path = DICT / f"data.{pos}"
        for raw_line in path.read_text(encoding="utf-8", errors="replace").splitlines():
            if not raw_line or raw_line.startswith("  ") or " | " not in raw_line:
                continue
            header, gloss = raw_line.split(" | ", 1)
            tokens = header.split()
            offset, ss_pos = tokens[0], tokens[2]
            word_count = int(tokens[3], 16)
            cursor = 4
            lemmas = []
            for _ in range(word_count):
                lemmas.append(normalize(tokens[cursor].replace("_", " ")))
                cursor += 2
            pointer_count = int(tokens[cursor])
            cursor += 1
            pointers = []
            for _ in range(pointer_count):
                symbol, target_offset, target_pos, source_target = tokens[cursor:cursor + 4]
                pointers.append((symbol, target_offset, target_pos, source_target))
                cursor += 4
            key = (ss_pos, offset)
            synsets[key] = {
                "pos": ss_pos,
                "lemmas": lemmas,
                "gloss": gloss.strip(),
                "pointers": pointers,
                "lexname": pos,
            }
            for lemma in lemmas:
                if WORD_RE.fullmatch(lemma):
                    lemma_index[lemma].append(key)
    return synsets, lemma_index


def best_synset(synsets: dict, lemma_index: dict, word: str):
    keys = lemma_index.get(word, [])
    if not keys:
        return None
    return max(keys, key=lambda key: sum(zipf_frequency(x, "en") for x in synsets[key]["lemmas"]))


def relation_words(synsets: dict, synset_key, word: str) -> tuple[list[str], list[str]]:
    synset = synsets[synset_key]
    synonyms = [x for x in synset["lemmas"] if x != word and WORD_RE.fullmatch(x)]
    antonyms = []
    for symbol, offset, pos, _source_target in synset["pointers"]:
        if symbol != "!":
            continue
        target = synsets.get((pos, offset))
        if target:
            antonyms.extend(x for x in target["lemmas"] if x != word and WORD_RE.fullmatch(x))
    return sorted(set(synonyms))[:8], sorted(set(antonyms))[:8]


def category_score(category: dict, text: str) -> int:
    haystack = f" {text.lower()} "
    tokens = re.findall(r"[a-z]+", f"{category['family']} {category['title']} {category['topic']}")
    return sum(1 for token in set(tokens) if f" {token} " in haystack or token in haystack)


def main() -> None:
    synsets, lemma_index = parse_wordnet()
    existing = load_existing()
    categories = parse_categories()
    ranked = sorted(lemma_index, key=lambda w: (-zipf_frequency(w, "en"), w))

    selected: list[str] = []
    seen = set()
    for word in list(existing) + ranked:
        if word not in seen and WORD_RE.fullmatch(word) and word in lemma_index:
            seen.add(word)
            selected.append(word)
        if len(selected) == 50000:
            break
    if len(selected) != 50000:
        raise RuntimeError(f"Only {len(selected)} usable unique lemmas found")

    records = []
    category_texts = {}
    for word in selected:
        synset_key = best_synset(synsets, lemma_index, word)
        if synset_key is None:
            continue
        synset = synsets[synset_key]
        existing_item = existing.get(word, {})
        synonyms, antonyms = relation_words(synsets, synset_key, word)
        definition = existing_item.get("definition") or synset["gloss"]
        text = f"{word} {definition} {synset['lexname']} {' '.join(synset['lemmas'])}"
        category_texts[word] = text
        records.append({
            "id": f"phase9-vocab-{len(records)+1:05d}",
            "word": existing_item.get("word") or word,
            "lemma": word,
            "meaning": existing_item.get("meaning", ""),
            "definition": definition,
            "partOfSpeech": existing_item.get("partOfSpeech") or synset["pos"],
            "pronunciation": existing_item.get("pronunciation", ""),
            "ipa": existing_item.get("ipa"),
            "example": existing_item.get("example", ""),
            "topic": existing_item.get("topic", ""),
            "level": existing_item.get("level", "B1"),
            "difficulty": existing_item.get("difficulty", 3),
            "synonyms": synonyms,
            "antonyms": antonyms,
            "collocations": existing_item.get("collocations", []),
            "frequencyRank": len(records) + 1,
            "sourceId": "princeton-wordnet-3.0",
            "license": "WordNet-3.0",
            "licenseUrl": "https://wordnet.princeton.edu/license-and-commercial-use",
            "commercialUseAllowed": True,
            "attribution": "WordNet 3.0 Copyright 2006 by Princeton University.",
            "phase9ContentStatus": "base",
        })

    for record in records:
        text = category_texts[record["lemma"]]
        available = [c for c in categories if c["primaryWordCount"] < c["targetWordCount"]]
        scored = sorted(available, key=lambda c: (-category_score(c, text), c["primaryWordCount"], c["id"]))
        chosen = scored[0]
        chosen["primaryWordCount"] += 1
        record["phase9PrimaryCategoryId"] = chosen["id"]
        record["phase9PrimaryCategorySlug"] = chosen["slug"]

    if len(records) != 50000 or any(c["primaryWordCount"] != 250 for c in categories):
        raise RuntimeError({"records": len(records), "categoryCounts": Counter(c["primaryWordCount"] for c in categories)})

    payload = {
        "schemaVersion": 1,
        "contentVersion": "phase9-base-wordnet-50000-v1",
        "generatedAt": "2026-08-19",
        "status": "base-only-not-final",
        "targets": {"categories": 200, "words": 50000, "wordsPerCategory": 250, "sentencesPerWord": 3},
        "source": {"id": "princeton-wordnet-3.0", "license": "WordNet-3.0", "licenseUrl": "https://wordnet.princeton.edu/license-and-commercial-use", "commercialUseAllowed": True, "attribution": "WordNet 3.0 Copyright 2006 by Princeton University."},
        "categories": categories,
        "vocabulary": records,
    }
    OUT.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(json.dumps({
        "output": str(OUT),
        "words": len(records),
        "categories": len(categories),
        "withSynonyms": sum(bool(r["synonyms"]) for r in records),
        "withAntonyms": sum(bool(r["antonyms"]) for r in records),
        "withBanglaMeaning": sum(bool(r["meaning"]) for r in records),
        "withEnglishExample": sum(bool(r["example"]) for r in records),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
