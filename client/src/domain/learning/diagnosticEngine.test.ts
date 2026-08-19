import { describe, expect, it } from "vitest";
import { diagnosticQuestions, scoreDiagnostic } from "./diagnosticEngine";

describe("diagnosticEngine", () => {
  it("places a learner with no correct answers in Pre-A1", () => {
    const result = scoreDiagnostic({});
    expect(result.score).toBe(0);
    expect(result.suggestedLevel).toBe("Pre-A1");
    expect(result.focusSkill).toBe("vocabulary");
  });

  it("places a learner with every correct answer in B1", () => {
    const answers = Object.fromEntries(diagnosticQuestions.map((question) => [question.id, question.correctOptionId]));
    const result = scoreDiagnostic(answers);
    expect(result.score).toBe(100);
    expect(result.suggestedLevel).toBe("B1");
  });

  it("selects the lowest-scoring skill as the first focus", () => {
    const answers = Object.fromEntries(diagnosticQuestions.filter((question) => question.skill !== "grammar").map((question) => [question.id, question.correctOptionId]));
    const result = scoreDiagnostic(answers);
    expect(result.focusSkill).toBe("grammar");
    expect(result.skillScores.grammar).toEqual({ correct: 0, total: 3 });
  });
});
