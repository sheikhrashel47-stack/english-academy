#!/usr/bin/env python3
"""Generate Bangla glossary explanations locally with an Apache-2.0 English→Bangla model."""
from __future__ import annotations

import argparse
import json
from pathlib import Path

import torch
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

MODEL_ID = "shhossain/opus-mt-en-to-bn"


def clean_translation(value: str) -> str:
    return " ".join(value.replace("▁", " ").split()).strip(" -:;,")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--batch-size", type=int, default=96)
    arguments = parser.parse_args()

    package = json.loads(arguments.input.read_text(encoding="utf-8"))
    completed: dict[str, dict[str, str]] = {}
    if arguments.output.exists():
        completed = {str(row["id"]): row for row in json.loads(arguments.output.read_text(encoding="utf-8"))}
    remaining = [item for item in package["vocabulary"] if item["id"] not in completed]
    print(f"Local model will translate {len(remaining)} remaining rows.", flush=True)

    tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
    model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_ID).to("cpu")
    model.eval()
    with torch.inference_mode():
        for offset in range(0, len(remaining), arguments.batch_size):
            batch = remaining[offset:offset + arguments.batch_size]
            prompts = [f"{item['word']}: {item['definition']}" for item in batch]
            encoded = tokenizer(prompts, return_tensors="pt", padding=True, truncation=True, max_length=96)
            generated = model.generate(**encoded, max_new_tokens=72, num_beams=2, early_stopping=True)
            translations = tokenizer.batch_decode(generated, skip_special_tokens=True)
            for item, translation in zip(batch, translations):
                meaning = clean_translation(translation)
                if not meaning:
                    raise RuntimeError(f"No Bangla output for {item['id']}")
                completed[str(item["id"])] = {"id": str(item["id"]), "meaning": meaning}
            arguments.output.write_text(json.dumps(list(completed.values()), ensure_ascii=False), encoding="utf-8")
            print(f"Completed {len(completed)}/{len(package['vocabulary'])} rows.", flush=True)


if __name__ == "__main__":
    main()
