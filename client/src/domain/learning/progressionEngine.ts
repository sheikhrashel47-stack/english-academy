import type { Lesson, Prerequisite, UserLessonProgress } from "@/domain/learning/types";

export type CompletionState = { completedLessonIds: Set<string>; completedUnitIds: Set<string>; completedLevelIds: Set<string> };

export function prerequisiteSatisfied(requirement: Prerequisite, state: CompletionState): boolean {
  if (requirement.kind === "lesson") return state.completedLessonIds.has(requirement.id);
  if (requirement.kind === "unit") return state.completedUnitIds.has(requirement.id);
  return state.completedLevelIds.has(requirement.id);
}

export function isUnlocked(prerequisites: Prerequisite[] | undefined, state: CompletionState): boolean {
  return (prerequisites ?? []).every((requirement) => prerequisiteSatisfied(requirement, state));
}

export function isLessonComplete(lesson: Lesson, progress: UserLessonProgress | undefined, answeredQuestionIds: Set<string>): boolean {
  if (progress?.completed) return true;
  const required = lesson.completionPolicy?.requiredQuestionIds ?? lesson.questionIds;
  return required.length > 0 && required.every((questionId) => answeredQuestionIds.has(questionId));
}

export function scoreForAttempts(correct: number, wrong: number): number {
  const total = correct + wrong;
  return total ? Math.round((correct / total) * 100) : 0;
}
