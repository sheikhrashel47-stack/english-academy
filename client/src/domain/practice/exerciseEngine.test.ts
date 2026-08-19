import { describe, expect, it } from "vitest";
import { calculateScore, getCorrectAnswer, validateAnswer } from "./exerciseEngine";
import type { FillBlankQuestion, McqQuestion, SentenceBuilderQuestion, VocabularyRecallQuestion } from "@/domain/learning/types";

const base = { id: "q", schemaVersion: 1, updatedAt: "2026-08-19", lessonId: "lesson", prompt: "Prompt", explanation: "Explanation", skill: "grammar" as const, difficulty: 1 as const, tags: [] };

describe("exercise engine", () => {
  it("validates MCQ, fill-blank, sentence-builder and vocabulary recall answers", () => {
    const mcq: McqQuestion = { ...base, type: "mcq", options: [{ id: "a", text: "Yes" }, { id: "b", text: "No" }], correctOptionId: "a" };
    const blank: FillBlankQuestion = { ...base, id: "blank", type: "fill-blank", acceptedAnswers: ["am"] };
    const sentence: SentenceBuilderQuestion = { ...base, id: "sentence", type: "sentence-builder", tokens: ["I", "am", "ready"], correctSentence: "I am ready." };
    const recall: VocabularyRecallQuestion = { ...base, id: "recall", type: "vocabulary-recall", word: "kind", vocabularyId: "v1", acceptedAnswers: ["দয়ালু", "দয়ালু"] };

    expect(validateAnswer(mcq, "a").isCorrect).toBe(true);
    expect(validateAnswer(blank, " AM ").isCorrect).toBe(true);
    expect(validateAnswer(sentence, "i  am ready").isCorrect).toBe(true);
    expect(validateAnswer(recall, "দয়ালু").isCorrect).toBe(true);
    expect(getCorrectAnswer(sentence)).toBe("I am ready.");
  });

  it("calculates percentage scores without dividing an empty result set", () => {
    expect(calculateScore([])).toBe(0);
    expect(calculateScore([{ isCorrect: true, explanation: "", correctAnswer: "" }, { isCorrect: false, explanation: "", correctAnswer: "" }, { isCorrect: true, explanation: "", correctAnswer: "" }])).toBe(67);
  });
});
