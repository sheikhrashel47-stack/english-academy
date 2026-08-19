import { describe, expect, it } from "vitest";
import { validateLearningSeed } from "./ContentValidator";
import { phase0Seed } from "./phase0Seed";

describe("Phase 0 content validation", () => {
  it("accepts the versioned sample curriculum", () => {
    expect(() => validateLearningSeed(phase0Seed)).not.toThrow();
  });

  it("rejects a question whose correct option is absent", () => {
    const invalid = structuredClone(phase0Seed);
    invalid.questions[0].correctOptionId = "missing-option";
    expect(() => validateLearningSeed(invalid)).toThrow("has no valid correct option");
  });
});
