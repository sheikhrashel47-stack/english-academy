/** Emerald Study House — large corpus boot manifest. Data remains outside the Vite bundle. */

export type ProductionCorpusAudit = {
  vocabularyCount: number;
  sentenceCount: number;
  banglaMeaningCount: number;
  attributedSentenceCount: number;
  linkedSentenceCount: number;
};

export type ProductionCorpusManifest = {
  url: string;
  version: string;
  expected: ProductionCorpusAudit;
};

/** Replaced with the immutable project-storage URL by the release preparation step. */
export const productionCorpusManifest: ProductionCorpusManifest = {
  url: "/manus-storage/english-academy-phase3-licensed-corpus_a1a62db5.json",
  version: "phase3.2-licensed-corpus",
  expected: {
    vocabularyCount: 20500,
    sentenceCount: 50000,
    banglaMeaningCount: 20500,
    attributedSentenceCount: 50000,
    linkedSentenceCount: 49949,
  },
};
