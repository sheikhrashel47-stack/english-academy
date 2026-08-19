from __future__ import annotations

import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INPUT = ROOT / "research/phase9-base-manifest.json"
OUT = ROOT / "client/public/data/phase9"

payload = json.loads(INPUT.read_text(encoding="utf-8"))
categories = {category["id"]: category for category in payload["categories"]}
words_by_category = {category_id: [] for category_id in categories}
for word in payload["vocabulary"]:
    category_id = word["phase9PrimaryCategoryId"]
    if category_id not in words_by_category:
        raise RuntimeError(f"unknown category: {category_id}")
    words_by_category[category_id].append({
        **word,
        "sentences": [],
        "phase9ContentStatus": "base-only",
    })

if len(categories) != 200 or any(len(items) != 250 for items in words_by_category.values()):
    raise RuntimeError({"categories": len(categories), "sizes": sorted(set(map(len, words_by_category.values())))})

if OUT.exists():
    shutil.rmtree(OUT)
(OUT / "categories").mkdir(parents=True)
index = {
    "contentVersion": payload["contentVersion"],
    "status": "base-only-not-final",
    "counts": {
        "categories": len(categories),
        "vocabulary": len(payload["vocabulary"]),
        "uniqueLemmas": len({word["lemma"] for word in payload["vocabulary"]}),
        "sentences": 0,
        "sentencesPerWord": 0,
        "withBanglaMeaning": sum(bool(word.get("meaning")) for word in payload["vocabulary"]),
        "withSynonyms": sum(bool(word.get("synonyms")) for word in payload["vocabulary"]),
        "withAntonyms": sum(bool(word.get("antonyms")) for word in payload["vocabulary"]),
    },
    "sources": [payload["source"]],
    "categories": [],
}
for category_id, category in sorted(categories.items()):
    words = sorted(words_by_category[category_id], key=lambda item: (item.get("frequencyRank", 0), item["lemma"]))
    path = OUT / "categories" / f"{category['slug']}.json"
    path.write_text(json.dumps({"category": category, "vocabulary": words}, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    index["categories"].append({**category, "wordCount": len(words), "path": f"/data/phase9/categories/{category['slug']}.json"})
(OUT / "index.json").write_text(json.dumps(index, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
print(json.dumps({"output": str(OUT), "categoryShards": len(index["categories"]), **index["counts"]}, ensure_ascii=False, indent=2))
