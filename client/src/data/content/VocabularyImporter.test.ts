import { describe, expect, it } from "vitest";
import { importVocabularyPackage } from "./VocabularyImporter";

const licensedSource = {
  id: "source-test", name: "Original test content", url: "https://example.test/source", license: "MIT", attribution: "Original test content (MIT).", commercialUseAllowed: true,
};

const vocabulary = { id: "word-test", word: "Learn", meaning: "শেখা", definition: "To gain knowledge.", partOfSpeech: "verb", pronunciation: "/lɜːn/", example: "I learn every day.", level: "A1", sourceId: "source-test" };

describe("importVocabularyPackage", () => {
  it("normalizes an explicitly licensed record", () => {
    const result = importVocabularyPackage({ sources: [licensedSource], vocabulary: [vocabulary] });
    expect(result.report.imported).toBe(1);
    expect(result.vocabulary[0].lemma).toBe("learn");
    expect(result.vocabulary[0].commercialUseAllowed).toBe(true);
  });

  it("rejects a vocabulary record with no commercially permitted source", () => {
    const result = importVocabularyPackage({ vocabulary: [vocabulary] });
    expect(result.report.imported).toBe(0);
    expect(result.report.unlicensed).toBe(1);
  });

  it("detects duplicate lemmas inside an imported batch", () => {
    const result = importVocabularyPackage({ sources: [licensedSource], vocabulary: [vocabulary, { ...vocabulary, id: "word-test-2", word: "learn" }] });
    expect(result.report.imported).toBe(1);
    expect(result.report.duplicates).toBe(1);
  });
});
