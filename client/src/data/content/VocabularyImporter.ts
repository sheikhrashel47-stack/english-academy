/** Emerald Study House / Phase 3: explicit-rights import boundary for offline vocabulary packages. */
import { AppError } from "@/core/errors/AppError";
import type { LevelCode, SupportedLicense, VocabularyItem, VocabularySentence, VocabularySource } from "@/domain/learning/types";

export type VocabularyImportReport = {
  received: number;
  imported: number;
  skipped: number;
  duplicates: number;
  invalid: number;
  unlicensed: number;
  messages: string[];
};

export type VocabularyImportBatch = { sources: VocabularySource[]; vocabulary: VocabularyItem[]; sentences: VocabularySentence[]; report: VocabularyImportReport };
type RawRow = Record<string, unknown>;

const now = () => new Date().toISOString();
const validLevels = new Set<LevelCode>(["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"]);
const defaultArrays = <T>(value: unknown): T[] => Array.isArray(value) ? value as T[] : [];
const truthy = (value: unknown) => value === true || value === "true" || value === "TRUE" || value === "1";
const text = (value: unknown) => typeof value === "string" ? value.trim() : "";

function parseCsv(input: string): RawRow[] {
  const rows: string[][] = [];
  let row: string[] = []; let cell = ""; let quoted = false;
  for (let index = 0; index < input.length; index += 1) {
    const char = input[index]; const next = input[index + 1];
    if (char === '"' && quoted && next === '"') { cell += '"'; index += 1; continue; }
    if (char === '"') { quoted = !quoted; continue; }
    if (char === "," && !quoted) { row.push(cell.trim()); cell = ""; continue; }
    if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell.trim()); cell = "";
      if (row.some(Boolean)) rows.push(row);
      row = [];
      continue;
    }
    cell += char;
  }
  row.push(cell.trim()); if (row.some(Boolean)) rows.push(row);
  if (rows.length < 2) return [];
  const [headers, ...values] = rows;
  return values.map((items) => Object.fromEntries(headers.map((header, index) => [header.trim(), items[index] ?? ""])));
}

function parseInput(input: unknown): { sources: RawRow[]; vocabulary: RawRow[]; sentences: RawRow[] } {
  if (Array.isArray(input)) return { sources: [], vocabulary: input as RawRow[], sentences: [] };
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) return { sources: [], vocabulary: [], sentences: [] };
    if (trimmed.startsWith("[") || trimmed.startsWith("{")) return parseInput(JSON.parse(trimmed));
    return { sources: [], vocabulary: parseCsv(trimmed), sentences: [] };
  }
  if (!input || typeof input !== "object") throw new AppError("ContentError", "Vocabulary import অবশ্যই JSON array, JSON package, অথবা CSV text হতে হবে।");
  const candidate = input as Record<string, unknown>;
  return {
    sources: defaultArrays<RawRow>(candidate.sources),
    vocabulary: defaultArrays<RawRow>(candidate.vocabulary ?? candidate.records),
    sentences: defaultArrays<RawRow>(candidate.sentences),
  };
}

function normalizeSource(row: RawRow): VocabularySource | undefined {
  const id = text(row.id); const name = text(row.name); const url = text(row.url); const license = text(row.license) as SupportedLicense;
  const attribution = text(row.attribution); const commercialUseAllowed = truthy(row.commercialUseAllowed);
  if (!id || !name || !url || !license || !attribution || !commercialUseAllowed) return undefined;
  return { id, schemaVersion: 5, createdAt: now(), updatedAt: now(), name, url, license, licenseUrl: text(row.licenseUrl) || undefined, commercialUseAllowed, attribution, dataVersion: text(row.dataVersion) || undefined, notice: text(row.notice) || undefined };
}

function normalizeVocabulary(row: RawRow, source: VocabularySource): VocabularyItem | undefined {
  const word = text(row.word); const lemma = (text(row.lemma) || word).toLocaleLowerCase("en-US"); const meaning = text(row.meaning);
  const definition = text(row.definition); const partOfSpeech = text(row.partOfSpeech); const example = text(row.example); const level = text(row.level) as LevelCode;
  if (!word || !lemma || !meaning || !definition || !partOfSpeech || !example || !validLevels.has(level)) return undefined;
  return {
    id: text(row.id) || `vocabulary-${lemma.replace(/[^a-z0-9]+/g, "-")}`,
    schemaVersion: 5, createdAt: now(), updatedAt: now(), word, lemma, meaning, definition, partOfSpeech,
    pronunciation: text(row.pronunciation) || text(row.ipa), ipa: text(row.ipa) || undefined, example,
    topic: text(row.topic) || "General", level, difficulty: Math.min(5, Math.max(1, Number(row.difficulty) || 1)) as 1 | 2 | 3 | 4 | 5,
    synonyms: defaultArrays<string>(row.synonyms), antonyms: defaultArrays<string>(row.antonyms), collocations: defaultArrays<string>(row.collocations),
    wordFamily: defaultArrays<{ word: string; partOfSpeech: string; meaning: string }>(row.wordFamily), phrasalVerbs: defaultArrays<{ phrase: string; meaning: string; example?: string }>(row.phrasalVerbs), idioms: defaultArrays<{ phrase: string; meaning: string; example?: string }>(row.idioms),
    frequencyRank: Number.isFinite(Number(row.frequencyRank)) ? Number(row.frequencyRank) : undefined,
    sourceId: source.id, license: source.license, licenseUrl: source.licenseUrl, commercialUseAllowed: source.commercialUseAllowed, attribution: source.attribution,
  };
}

function normalizeSentence(row: RawRow, sources: Map<string, VocabularySource>): VocabularySentence | undefined {
  const source = sources.get(text(row.sourceId)); const content = text(row.text); if (!source || !content || !source.commercialUseAllowed) return undefined;
  return { id: text(row.id) || `sentence-${crypto.randomUUID()}`, schemaVersion: 5, createdAt: now(), updatedAt: now(), vocabularyId: text(row.vocabularyId) || undefined, text: content, banglaTranslation: text(row.banglaTranslation) || undefined, language: "en", sourceId: source.id, license: source.license, licenseUrl: source.licenseUrl, commercialUseAllowed: source.commercialUseAllowed, attribution: source.attribution };
}

/** Rejects rows with unknown or non-commercial rights before any persistence is attempted. */
export function importVocabularyPackage(input: unknown, knownSources: VocabularySource[] = [], existingLemmas: Iterable<string> = []): VocabularyImportBatch {
  const parsed = parseInput(input); const report: VocabularyImportReport = { received: parsed.vocabulary.length, imported: 0, skipped: 0, duplicates: 0, invalid: 0, unlicensed: 0, messages: [] };
  const importedSources = parsed.sources.map(normalizeSource).filter((source): source is VocabularySource => Boolean(source));
  if (importedSources.length !== parsed.sources.length) report.messages.push("কিছু source record-এ required license, attribution বা commercial-use permission অনুপস্থিত ছিল।");
  const sourceMap = new Map([...knownSources, ...importedSources].map((source) => [source.id, source]));
  const lemmas = new Set(Array.from(existingLemmas, (lemma) => lemma.toLocaleLowerCase("en-US")));
  const vocabulary: VocabularyItem[] = [];
  for (const row of parsed.vocabulary) {
    const source = sourceMap.get(text(row.sourceId));
    if (!source || !source.commercialUseAllowed) { report.unlicensed += 1; report.skipped += 1; continue; }
    const item = normalizeVocabulary(row, source);
    if (!item) { report.invalid += 1; report.skipped += 1; continue; }
    if (lemmas.has(item.lemma!)) { report.duplicates += 1; report.skipped += 1; continue; }
    lemmas.add(item.lemma!); vocabulary.push(item); report.imported += 1;
  }
  const sentences: VocabularySentence[] = [];
  for (const row of parsed.sentences) {
    const sentence = normalizeSentence(row, sourceMap);
    if (!sentence) { report.unlicensed += 1; continue; }
    sentences.push(sentence);
  }
  if (report.unlicensed) report.messages.push(`${report.unlicensed}টি record explicit commercial-use permission না থাকায় গ্রহণ করা হয়নি।`);
  return { sources: importedSources, vocabulary, sentences, report };
}
