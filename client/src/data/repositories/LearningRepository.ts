import { AppError } from "@/core/errors/AppError";
import { logger } from "@/core/services/logger";
import { phase0Seed } from "@/data/content/phase0Seed";
import { validateLearningSeed } from "@/data/content/ContentValidator";
import { englishAcademyDb, stores } from "@/data/indexeddb/EnglishAcademyDb";
import { getCorrectAnswer, validateAnswer } from "@/domain/practice/exerciseEngine";
import { IntervalReviewScheduler } from "@/domain/review/ReviewScheduler";
import type { AppSettings, Attempt, GrammarTopic, Lesson, Level, MistakeRecord, Question, ReviewItem, Unit, UserLessonProgress, UserVocabularyProgress, VocabularyItem, WritingDraft } from "@/domain/learning/types";

const learnerId = "local-learner";
const settingsId = "app-settings";
const seedVersion = "phase1.0";

export type LessonBundle = { lesson: Lesson; vocabulary: VocabularyItem[]; questions: Question[] };
export type UnitBundle = { unit: Unit; level: Level; lessons: Lesson[] };
export type AnswerRecord = ReturnType<typeof validateAnswer>;
export type VocabularyEntry = { item: VocabularyItem; progress?: UserVocabularyProgress };
export type MistakeBundle = { record: MistakeRecord; question?: Question };

const defaultSettings = (): AppSettings => ({ id: settingsId, schemaVersion: 3, updatedAt: new Date().toISOString(), theme: "light", languageMode: "mixed", soundEnabled: true, animationsEnabled: true, reducedMotion: false, dailyGoalMinutes: 15, seedVersion });

class LearningRepository {
  async seedIfNeeded(): Promise<void> {
    const settings = await englishAcademyDb.get<AppSettings>(stores.settings, settingsId);
    if (settings?.seedVersion === seedVersion) return;
    validateLearningSeed(phase0Seed);
    await Promise.all([
      ...phase0Seed.courses.map((item) => englishAcademyDb.put(stores.courses, item)), ...phase0Seed.levels.map((item) => englishAcademyDb.put(stores.levels, item)),
      ...phase0Seed.units.map((item) => englishAcademyDb.put(stores.units, item)), ...phase0Seed.lessons.map((item) => englishAcademyDb.put(stores.lessons, item)),
      ...phase0Seed.vocabulary.map((item) => englishAcademyDb.put(stores.vocabulary, item)), ...phase0Seed.questions.map((item) => englishAcademyDb.put(stores.questions, item)),
      ...phase0Seed.grammarTopics.map((item) => englishAcademyDb.put(stores.grammarTopics, item)),
      englishAcademyDb.put(stores.settings, { ...(settings ?? defaultSettings()), seedVersion, updatedAt: new Date().toISOString() }),
    ]);
    logger.debug("seed-loaded", { version: seedVersion });
  }

  async getSettings(): Promise<AppSettings> {
    await this.seedIfNeeded();
    const saved = await englishAcademyDb.get<AppSettings>(stores.settings, settingsId);
    return { ...defaultSettings(), ...saved, id: settingsId };
  }
  async updateSettings(patch: Partial<Omit<AppSettings, "id" | "schemaVersion" | "updatedAt">>): Promise<AppSettings> { const current = await this.getSettings(); const next = { ...current, ...patch, updatedAt: new Date().toISOString() }; await englishAcademyDb.put(stores.settings, next); return next; }

  async getLessonBundle(lessonId: string): Promise<LessonBundle> {
    await this.seedIfNeeded(); const lesson = await englishAcademyDb.get<Lesson>(stores.lessons, lessonId);
    if (!lesson) throw new AppError("ContentError", "পাঠটি খুঁজে পাওয়া যায়নি।");
    const [allVocabulary, questions] = await Promise.all([englishAcademyDb.getAll<VocabularyItem>(stores.vocabulary), englishAcademyDb.getByIndex<Question>(stores.questions, "lessonId", lessonId)]);
    return { lesson, vocabulary: allVocabulary.filter((item) => lesson.vocabularyIds.includes(item.id)), questions };
  }

  async getRoadmap() {
    await this.seedIfNeeded(); const [lessons, progress] = await Promise.all([englishAcademyDb.getAll<Lesson>(stores.lessons), englishAcademyDb.getAll<UserLessonProgress>(stores.progress)]);
    return lessons.sort((a, b) => a.order - b.order).map((lesson) => ({ lesson, progress: progress.find((item) => item.lessonId === lesson.id && item.userId === learnerId) }));
  }

  async getCourseMap(courseId: string) {
    await this.seedIfNeeded(); const [levels, units, lessons] = await Promise.all([englishAcademyDb.getAll<Level>(stores.levels), englishAcademyDb.getAll<Unit>(stores.units), englishAcademyDb.getAll<Lesson>(stores.lessons)]);
    const courseLevels = levels.filter((level) => level.courseId === courseId).sort((a, b) => a.order - b.order);
    return courseLevels.map((level) => ({ level, units: units.filter((unit) => unit.levelId === level.id).sort((a, b) => a.order - b.order).map((unit) => ({ unit, lessons: lessons.filter((lesson) => lesson.unitId === unit.id).sort((a, b) => a.order - b.order) })) }));
  }

  async getUnitBundle(unitId: string): Promise<UnitBundle> {
    await this.seedIfNeeded(); const unit = await englishAcademyDb.get<Unit>(stores.units, unitId);
    if (!unit) throw new AppError("ContentError", "Unit খুঁজে পাওয়া যায়নি।");
    const [level, lessons] = await Promise.all([englishAcademyDb.get<Level>(stores.levels, unit.levelId), englishAcademyDb.getByIndex<Lesson>(stores.lessons, "unitId", unitId)]);
    if (!level) throw new AppError("ContentError", "Level খুঁজে পাওয়া যায়নি।");
    return { unit, level, lessons: lessons.sort((a, b) => a.order - b.order) };
  }

  async getGrammarTopics(): Promise<GrammarTopic[]> { await this.seedIfNeeded(); return (await englishAcademyDb.getAll<GrammarTopic>(stores.grammarTopics)).sort((a, b) => a.title.localeCompare(b.title)); }

  async getVocabulary(): Promise<VocabularyItem[]> { await this.seedIfNeeded(); return (await englishAcademyDb.getAll<VocabularyItem>(stores.vocabulary)).sort((a, b) => a.word.localeCompare(b.word)); }
  async getVocabularyEntries(): Promise<VocabularyEntry[]> {
    const [items, progress] = await Promise.all([this.getVocabulary(), englishAcademyDb.getAll<UserVocabularyProgress>(stores.vocabularyProgress)]);
    return items.map((item) => ({ item, progress: progress.find((record) => record.userId === learnerId && record.vocabularyId === item.id) }));
  }

  async getPracticeQuestions(filters: { skill?: "grammar" | "vocabulary"; difficulty?: number; count: number }): Promise<Question[]> {
    await this.seedIfNeeded(); const questions = await englishAcademyDb.getAll<Question>(stores.questions);
    return questions.filter((question) => (!filters.skill || question.skill === filters.skill) && (!filters.difficulty || question.difficulty === filters.difficulty)).sort(() => 0.5 - Math.random()).slice(0, filters.count);
  }

  async getDueReviewItems(): Promise<ReviewItem[]> { await this.seedIfNeeded(); return new IntervalReviewScheduler().getDueItems(await englishAcademyDb.getAll<ReviewItem>(stores.reviewItems)); }

  async recordAnswer(questionId: string, userAnswer: string): Promise<AnswerRecord> {
    await this.seedIfNeeded(); const question = await englishAcademyDb.get<Question>(stores.questions, questionId);
    if (!question) throw new AppError("ContentError", "প্রশ্নটি খুঁজে পাওয়া যায়নি।");
    const outcome = validateAnswer(question, userAnswer); const timestamp = new Date().toISOString();
    const attempt: Attempt = { id: `attempt-${crypto.randomUUID()}`, schemaVersion: 2, updatedAt: timestamp, userId: learnerId, questionId, lessonId: question.lessonId, questionType: question.type, userAnswer, isCorrect: outcome.isCorrect, submittedAt: timestamp };
    const existing = (await englishAcademyDb.getByIndex<UserLessonProgress>(stores.progress, "userLesson", [learnerId, question.lessonId]))[0];
    const progress: UserLessonProgress = { id: existing?.id ?? `progress-${learnerId}-${question.lessonId}`, schemaVersion: 2, updatedAt: timestamp, userId: learnerId, lessonId: question.lessonId, completed: outcome.isCorrect || existing?.completed || false, completedAt: outcome.isCorrect ? timestamp : existing?.completedAt, lastPosition: 0, correctCount: (existing?.correctCount ?? 0) + (outcome.isCorrect ? 1 : 0), wrongCount: (existing?.wrongCount ?? 0) + (outcome.isCorrect ? 0 : 1), timeSpentSeconds: existing?.timeSpentSeconds ?? 0 };
    const reviewId = `review-question-${questionId}`; const previousReview = await englishAcademyDb.get<ReviewItem>(stores.reviewItems, reviewId); const scheduler = new IntervalReviewScheduler();
    const reviewBase: ReviewItem = previousReview ?? { id: reviewId, schemaVersion: 2, updatedAt: timestamp, userId: learnerId, itemId: questionId, itemType: "question", masteryScore: 0, confidence: 0, attemptCount: 0, correctCount: 0, wrongCount: 0, nextReviewAt: timestamp, reviewLevel: 0 };
    const reviewed = outcome.isCorrect ? scheduler.recordSuccess(reviewBase) : scheduler.recordFailure(reviewBase);
    const writes: Promise<void>[] = [englishAcademyDb.put(stores.attempts, attempt), englishAcademyDb.put(stores.progress, progress), englishAcademyDb.put(stores.reviewItems, { ...reviewed, updatedAt: timestamp, masteryScore: Math.round((reviewed.correctCount / Math.max(1, reviewed.attemptCount)) * 100) }), this.updateSettings({ lastLessonId: question.lessonId }).then(() => undefined)];
    if (question.type === "vocabulary-recall") writes.push(this.recordVocabularyRecall(question.vocabularyId, outcome.isCorrect, timestamp));
    if (!outcome.isCorrect) writes.push(englishAcademyDb.put(stores.mistakes, { id: `mistake-${crypto.randomUUID()}`, schemaVersion: 2, updatedAt: timestamp, userId: learnerId, questionId, userAnswer, correctAnswer: getCorrectAnswer(question), reason: "ভুল উত্তর", timestamp, attemptCount: 1, resolved: false }));
    if (outcome.isCorrect) {
      const priorMistakes = await englishAcademyDb.getByIndex<MistakeRecord>(stores.mistakes, "userQuestion", [learnerId, questionId]);
      writes.push(...priorMistakes.filter((mistake) => !mistake.resolved).map((mistake) => englishAcademyDb.put(stores.mistakes, { ...mistake, resolved: true, updatedAt: timestamp })));
    }
    await Promise.all(writes); return outcome;
  }

  private async recordVocabularyRecall(vocabularyId: string, isCorrect: boolean, timestamp: string): Promise<void> {
    const existing = (await englishAcademyDb.getByIndex<UserVocabularyProgress>(stores.vocabularyProgress, "userVocabulary", [learnerId, vocabularyId]))[0];
    await englishAcademyDb.put(stores.vocabularyProgress, { id: existing?.id ?? `vocabulary-${learnerId}-${vocabularyId}`, schemaVersion: 2, updatedAt: timestamp, userId: learnerId, vocabularyId, learned: isCorrect || existing?.learned || false, recallCount: (existing?.recallCount ?? 0) + 1, correctCount: (existing?.correctCount ?? 0) + (isCorrect ? 1 : 0), wrongCount: (existing?.wrongCount ?? 0) + (isCorrect ? 0 : 1), lastReviewedAt: timestamp });
  }

  async recordFlashcardReview(vocabularyId: string, rating: "again" | "hard" | "good" | "easy"): Promise<void> {
    await this.seedIfNeeded();
    const timestamp = new Date().toISOString();
    const isCorrect = rating === "good" || rating === "easy";
    await this.recordVocabularyRecall(vocabularyId, isCorrect, timestamp);
    const reviewId = `review-vocabulary-${vocabularyId}`;
    const prior = await englishAcademyDb.get<ReviewItem>(stores.reviewItems, reviewId);
    const base: ReviewItem = prior ?? { id: reviewId, schemaVersion: 3, updatedAt: timestamp, userId: learnerId, itemId: vocabularyId, itemType: "vocabulary", masteryScore: 0, confidence: 0, attemptCount: 0, correctCount: 0, wrongCount: 0, nextReviewAt: timestamp, reviewLevel: 0 };
    const scheduler = new IntervalReviewScheduler();
    const reviewed = rating === "again" ? scheduler.recordFailure(base) : scheduler.recordSuccess(base);
    await englishAcademyDb.put(stores.reviewItems, { ...reviewed, updatedAt: timestamp, confidence: rating === "easy" ? 3 : rating === "good" ? 2 : rating === "hard" ? 1 : 0, masteryScore: Math.round((reviewed.correctCount / Math.max(1, reviewed.attemptCount)) * 100) });
  }

  async getWritingDraft(promptId: string): Promise<WritingDraft | undefined> {
    await this.seedIfNeeded();
    return (await englishAcademyDb.getByIndex<WritingDraft>(stores.writingDrafts, "userPrompt", [learnerId, promptId]))[0];
  }

  async saveWritingDraft(promptId: string, text: string, submitted = false): Promise<WritingDraft> {
    await this.seedIfNeeded();
    const timestamp = new Date().toISOString();
    const existing = await this.getWritingDraft(promptId);
    const draft: WritingDraft = { id: existing?.id ?? `draft-${learnerId}-${promptId}`, schemaVersion: 3, updatedAt: timestamp, userId: learnerId, promptId, text, submittedAt: submitted ? timestamp : existing?.submittedAt };
    await englishAcademyDb.put(stores.writingDrafts, draft);
    return draft;
  }

  async getMistakes(): Promise<MistakeBundle[]> { await this.seedIfNeeded(); const [records, questions] = await Promise.all([englishAcademyDb.getAll<MistakeRecord>(stores.mistakes), englishAcademyDb.getAll<Question>(stores.questions)]); return records.filter((record) => record.userId === learnerId && !record.resolved).sort((a, b) => b.timestamp.localeCompare(a.timestamp)).map((record) => ({ record, question: questions.find((question) => question.id === record.questionId) })); }
  async getProgressSnapshot() { await this.seedIfNeeded(); const [roadmap, vocabulary, mistakes, attempts] = await Promise.all([this.getRoadmap(), this.getVocabularyEntries(), this.getMistakes(), englishAcademyDb.getAll<Attempt>(stores.attempts)]); const completed = roadmap.filter((item) => item.progress?.completed).length; const learned = vocabulary.filter((entry) => entry.progress?.learned).length; const skills = (["grammar", "vocabulary", "reading", "listening", "speaking", "writing"] as const).map((skill) => { const relevant = attempts.filter((attempt) => attempt.userId === learnerId && phase0Seed.questions.find((question) => question.id === attempt.questionId)?.skill === skill); return { skill, attempts: relevant.length, correct: relevant.filter((attempt) => attempt.isCorrect).length }; }); return { completed, totalLessons: roadmap.length, learned, totalVocabulary: vocabulary.length, mistakes: mistakes.length, skills, lastLessonId: (await this.getSettings()).lastLessonId }; }

  async exportUserData() { await this.seedIfNeeded(); const [settings, progress, vocabularyProgress, attempts, mistakes, reviewItems, writingDrafts] = await Promise.all([this.getSettings(), englishAcademyDb.getAll<UserLessonProgress>(stores.progress), englishAcademyDb.getAll<UserVocabularyProgress>(stores.vocabularyProgress), englishAcademyDb.getAll<Attempt>(stores.attempts), englishAcademyDb.getAll<MistakeRecord>(stores.mistakes), englishAcademyDb.getAll<ReviewItem>(stores.reviewItems), englishAcademyDb.getAll<WritingDraft>(stores.writingDrafts)]); return { format: "english-academy-user-data", version: 2, exportedAt: new Date().toISOString(), settings, progress, vocabularyProgress, attempts, mistakes, reviewItems, writingDrafts }; }
  async importUserData(value: unknown): Promise<void> { const data = value as Record<string, unknown>; if (!data || data.format !== "english-academy-user-data" || !Array.isArray(data.progress)) throw new AppError("ContentError", "এই ফাইলটি English Academy backup নয়।"); await this.resetUserData(); const collections: Array<[typeof stores.progress | typeof stores.vocabularyProgress | typeof stores.attempts | typeof stores.mistakes | typeof stores.reviewItems | typeof stores.writingDrafts, unknown]> = [[stores.progress, data.progress], [stores.vocabularyProgress, data.vocabularyProgress], [stores.attempts, data.attempts], [stores.mistakes, data.mistakes], [stores.reviewItems, data.reviewItems], [stores.writingDrafts, data.writingDrafts]]; await Promise.all(collections.flatMap(([store, values]) => Array.isArray(values) ? values.map((item) => englishAcademyDb.put(store, item)) : [])); if (data.settings && typeof data.settings === "object") await englishAcademyDb.put(stores.settings, { ...defaultSettings(), ...(data.settings as AppSettings), id: settingsId, seedVersion }); }
  async resetUserData(): Promise<void> { await this.seedIfNeeded(); const settings = await this.getSettings(); await Promise.all([englishAcademyDb.clear(stores.progress), englishAcademyDb.clear(stores.vocabularyProgress), englishAcademyDb.clear(stores.attempts), englishAcademyDb.clear(stores.mistakes), englishAcademyDb.clear(stores.reviewItems), englishAcademyDb.clear(stores.writingDrafts), englishAcademyDb.put(stores.settings, { ...settings, lastLessonId: undefined, updatedAt: new Date().toISOString() })]); }
}

export const learningRepository = new LearningRepository();
