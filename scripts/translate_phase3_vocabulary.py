#!/usr/bin/env python3
"""Create concise Bangla meanings and original study examples for approved WordNet records."""
from __future__ import annotations

import argparse
import concurrent.futures
import json
import os
import time
from pathlib import Path

import requests

def request_batch(batch: list[dict[str, object]], model: str) -> list[dict[str, str]]:
    compact = [{"id": item["id"], "word": item["word"], "definition": item["definition"]} for item in batch]
    schema = {
        "name": "bangla_vocabulary_items",
        "strict": True,
        "schema": {
            "type": "object",
            "properties": {
                "items": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {"id": {"type": "string"}, "meaning": {"type": "string"}},
                        "required": ["id", "meaning"],
                        "additionalProperties": False,
                    },
                }
            },
            "required": ["items"],
            "additionalProperties": False,
        },
    }
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": "You create accurate study data for Bangladeshi adult English learners. Return JSON only."},
            {"role": "user", "content": "For every input, return exactly one concise, accurate standard-Bangla meaning (3–14 Bangla words). Do not omit or reorder IDs. Inputs:\n" + json.dumps(compact, ensure_ascii=False)},
        ],
        "response_format": {"type": "json_schema", "json_schema": schema},
        "max_completion_tokens": 1200,
        "reasoning": {"effort": "minimal"},
    }
    headers = {"Authorization": f"Bearer {os.environ['OPENAI_API_KEY']}", "Content-Type": "application/json"}
    endpoint = os.environ["OPENAI_API_BASE"].rstrip("/") + "/chat/completions"
    last_error: Exception | None = None
    for attempt in range(4):
        try:
            response = requests.post(endpoint, headers=headers, json=payload, timeout=150)
            response.raise_for_status()
            body = response.json()
            if not body.get("choices"):
                raise ValueError(f"Proxy returned no choices: {body.get('error', body)}")
            result = json.loads(body["choices"][0]["message"]["content"])["items"]
            expected = {str(item["id"]) for item in batch}
            received = {item["id"] for item in result}
            if expected != received:
                raise ValueError(f"ID mismatch: expected {len(expected)}, received {len(received)}")
            if any(not item["meaning"].strip() for item in result):
                raise ValueError("Blank translation output")
            return result
        except Exception as error:  # pragma: no cover - transient proxy failures are retried
            last_error = error
            time.sleep(2 ** attempt)
    raise RuntimeError(f"Batch translation failed: {last_error}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--workers", type=int, default=6)
    parser.add_argument("--batch-size", type=int, default=50)
    parser.add_argument("--model", default="gpt-5-nano")
    arguments = parser.parse_args()
    package = json.loads(arguments.input.read_text(encoding="utf-8"))
    vocabulary = package["vocabulary"]
    completed: dict[str, dict[str, str]] = {}
    if arguments.output.exists():
        completed = {row["id"]: row for row in json.loads(arguments.output.read_text(encoding="utf-8"))}
    remaining = [item for item in vocabulary if item["id"] not in completed]
    batches = [remaining[index:index + arguments.batch_size] for index in range(0, len(remaining), arguments.batch_size)]
    print(f"Translating {len(remaining)} vocabulary rows in {len(batches)} batches with {arguments.model}.")
    with concurrent.futures.ThreadPoolExecutor(max_workers=max(1, min(arguments.workers, 8))) as executor:
        futures = {executor.submit(request_batch, batch, arguments.model): index for index, batch in enumerate(batches)}
        for future in concurrent.futures.as_completed(futures):
            index = futures[future]
            for row in future.result():
                completed[row["id"]] = row
            arguments.output.write_text(json.dumps(list(completed.values()), ensure_ascii=False), encoding="utf-8")
            print(f"Completed batch {index + 1}/{len(batches)} ({len(completed)}/{len(vocabulary)} rows).", flush=True)
    if len(completed) != len(vocabulary):
        raise RuntimeError("Translation output is incomplete.")


if __name__ == "__main__":
    main()
