export type Phase9Sentence = {
  id: string;
  vocabularyId: string;
  text: string;
  banglaTranslation?: string;
  exampleOrder: number;
};

export type Phase9CorpusWord = {
  id: string;
  word: string;
  lemma?: string;
  meaning: string;
  definition: string;
  partOfSpeech: string;
  level: string;
  synonyms: string[];
  antonyms: string[];
  example: string;
  phase9PrimaryCategoryId: string;
  sentences: Phase9Sentence[];
};

type Phase9Shard = {
  category: { id: string; slug: string };
  vocabulary: Phase9CorpusWord[];
};

const cache = new Map<string, Promise<Phase9Shard | null>>();

export function loadPhase9CategoryShard(slug: string): Promise<Phase9Shard | null> {
  const cached = cache.get(slug);
  if (cached) return cached;
  const request = fetch(`${import.meta.env.BASE_URL}data/phase9/categories/${slug}.json`)
    .then((response) => response.ok ? response.json() as Promise<Phase9Shard> : null)
    .catch(() => null);
  cache.set(slug, request);
  return request;
}
