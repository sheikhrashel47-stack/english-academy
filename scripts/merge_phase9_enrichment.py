from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "research/phase9-base-manifest.json"
BATCH_DIR = ROOT / "research/phase9-enrichment-batches"
OUT = ROOT / "research/phase9-final-manifest.json"

base = json.loads(BASE.read_text(encoding="utf-8"))
batches = {}
for path in sorted(BATCH_DIR.glob("batch-*.json")):
    payload = json.loads(path.read_text(encoding="utf-8"))
    for item in payload["items"]:
        if item["lemma"] in batches:
            raise RuntimeError(f"duplicate enrichment lemma: {item['lemma']}")
        batches[item["lemma"]] = item

missing = [record["lemma"] for record in base["vocabulary"] if record["lemma"] not in batches]
if missing:
    raise RuntimeError(f"missing enrichment for {len(missing)} words; first={missing[:5]}")

vocabulary = []
sentences = []
for record in base["vocabulary"]:
    enriched = batches[record["lemma"]]
    examples = enriched["examples"]
    if len(examples) != 3:
        raise RuntimeError(f"expected 3 examples: {record['lemma']}")
    merged = dict(record)
    merged["meaning"] = enriched["meaning_bn"].strip()
    merged["synonyms"] = enriched["synonyms"]
    merged["antonyms"] = enriched["antonyms"]
    merged["example"] = examples[0]["en"].strip()
    merged["phase9ContentStatus"] = "enriched"
    vocabulary.append(merged)
    for index, example in enumerate(examples, 1):
        sentences.append({
            "id": f"phase9-sentence-{len(sentences)+1:06d}",
            "schemaVersion": 1,
            "createdAt": "2026-08-19T00:00:00.000Z",
            "updatedAt": "2026-08-19T00:00:00.000Z",
            "contentVersion": "phase9-bilingual-examples-v1",
            "status": "published",
            "vocabularyId": record["id"],
            "text": example["en"].strip(),
            "banglaTranslation": example["bn"].strip(),
            "language": "en",
            "sourceId": "english-academy-phase9-original-examples",
            "license": "Original",
            "licenseUrl": "https://github.com/sheikhrashel47-stack/english-academy",
            "commercialUseAllowed": True,
            "attribution": "Original instructional example prepared for English Academy Phase 9.",
            "exampleOrder": index,
        })

out = dict(base)
out["contentVersion"] = "phase9-bilingual-50000-v1"
out["status"] = "final-candidate"
out["vocabulary"] = vocabulary
out["sentences"] = sentences
out["sources"] = [
    base["source"],
    {
        "id": "english-academy-phase9-original-examples",
        "name": "English Academy Phase 9 original bilingual examples",
        "url": "https://github.com/sheikhrashel47-stack/english-academy",
        "license": "Original",
        "commercialUseAllowed": True,
        "attribution": "Original instructional example prepared for English Academy Phase 9.",
    },
]
out["counts"] = {
    "categories": len(out["categories"]),
    "vocabulary": len(vocabulary),
    "uniqueLemmas": len({item["lemma"] for item in vocabulary}),
    "sentences": len(sentences),
    "sentencesPerWord": 3,
    "withBanglaMeaning": sum(bool(item["meaning"]) for item in vocabulary),
    "withSynonyms": sum(bool(item["synonyms"]) for item in vocabulary),
    "withAntonyms": sum(bool(item["antonyms"]) for item in vocabulary),
}
OUT.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
print(json.dumps(out["counts"], ensure_ascii=False, indent=2))
