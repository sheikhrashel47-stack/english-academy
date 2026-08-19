from __future__ import annotations

import argparse
import concurrent.futures as cf
import json
import os
import time
from pathlib import Path

from openai import OpenAI

ROOT = Path(__file__).resolve().parents[1]
INPUT = ROOT / "research/phase9-base-manifest.json"
OUT_DIR = ROOT / "research/phase9-enrichment-batches"
MODEL = "gpt-5-nano"

SCHEMA = {
    "type": "object",
    "properties": {
        "items": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "lemma": {"type": "string"},
                    "meaning_bn": {"type": "string"},
                    "synonyms": {"type": "array", "items": {"type": "string"}},
                    "antonyms": {"type": "array", "items": {"type": "string"}},
                    "examples": {
                        "type": "array",
                        "minItems": 3,
                        "maxItems": 3,
                        "items": {
                            "type": "object",
                            "properties": {"en": {"type": "string"}, "bn": {"type": "string"}},
                            "required": ["en", "bn"],
                            "additionalProperties": False,
                        },
                    },
                },
                "required": ["lemma", "meaning_bn", "synonyms", "antonyms", "examples"],
                "additionalProperties": False,
            },
        }
    },
    "required": ["items"],
    "additionalProperties": False,
}


def generate_batch(batch_id: int, records: list[dict]) -> Path:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out = OUT_DIR / f"batch-{batch_id:05d}.json"
    if out.exists():
        return out
    client = OpenAI(timeout=60.0, max_retries=0)
    compact = [
        {
            "lemma": r["lemma"],
            "partOfSpeech": r.get("partOfSpeech", ""),
            "definition": r.get("definition", ""),
            "existingMeaningBn": r.get("meaning", ""),
            "existingExampleEn": r.get("example", ""),
            "sourceSynonyms": r.get("synonyms", []),
            "sourceAntonyms": r.get("antonyms", []),
        }
        for r in records
    ]
    prompt = (
        "Create learner-safe English-to-Bengali vocabulary enrichment for every input item. "
        "Return exactly one output item per input lemma and preserve each lemma exactly. "
        "Use the supplied definition and part of speech to choose the most useful sense. "
        "Translate the meaning into natural standard Bangla, not transliteration. "
        "Keep only important same-part-of-speech synonyms and antonyms; never invent a relation, "
        "and use an empty array when no reliable relation is available. "
        "Write exactly three short, natural English example sentences using the target lemma, "
        "and provide a faithful Bangla translation for each. Do not mention that an AI generated them.\n\n"
        + json.dumps(compact, ensure_ascii=False)
    )
    last_error = None
    for attempt in range(4):
        try:
            response = client.chat.completions.create(
                model=(MODEL if attempt < 2 else "gpt-5-mini"),
                messages=[
                    {"role": "system", "content": "You are a careful bilingual lexicographer. Output JSON only."},
                    {"role": "user", "content": prompt},
                ],
                response_format={"type": "json_schema", "json_schema": {"name": "vocabulary_enrichment", "strict": True, "schema": SCHEMA}},
                max_completion_tokens=12000,
            )
            choice = response.choices[0]
            content = choice.message.content
            if not content:
                refusal = getattr(choice.message, "refusal", None)
                raise ValueError(f"empty model content finish={choice.finish_reason} refusal={refusal!r}")
            data = json.loads(content)
            if not isinstance(data, dict) or not isinstance(data.get("items"), list):
                raise ValueError(f"invalid structured response: {content[:120]!r}")
            if len(data["items"]) != len(records):
                raise ValueError(f"expected {len(records)} items, received {len(data['items'])}")
            expected = {r["lemma"] for r in records}
            actual = {x["lemma"] for x in data["items"]}
            if actual != expected:
                raise ValueError("lemma set mismatch")
            for item in data["items"]:
                if len(item["examples"]) != 3 or any(not x["en"].strip() or not x["bn"].strip() for x in item["examples"]):
                    raise ValueError(f"invalid examples for {item['lemma']}")
            out.write_text(json.dumps({"batchId": batch_id, "items": data["items"]}, ensure_ascii=False), encoding="utf-8")
            return out
        except Exception as exc:
            last_error = repr(exc)
            time.sleep(2 ** attempt)
    raise RuntimeError(f"batch {batch_id} failed: {last_error}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--start", type=int, default=0)
    parser.add_argument("--count", type=int, default=50000)
    parser.add_argument("--batch-size", type=int, default=20)
    parser.add_argument("--workers", type=int, default=6)
    args = parser.parse_args()
    data = json.loads(INPUT.read_text(encoding="utf-8"))
    records = data["vocabulary"][args.start:args.start + args.count]
    jobs = [(index // args.batch_size, records[index:index + args.batch_size]) for index in range(0, len(records), args.batch_size)]
    with cf.ThreadPoolExecutor(max_workers=args.workers) as executor:
        futures = [executor.submit(generate_batch, batch_id, group) for batch_id, group in jobs]
        completed = 0
        failures = 0
        for future in cf.as_completed(futures):
            try:
                path = future.result()
                completed += 1
                print(json.dumps({"completed": completed, "total": len(jobs), "file": str(path)}), flush=True)
            except Exception as exc:
                failures += 1
                print(json.dumps({"failed": failures, "total": len(jobs), "error": repr(exc)}), flush=True)
        if failures:
            raise SystemExit(f"{failures} batches failed; rerun to resume missing batches")


if __name__ == "__main__":
    main()
