import { describe, expect, it } from "vitest";
import { phase6AssessmentBlueprints, phase6AssessmentQuestions } from "@/data/content/phase6AssessmentSeed";
import { estimatedPlacementLevel, scoreAssessment, selectAdaptiveQuestion, selectAssessmentQuestions } from "@/domain/learning/assessmentEngine";

describe("assessment engine", () => {
  const diagnostic = phase6AssessmentBlueprints.find((item) => item.id === "assessment-diagnostic")!;
  it("selects the same approved items in a deterministic order", () => {
    const first = selectAssessmentQuestions(diagnostic, phase6AssessmentQuestions, "fixed-seed");
    const second = selectAssessmentQuestions(diagnostic, phase6AssessmentQuestions, "fixed-seed");
    expect(first.warnings).toHaveLength(0);
    expect(first.selections).toEqual(second.selections);
    expect(new Set(first.selections.map((item) => item.questionId)).size).toBe(first.selections.length);
  });
  it("scores objective answers and never gives subjective items a fabricated score", () => {
    const mock = phase6AssessmentBlueprints.find((item) => item.id === "assessment-mock-foundation")!;
    const selected = selectAssessmentQuestions(mock, phase6AssessmentQuestions, "sample").selections;
    const inputs = selected.map((item) => {
      const question = phase6AssessmentQuestions.find((candidate) => candidate.id === item.questionId)!;
      return { questionId: question.id, sectionId: item.sectionId, selectedOptionId: question.correctOptionId, response: question.acceptedAnswers?.[0], answered: true };
    });
    const result = scoreAssessment(mock, selected, phase6AssessmentQuestions, inputs);
    expect(result.reviewStatus).toBe("manual-review");
    expect(result.manualReviewQuestionIds).toContain("aq-speaking-01");
    expect(result.score).toBeGreaterThan(70);
  });
  it("chooses a next adaptive objective item and maps score bands conservatively", () => {
    const next = selectAdaptiveQuestion(phase6AssessmentQuestions.filter((item) => item.skill === "grammar"), [{ questionId: "aq-grammar-01", isCorrect: true }]);
    expect(next?.id).not.toBe("aq-grammar-01");
    expect(estimatedPlacementLevel(34)).toBe("Pre-A1");
    expect(estimatedPlacementLevel(76)).toBe("B1");
  });
});
