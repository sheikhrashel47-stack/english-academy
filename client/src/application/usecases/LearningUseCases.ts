/** Application layer: presentation code calls these use cases, never IndexedDB/repositories directly. */
import { learningRepository } from "@/data/repositories/LearningRepository";

export const learningUseCases = {
  initialize: () => learningRepository.seedIfNeeded(),
  getRoadmap: () => learningRepository.getRoadmap(),
  getLesson: (lessonId: string) => learningRepository.getLessonBundle(lessonId),
  getVocabulary: () => learningRepository.getVocabulary(),
  getDueReviews: () => learningRepository.getDueReviewItems(),
  submitAnswer: (questionId: string, selectedOptionId: string) => learningRepository.recordAnswer(questionId, selectedOptionId),
};
