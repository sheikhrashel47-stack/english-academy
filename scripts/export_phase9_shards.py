from __future__ import annotations

import json
import shutil
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INPUT = ROOT / "research/phase9-final-manifest.json"
OUT = ROOT / "client/public/data/phase9"

payload = json.loads(INPUT.read_text(encoding="utf-8"))
if payload.get("status") not in {"final-candidate", "published"}:
    raise RuntimeError(f"final manifest is not enriched: {payload.get('status')}")

categories = {category["id"]: category for category in payload["categories"]}
words_by_category = defaultdict(list)
sentences_by_word = defaultdict(list)
for sentence in payload["sentences"]:
    sentences_by_word[sentence["vocabularyId"]].append(sentence)
for word in payload["vocabulary"]:
    words_by_category[word["phase9PrimaryCategoryId"]].append({
        **word,
        "sentences": sorted(sentences_by_word[word["id"]], key=lambda item: item["exampleOrder"]),
    })

if len(words_by_category) != 200 or any(len(items) != 250 for items in words_by_category.values()):
    raise RuntimeError({"categoryCount": len(words_by_category), "sizes": sorted(set(map(len, words_by_category.values())))})
if any(len(item["sentences"]) != 3 for items in words_by_category.values() for item in items):
    raise RuntimeError("every word must have exactly 3 sentences")

if OUT.exists():
    shutil.rmtree(OUT)
(OUT / "categories").mkdir(parents=True)
index = {
    "contentVersion": payload["contentVersion"],
    "status": payload["status"],
    "counts": payload["counts"],
    "sources": payload["sources"],
    "categories": [],
}
for category_id, category in sorted(categories.items()):
    words = sorted(words_by_category[category_id], key=lambda item: (item.get("frequencyRank", 0), item["lemma"]))
    shard = {"category": category, "vocabulary": words}
    path = OUT / "categories" / f"{category['slug']}.json"
    path.write_text(json.dumps(shard, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    index["categories"].append({
        **category,
        "wordCount": len(words),
        "path": f"/data/phase9/categories/{category['slug']}.json",
    })
(OUT / "index.json").write_text(json.dumps(index, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
print(json.dumps({"output": str(OUT), "categoryShards": len(index["categories"]), "words": sum(x["wordCount"] for x in index["categories"])}, ensure_ascii=False, indent=2))
