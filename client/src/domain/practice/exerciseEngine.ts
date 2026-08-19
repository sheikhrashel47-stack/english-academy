import type { Question } from "@/domain/learning/types";

export type ExerciseResult = { isCorrect: boolean; explanation: string; correctAnswer: string; correctOptionId?: string };

const normalise = (value: string) => value.trim().toLocaleLowerCase().replace(/[.!?]+$/g, "").replace(/\s+/g, " ");

export function getCorrectAnswer(question: Question): string {
  if (question.type === "mcq") return question.options.find((option) => option.id === question.correctOptionId)?.text ?? "";
  if (question.type === "sentence-builder") return question.correctSentence;
  return question.acceptedAnswers[0] ?? "";
}

export function validateAnswer(question: Question, userAnswer: string): ExerciseResult {
  const answer = normalise(userAnswer);
  const isCorrect = question.type === "mcq"
    ? question.correctOptionId === userAnswer
    : question.type === "sentence-builder"
      ? normalise(question.correctSentence) === answer
      : question.acceptedAnswers.some((accepted) => normalise(accepted) === answer);
  return { isCorrect, explanation: question.explanation, correctAnswer: getCorrectAnswer(question), ...(question.type === "mcq" ? { correctOptionId: question.correctOptionId } : {}) };
}

export function calculateScore(results: ExerciseResult[]): number {
  if (!results.length) return 0;
  return Math.round((results.filter((result) => result.isCorrect).length / results.length) * 100);
}
