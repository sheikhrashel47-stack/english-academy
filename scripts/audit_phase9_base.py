from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "research/phase9-base-manifest.json"
REPORT = ROOT / "research/phase9-base-audit.json"

obj = json.loads(MANIFEST.read_text(encoding="utf-8"))
words = obj["vocabulary"]
lemmas = [item.get("lemma", "").strip().lower() for item in words]
category_counts = Counter(item.get("phase9PrimaryCategoryId") for item in words)
source_ok = all(
    item.get("sourceId") == "princeton-wordnet-3.0"
    and item.get("license") == "WordNet-3.0"
    and item.get("commercialUseAllowed") is True
    and item.get("licenseUrl")
    for item in words
)
report = {
    "contentVersion": obj.get("contentVersion"),
    "status": obj.get("status"),
    "words": len(words),
    "uniqueNormalizedLemmas": len(set(lemmas)),
    "duplicateNormalizedLemmas": len(lemmas) - len(set(lemmas)),
    "categories": len(obj.get("categories", [])),
    "categoryCountDistribution": dict(Counter(category_counts.values())),
    "categoriesAtTarget": sum(value == 250 for value in category_counts.values()),
    "withSynonyms": sum(bool(item.get("synonyms")) for item in words),
    "withAntonyms": sum(bool(item.get("antonyms")) for item in words),
    "withBanglaMeaning": sum(bool(item.get("meaning")) for item in words),
    "withEnglishExample": sum(bool(item.get("example")) for item in words),
    "sourceRightsFieldsValid": source_ok,
    "acceptedBaseGate": len(words) == 50000 and len(set(lemmas)) == 50000 and len(obj.get("categories", [])) == 200 and all(value == 250 for value in category_counts.values()) and source_ok,
}
REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps(report, ensure_ascii=False, indent=2))
