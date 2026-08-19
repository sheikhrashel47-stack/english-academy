import fs from "node:fs";
import path from "node:path";

const root = path.resolve("client/public/data/phase9/categories");
const files = fs.readdirSync(root).filter((file) => file.endsWith(".json")).sort();
let words = 0;
let sentences = 0;
let bilingualSentences = 0;
let categories = 0;
const ids = new Set();
const sentenceIds = new Set();
const levels = new Map();
const errors = [];

for (const file of files) {
  const fullPath = path.join(root, file);
  const shard = JSON.parse(fs.readFileSync(fullPath, "utf8"));
  categories += 1;
  if (!shard.category?.id || !Array.isArray(shard.vocabulary)) errors.push(`${file}: invalid shard shape`);
  for (const word of shard.vocabulary ?? []) {
    words += 1;
    if (ids.has(word.id)) errors.push(`${file}: duplicate word id ${word.id}`);
    ids.add(word.id);
    levels.set(word.level, (levels.get(word.level) ?? 0) + 1);
    if (!Array.isArray(word.sentences)) errors.push(`${file}/${word.id}: sentences is not an array`);
    for (const sentence of word.sentences ?? []) {
      sentences += 1;
      if (sentence.banglaTranslation) bilingualSentences += 1;
      if (sentenceIds.has(sentence.id)) errors.push(`${file}: duplicate sentence id ${sentence.id}`);
      sentenceIds.add(sentence.id);
      if (!sentence.text || !sentence.banglaTranslation) errors.push(`${file}/${word.id}: missing bilingual sentence text`);
    }
  }
}

console.log(JSON.stringify({ categories, words, sentences, bilingualSentences, levels: Object.fromEntries(levels), errors: errors.slice(0, 20), errorCount: errors.length }, null, 2));
if (errors.length || words < 20000 || sentences < 30000 || bilingualSentences < 30000) process.exitCode = 1;
