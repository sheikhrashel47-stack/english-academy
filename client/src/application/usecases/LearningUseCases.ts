/** Application layer: presentation code calls these use cases, never IndexedDB/repositories directly. */
import { learningRepository } from "@/data/repositories/LearningRepository";

export const learningUseCases = {
  initialize: () => learningRepository.seedIfNeeded(),
  getRoadmap: () => learningRepository.getRoadmap(),
  getCourseMap: (courseId: string) => learningRepository.getCourseMap(courseId),
  getUnit: (unitId: string) => learningRepository.getUnitBundle(unitId),
  getLesson: (lessonId: string) => learningRepository.getLessonBundle(lessonId),
  getVocabulary: () => learningRepository.getVocabulary(),
  getVocabularyEntries: () => learningRepository.getVocabularyEntries(),
  getGrammarTopics: () => learningRepository.getGrammarTopics(),
  getPracticeQuestions: (filters: { skill?: "grammar" | "vocabulary"; difficulty?: number; count: number }) => learningRepository.getPracticeQuestions(filters),
  getDueReviews: () => learningRepository.getDueReviewItems(),
  getMistakes: () => learningRepository.getMistakes(),
  getProgressSnapshot: () => learningRepository.getProgressSnapshot(),
  getSettings: () => learningRepository.getSettings(),
  updateSettings: (patch: Parameters<typeof learningRepository.updateSettings>[0]) => learningRepository.updateSettings(patch),
  recordFlashcardReview: (vocabularyId: string, rating: "again" | "hard" | "good" | "easy") => learningRepository.recordFlashcardReview(vocabularyId, rating),
  getWritingDraft: (promptId: string) => learningRepository.getWritingDraft(promptId),
  saveWritingDraft: (promptId: string, text: string, submitted?: boolean) => learningRepository.saveWritingDraft(promptId, text, submitted),
  submitAnswer: (questionId: string, userAnswer: string) => learningRepository.recordAnswer(questionId, userAnswer),
  exportUserData: () => learningRepository.exportUserData(),
  importUserData: (data: unknown) => learningRepository.importUserData(data),
  resetUserData: () => learningRepository.resetUserData(),
};
