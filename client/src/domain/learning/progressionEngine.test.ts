import { describe, expect, it } from "vitest";
import { isLessonComplete, isUnlocked, scoreForAttempts } from "./progressionEngine";
import type { Lesson } from "@/domain/learning/types";

const lesson: Lesson = {
  id: "lesson-sample",
  schemaVersion: 4,
  updatedAt: "2026-08-19T00:00:00.000Z",
  title: "Sample lesson",
  banglaTitle: "নমুনা পাঠ",
  unitId: "unit-sample",
  objectives: ["সম্পূর্ণতার নিয়ম পরীক্ষা করা"],
  skillFocus: ["vocabulary"],
  estimatedMinutes: 5,
  order: 1,
  vocabularyIds: [],
  questionIds: ["question-one", "question-two"],
  completionPolicy: { requiredQuestionIds: ["question-one", "question-two"], minimumScore: 100, allowSkip: false, allowTestOut: false },
  blocks: [],
};

describe("progressionEngine", () => {
  it("unlocks content only after every prerequisite is satisfied", () => {
    const state = { completedLessonIds: new Set(["lesson-one"]), completedUnitIds: new Set(["unit-one"]), completedLevelIds: new Set<string>() };
    expect(isUnlocked([{ kind: "lesson", id: "lesson-one" }, { kind: "unit", id: "unit-one" }], state)).toBe(true);
    expect(isUnlocked([{ kind: "level", id: "level-a1" }], state)).toBe(false);
  });

  it("requires all configured completion questions unless progress is already completed", () => {
    expect(isLessonComplete(lesson, undefined, new Set(["question-one"]))).toBe(false);
    expect(isLessonComplete(lesson, undefined, new Set(["question-one", "question-two"]))).toBe(true);
    expect(isLessonComplete(lesson, { id: "progress", schemaVersion: 4, updatedAt: "2026-08-19T00:00:00.000Z", userId: "learner", lessonId: lesson.id, completed: true, startedAt: "2026-08-19T00:00:00.000Z", lastPosition: 1, completedBlockIds: [], correctCount: 0, wrongCount: 0, timeSpentSeconds: 0, lastActivityAt: "2026-08-19T00:00:00.000Z" }, new Set())).toBe(true);
  });

  it("returns a factual rounded mastery score", () => {
    expect(scoreForAttempts(3, 1)).toBe(75);
    expect(scoreForAttempts(0, 0)).toBe(0);
  });
});
