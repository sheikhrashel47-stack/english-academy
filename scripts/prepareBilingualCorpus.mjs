import fs from "node:fs";
import path from "node:path";

const root = path.resolve("client/public/data/phase9/categories");
const outDir = path.resolve(".corpus-work");
fs.mkdirSync(outDir, { recursive: true });
const files = fs.readdirSync(root).filter((file) => file.endsWith(".json"));
const words = [];
for (const file of files) {
  const shard = JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
  for (const word of shard.vocabulary ?? []) {
    if (word.example && word.word && word.id) words.push({
      wordId: word.id,
      word: word.word,
      level: word.level,
      topic: word.topic,
      sourceExample: word.example,
    });
  }
}
words.sort((a, b) => (a.frequencyRank ?? Number.MAX_SAFE_INTEGER) - (b.frequencyRank ?? Number.MAX_SAFE_INTEGER) || a.wordId.localeCompare(b.wordId));
const selected = words.slice(0, 30000);
const groups = [];
const secondSentenceCount = Math.max(0, 30000 - selected.length);
const enriched = selected.map((item, index) => ({ ...item, sentenceCount: index < secondSentenceCount ? 2 : 1 }));
for (let i = 0; i < enriched.length; i += 50) groups.push({ batchId: `bilingual-${String(i / 50 + 1).padStart(4, "0")}`, items: enriched.slice(i, i + 50) });
fs.writeFileSync(path.join(outDir, "bilingual-input.json"), JSON.stringify(groups, null, 2));
fs.writeFileSync(path.join(outDir, "bilingual-manifest.json"), JSON.stringify({ generatedAt: new Date().toISOString(), source: "Phase 9 WordNet-derived shards", selectedWords: selected.length, batches: groups.length, batchSize: 50, targetSentenceCount: selected.length + secondSentenceCount, secondSentenceCount }, null, 2));
console.log(JSON.stringify({ totalWords: words.length, selectedWords: selected.length, batches: groups.length }, null, 2));
