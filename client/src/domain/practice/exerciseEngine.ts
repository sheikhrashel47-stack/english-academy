import type { Question } from "@/domain/learning/types";

export type ExerciseResult = { isCorrect: boolean; explanation: string; correctOptionId: string };

export function validateAnswer(question: Question, selectedOptionId: string): ExerciseResult {
  return {
    isCorrect: question.correctOptionId === selectedOptionId,
    explanation: question.explanation,
    correctOptionId: question.correctOptionId,
  };
}

export function calculateScore(results: ExerciseResult[]): number {
  if (!results.length) return 0;
  return Math.round((results.filter((result) => result.isCorrect).length / results.length) * 100);
}
