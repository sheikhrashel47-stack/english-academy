import { AppError } from "@/core/errors/AppError";
import { logger } from "@/core/services/logger";
import { phase0Seed } from "@/data/content/phase0Seed";
import { validateLearningSeed } from "@/data/content/ContentValidator";
import { englishAcademyDb, stores } from "@/data/indexeddb/EnglishAcademyDb";
import { IntervalReviewScheduler } from "@/domain/review/ReviewScheduler";
import type { Attempt, Lesson, MistakeRecord, Question, ReviewItem, UserLessonProgress, VocabularyItem } from "@/domain/learning/types";

const learnerId = "local-learner";
const settingsId = "app-settings";

export type LessonBundle = { lesson: Lesson; vocabulary: VocabularyItem[]; questions: Question[] };
export type AnswerRecord = { isCorrect: boolean; explanation: string; correctOptionId: string };

class LearningRepository {
  async seedIfNeeded(): Promise<void> {
    const settings = await englishAcademyDb.get<{ id: string; seedVersion?: string }>(stores.settings, settingsId);
    if (settings?.seedVersion === "phase0.1") return;
    validateLearningSeed(phase0Seed);
    await Promise.all([
      ...phase0Seed.courses.map((item) => englishAcademyDb.put(stores.courses, item)),
      ...phase0Seed.levels.map((item) => englishAcademyDb.put(stores.levels, item)),
      ...phase0Seed.units.map((item) => englishAcademyDb.put(stores.units, item)),
      ...phase0Seed.lessons.map((item) => englishAcademyDb.put(stores.lessons, item)),
      ...phase0Seed.vocabulary.map((item) => englishAcademyDb.put(stores.vocabulary, item)),
      ...phase0Seed.questions.map((item) => englishAcademyDb.put(stores.questions, item)),
      englishAcademyDb.put(stores.settings, { id: settingsId, schemaVersion: 1, updatedAt: new Date().toISOString(), theme: "light", seedVersion: "phase0.1" }),
    ]);
    logger.debug("seed-loaded", { version: "phase0.1" });
  }

  async getLessonBundle(lessonId: string): Promise<LessonBundle> {
    await this.seedIfNeeded();
    const lesson = await englishAcademyDb.get<Lesson>(stores.lessons, lessonId);
    if (!lesson) throw new AppError("ContentError", "পাঠটি খুঁজে পাওয়া যায়নি।");
    const [allVocabulary, allQuestions] = await Promise.all([englishAcademyDb.getAll<VocabularyItem>(stores.vocabulary), englishAcademyDb.getByIndex<Question>(stores.questions, "lessonId", lessonId)]);
    return { lesson, vocabulary: allVocabulary.filter((item) => lesson.vocabularyIds.includes(item.id)), questions: allQuestions };
  }

  async getRoadmap() {
    await this.seedIfNeeded();
    const [lessons, progress] = await Promise.all([englishAcademyDb.getAll<Lesson>(stores.lessons), englishAcademyDb.getAll<UserLessonProgress>(stores.progress)]);
    return lessons.sort((a, b) => a.order - b.order).map((lesson) => ({ lesson, progress: progress.find((item) => item.lessonId === lesson.id && item.userId === learnerId) }));
  }

  async getVocabulary(): Promise<VocabularyItem[]> {
    await this.seedIfNeeded();
    return (await englishAcademyDb.getAll<VocabularyItem>(stores.vocabulary)).sort((a, b) => a.word.localeCompare(b.word));
  }

  async getDueReviewItems(): Promise<ReviewItem[]> {
    await this.seedIfNeeded();
    const items = await englishAcademyDb.getAll<ReviewItem>(stores.reviewItems);
    return new IntervalReviewScheduler().getDueItems(items);
  }

  async recordAnswer(questionId: string, selectedOptionId: string): Promise<AnswerRecord> {
    await this.seedIfNeeded();
    const question = await englishAcademyDb.get<Question>(stores.questions, questionId);
    if (!question) throw new AppError("ContentError", "প্রশ্নটি খুঁজে পাওয়া যায়নি।");
    const isCorrect = question.correctOptionId === selectedOptionId;
    const timestamp = new Date().toISOString();
    const attempt: Attempt = { id: `attempt-${crypto.randomUUID()}`, schemaVersion: 1, updatedAt: timestamp, userId: learnerId, questionId, lessonId: question.lessonId, selectedOptionId, isCorrect, submittedAt: timestamp };
    const existing = (await englishAcademyDb.getByIndex<UserLessonProgress>(stores.progress, "userLesson", [learnerId, question.lessonId]))[0];
    const progress: UserLessonProgress = {
      id: existing?.id ?? `progress-${learnerId}-${question.lessonId}`,
      schemaVersion: 1,
      updatedAt: timestamp,
      userId: learnerId,
      lessonId: question.lessonId,
      completed: isCorrect || existing?.completed || false,
      completedAt: isCorrect ? timestamp : existing?.completedAt,
      lastPosition: 0,
      correctCount: (existing?.correctCount ?? 0) + (isCorrect ? 1 : 0),
      wrongCount: (existing?.wrongCount ?? 0) + (isCorrect ? 0 : 1),
      timeSpentSeconds: existing?.timeSpentSeconds ?? 0,
    };
    await Promise.all([englishAcademyDb.put(stores.attempts, attempt), englishAcademyDb.put(stores.progress, progress)]);

    const reviewId = `review-question-${questionId}`;
    const previousReview = await englishAcademyDb.get<ReviewItem>(stores.reviewItems, reviewId);
    const scheduler = new IntervalReviewScheduler();
    const reviewBase: ReviewItem = previousReview ?? { id: reviewId, schemaVersion: 1, updatedAt: timestamp, userId: learnerId, itemId: questionId, itemType: "question", masteryScore: 0, confidence: 0, attemptCount: 0, correctCount: 0, wrongCount: 0, nextReviewAt: timestamp, reviewLevel: 0 };
    const reviewed = isCorrect ? scheduler.recordSuccess(reviewBase) : scheduler.recordFailure(reviewBase);
    await englishAcademyDb.put(stores.reviewItems, { ...reviewed, updatedAt: timestamp, masteryScore: Math.round((reviewed.correctCount / Math.max(1, reviewed.attemptCount)) * 100) });

    if (!isCorrect) {
      const mistake: MistakeRecord = { id: `mistake-${crypto.randomUUID()}`, schemaVersion: 1, updatedAt: timestamp, userId: learnerId, questionId, selectedOptionId, correctOptionId: question.correctOptionId, reason: "ভুল উত্তর", timestamp, attemptCount: 1, resolved: false };
      await englishAcademyDb.put(stores.mistakes, mistake);
    }
    return { isCorrect, explanation: question.explanation, correctOptionId: question.correctOptionId };
  }
}

export const learningRepository = new LearningRepository();
