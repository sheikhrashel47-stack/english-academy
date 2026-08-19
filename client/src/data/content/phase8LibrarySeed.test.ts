import { describe, expect, it } from "vitest";
import { validateLibraryRecords } from "./ContentValidator";
import { phase8LibraryCategories, phase8LibraryResources, phase8OriginalLibrarySource } from "./phase8LibrarySeed";

describe("Phase 8 library seed", () => {
  it("covers every required reference surface with an original, attributable local record", () => {
    validateLibraryRecords(phase8OriginalLibrarySource, phase8LibraryCategories, phase8LibraryResources);
    const types = new Set(phase8LibraryResources.map((resource) => resource.type));
    ["grammar", "tense", "preposition", "irregular-verb", "phrasal-verb", "idiom", "collocation", "common-error", "confusing-word", "word-family", "synonym-antonym", "sentence-pattern", "useful-phrase", "pronunciation", "ipa", "writing", "reading", "listening", "communication", "english-usage", "quick-reference"].forEach((type) => expect(types.has(type as typeof phase8LibraryResources[number]["type"])).toBe(true));
  });

  it("precomputes English and Bangla search prefixes for offline indexed lookup", () => {
    const item = phase8LibraryResources.find((resource) => resource.id === "library-grammar-parts-of-speech")!;
    expect(item.searchTerms).toContain("part");
    expect(item.searchTerms).toContain("ব");
    expect(item.searchTerms).toContain("ব্যা");
  });
});
