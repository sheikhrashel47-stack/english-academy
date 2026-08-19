import { AppError } from "@/core/errors/AppError";
import { getCorrectAnswer } from "@/domain/practice/exerciseEngine";
import type { LearningSeed } from "@/domain/learning/types";

export function validateLearningSeed(seed: LearningSeed): void {
  const lessonIds = new Set(seed.lessons.map((lesson) => lesson.id));
  const vocabularyIds = new Set(seed.vocabulary.map((item) => item.id));
  const questionIds = new Set(seed.questions.map((question) => question.id));
  const everyEntity = [...seed.courses, ...seed.levels, ...seed.units, ...seed.lessons, ...seed.vocabulary, ...seed.questions, ...seed.grammarTopics];
  if (new Set(everyEntity.map((entity) => entity.id)).size !== everyEntity.length) throw new AppError("ContentError", "Content IDs must be globally stable and unique.");
  for (const lesson of seed.lessons) {
    if (lesson.blocks.some((block) => block.type === "question" && !questionIds.has(block.questionId))) throw new AppError("ContentError", `Lesson ${lesson.id} references an unknown question.`);
    if (lesson.blocks.some((block) => block.type === "mini-test" && block.questionIds.some((id) => !questionIds.has(id)))) throw new AppError("ContentError", `Lesson ${lesson.id} references an unknown mini-test question.`);
    if (lesson.vocabularyIds.some((id) => !vocabularyIds.has(id))) throw new AppError("ContentError", `Lesson ${lesson.id} references unknown vocabulary.`);
  }
  for (const question of seed.questions) {
    if (!lessonIds.has(question.lessonId)) throw new AppError("ContentError", `Question ${question.id} references an unknown lesson.`);
    if (question.type === "mcq" && !question.options.some((option) => option.id === question.correctOptionId)) throw new AppError("ContentError", `Question ${question.id} has no valid correct option.`);
    if (question.type !== "mcq" && !getCorrectAnswer(question)) throw new AppError("ContentError", `Question ${question.id} has no accepted answer.`);
  }
  if (seed.grammarTopics.some((topic) => !lessonIds.has(topic.lessonId))) throw new AppError("ContentError", "A grammar topic references an unknown lesson.");
}
