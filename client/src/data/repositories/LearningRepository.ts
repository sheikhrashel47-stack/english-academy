import { AppError } from "@/core/errors/AppError";
import { logger } from "@/core/services/logger";
import { importLearningSeed } from "@/data/content/ContentImporter";
import { phase2Seed } from "@/data/content/phase2Seed";
import { englishAcademyDb, stores } from "@/data/indexeddb/EnglishAcademyDb";
import { isUnlocked, scoreForAttempts, type CompletionState } from "@/domain/learning/progressionEngine";
import { getCorrectAnswer, validateAnswer } from "@/domain/practice/exerciseEngine";
import { IntervalReviewScheduler } from "@/domain/review/ReviewScheduler";
import type { AppSettings, Attempt, Bookmark, Chapter, GrammarTopic, Lesson, LearningSeed, LearningSession, MistakeRecord, ObjectiveProgress, PersonalNote, Question, ReviewItem, Skill, Unit, UserActivityProgress, UserLessonProgress, UserVocabularyProgress, VocabularyItem, WritingDraft } from "@/domain/learning/types";

const learnerId = "local-learner";
const settingsId = "app-settings";
const seedVersion = "phase2.0";
const timestamp = () => new Date().toISOString();

export type LessonBundle = { lesson: Lesson; vocabulary: VocabularyItem[]; questions: Question[]; progress?: UserLessonProgress; activityProgress: UserActivityProgress[]; bookmarked: boolean; note?: PersonalNote };
export type UnitBundle = { unit: Unit; level: import("@/domain/learning/types").Level; lessons: Lesson[]; chapters: Chapter[]; unlocked: boolean; completed: boolean };
export type AnswerRecord = ReturnType<typeof validateAnswer>;
export type VocabularyEntry = { item: VocabularyItem; progress?: UserVocabularyProgress };
export type MistakeBundle = { record: MistakeRecord; question?: Question };
export type RoadmapItem = { lesson: Lesson; progress?: UserLessonProgress; unlocked: boolean; completed: boolean; unitId: string; levelId: string };
export type LearningSummary = { totalLessons: number; completedLessons: number; timeSpentSeconds: number; practicedSkills: Skill[]; currentLevel?: import("@/domain/learning/types").Level; nextLesson?: RoadmapItem; completedAssessments: number; totalAssessments: number };

const defaultSettings = (): AppSettings => ({ id: settingsId, schemaVersion: 4, updatedAt: timestamp(), theme: "light", languageMode: "mixed", soundEnabled: true, animationsEnabled: true, reducedMotion: false, dailyGoalMinutes: 15, seedVersion });

class LearningRepository {
  async seedIfNeeded(): Promise<void> {
    const settings = await englishAcademyDb.get<AppSettings>(stores.settings, settingsId);
    if (settings?.seedVersion === seedVersion) return;
    await this.persistCurriculum(phase2Seed);
    await englishAcademyDb.put(stores.settings, { ...defaultSettings(), ...(settings ?? {}), id: settingsId, seedVersion, updatedAt: timestamp() });
    logger.debug("seed-loaded", { version: seedVersion });
  }

  async importCurriculum(input: unknown): Promise<void> {
    const seed = importLearningSeed(input);
    await this.persistCurriculum(seed);
  }

  private async persistCurriculum(seed: LearningSeed): Promise<void> {
    const writes = [
      ...seed.courses.map((item) => englishAcademyDb.put(stores.courses, item)), ...seed.levels.map((item) => englishAcademyDb.put(stores.levels, item)),
      ...seed.units.map((item) => englishAcademyDb.put(stores.units, item)), ...seed.chapters.map((item) => englishAcademyDb.put(stores.chapters, item)),
      ...seed.lessons.map((item) => englishAcademyDb.put(stores.lessons, item)), ...seed.vocabulary.map((item) => englishAcademyDb.put(stores.vocabulary, item)),
      ...seed.questions.map((item) => englishAcademyDb.put(stores.questions, item)), ...seed.grammarTopics.map((item) => englishAcademyDb.put(stores.grammarTopics, item)),
    ];
    await Promise.all(writes);
  }

  async getSettings(): Promise<AppSettings> { await this.seedIfNeeded(); const saved = await englishAcademyDb.get<AppSettings>(stores.settings, settingsId); return { ...defaultSettings(), ...saved, id: settingsId }; }
  async updateSettings(patch: Partial<Omit<AppSettings, "id" | "schemaVersion" | "updatedAt">>): Promise<AppSettings> { const current = await this.getSettings(); const next = { ...current, ...patch, updatedAt: timestamp() }; await englishAcademyDb.put(stores.settings, next); return next; }

  private async getCurriculum() {
    await this.seedIfNeeded();
    const [courses, levels, units, chapters, lessons, progress] = await Promise.all([
      englishAcademyDb.getAll<import("@/domain/learning/types").Course>(stores.courses), englishAcademyDb.getAll<import("@/domain/learning/types").Level>(stores.levels),
      englishAcademyDb.getAll<Unit>(stores.units), englishAcademyDb.getAll<Chapter>(stores.chapters), englishAcademyDb.getAll<Lesson>(stores.lessons), englishAcademyDb.getAll<UserLessonProgress>(stores.progress),
    ]);
    return { courses, levels, units, chapters, lessons, progress: progress.filter((item) => item.userId === learnerId) };
  }

  private completionState(curriculum: Awaited<ReturnType<LearningRepository["getCurriculum"]>>): CompletionState {
    const completedLessonIds = new Set(curriculum.progress.filter((item) => item.completed).map((item) => item.lessonId));
    const completedUnitIds = new Set(curriculum.units.filter((unit) => unit.lessonIds.length > 0 && unit.lessonIds.every((id) => completedLessonIds.has(id))).map((unit) => unit.id));
    const completedLevelIds = new Set(curriculum.levels.filter((level) => level.unitIds.length > 0 && level.unitIds.every((id) => completedUnitIds.has(id))).map((level) => level.id));
    return { completedLessonIds, completedUnitIds, completedLevelIds };
  }

  async getLessonBundle(lessonId: string): Promise<LessonBundle> {
    await this.seedIfNeeded();
    const lesson = await englishAcademyDb.get<Lesson>(stores.lessons, lessonId);
    if (!lesson) throw new AppError("ContentError", "পাঠটি খুঁজে পাওয়া যায়নি।");
    const [allVocabulary, questions, progress, activityProgress, bookmarks, notes] = await Promise.all([
      englishAcademyDb.getAll<VocabularyItem>(stores.vocabulary), englishAcademyDb.getByIndex<Question>(stores.questions, "lessonId", lessonId),
      englishAcademyDb.getByIndex<UserLessonProgress>(stores.progress, "userLesson", [learnerId, lessonId]), englishAcademyDb.getByIndex<UserActivityProgress>(stores.activityProgress, "lessonId", lessonId),
      englishAcademyDb.getByIndex<Bookmark>(stores.bookmarks, "userContent", [learnerId, lessonId]), englishAcademyDb.getByIndex<PersonalNote>(stores.notes, "userContent", [learnerId, lessonId]),
    ]);
    return { lesson, vocabulary: allVocabulary.filter((item) => lesson.vocabularyIds.includes(item.id)), questions, progress: progress[0], activityProgress: activityProgress.filter((item) => item.userId === learnerId), bookmarked: Boolean(bookmarks[0]), note: notes.find((item) => item.userId === learnerId) };
  }

  async getRoadmap(): Promise<RoadmapItem[]> {
    const curriculum = await this.getCurriculum(); const state = this.completionState(curriculum);
    const levelOrder = new Map(curriculum.levels.sort((a, b) => a.order - b.order).map((level, index) => [level.id, index]));
    const unitOrder = new Map(curriculum.units.sort((a, b) => a.order - b.order).map((unit, index) => [unit.id, index]));
    return curriculum.lessons.sort((a, b) => (levelOrder.get(curriculum.units.find((unit) => unit.id === a.unitId)?.levelId ?? "") ?? 99) - (levelOrder.get(curriculum.units.find((unit) => unit.id === b.unitId)?.levelId ?? "") ?? 99) || (unitOrder.get(a.unitId) ?? 99) - (unitOrder.get(b.unitId) ?? 99) || a.order - b.order).map((lesson) => {
      const unit = curriculum.units.find((item) => item.id === lesson.unitId)!;
      const progress = curriculum.progress.find((item) => item.lessonId === lesson.id);
      return { lesson, progress, unlocked: isUnlocked([...(unit.prerequisites ?? []), ...(lesson.prerequisites ?? [])], state), completed: Boolean(progress?.completed), unitId: unit.id, levelId: unit.levelId };
    });
  }

  async getCourseMap(courseId: string) {
    const curriculum = await this.getCurriculum(); const state = this.completionState(curriculum);
    const courseLevels = curriculum.levels.filter((level) => level.courseId === courseId).sort((a, b) => a.order - b.order);
    return courseLevels.map((level) => ({ level, unlocked: level.availability !== "coming-soon" && isUnlocked(level.prerequisites, state), completed: state.completedLevelIds.has(level.id), units: curriculum.units.filter((unit) => unit.levelId === level.id).sort((a, b) => a.order - b.order).map((unit) => ({ unit, unlocked: isUnlocked([...(level.prerequisites ?? []), ...(unit.prerequisites ?? [])], state), completed: state.completedUnitIds.has(unit.id), chapters: curriculum.chapters.filter((chapter) => chapter.unitId === unit.id).sort((a, b) => a.order - b.order), lessons: curriculum.lessons.filter((lesson) => lesson.unitId === unit.id).sort((a, b) => a.order - b.order).map((lesson) => ({ ...lesson, progress: curriculum.progress.find((item) => item.lessonId === lesson.id), unlocked: isUnlocked([...(unit.prerequisites ?? []), ...(lesson.prerequisites ?? [])], state) })) })) }));
  }

  async getUnitBundle(unitId: string): Promise<UnitBundle> {
    const curriculum = await this.getCurriculum(); const unit = curriculum.units.find((item) => item.id === unitId);
    if (!unit) throw new AppError("ContentError", "Unit খুঁজে পাওয়া যায়নি।");
    const level = curriculum.levels.find((item) => item.id === unit.levelId); if (!level) throw new AppError("ContentError", "Level খুঁজে পাওয়া যায়নি।");
    const state = this.completionState(curriculum);
    return { unit, level, lessons: curriculum.lessons.filter((lesson) => lesson.unitId === unit.id).sort((a, b) => a.order - b.order), chapters: curriculum.chapters.filter((chapter) => chapter.unitId === unit.id).sort((a, b) => a.order - b.order), unlocked: isUnlocked([...(level.prerequisites ?? []), ...(unit.prerequisites ?? [])], state), completed: state.completedUnitIds.has(unit.id) };
  }

  async getContinueLearning() {
    const roadmap = await this.getRoadmap(); const settings = await this.getSettings();
    const resumed = settings.lastLessonId ? roadmap.find((item) => item.lesson.id === settings.lastLessonId && !item.completed && item.unlocked) : undefined;
    return resumed ?? roadmap.find((item) => item.unlocked && !item.completed) ?? roadmap.find((item) => item.unlocked);
  }

  async getLearningSummary(): Promise<LearningSummary> {
    const [curriculum, roadmap, nextLesson] = await Promise.all([this.getCurriculum(), this.getRoadmap(), this.getContinueLearning()]);
    const completedLessons = roadmap.filter((item) => item.completed).length;
    const engagedLessons = roadmap.filter((item) => item.progress?.startedAt || item.completed);
    const practicedSkills = Array.from(new Set(engagedLessons.flatMap((item) => item.lesson.skillFocus)));
    const currentLevelId = nextLesson?.levelId ?? roadmap.find((item) => item.completed)?.levelId ?? curriculum.levels.sort((a, b) => a.order - b.order)[0]?.id;
    const assessmentLessons = roadmap.filter((item) => item.lesson.isAssessment);
    return {
      totalLessons: roadmap.length,
      completedLessons,
      timeSpentSeconds: curriculum.progress.reduce((total, item) => total + item.timeSpentSeconds, 0),
      practicedSkills,
      currentLevel: curriculum.levels.find((level) => level.id === currentLevelId),
      nextLesson,
      completedAssessments: assessmentLessons.filter((item) => item.completed).length,
      totalAssessments: assessmentLessons.length,
    };
  }

  async getGrammarTopics(): Promise<GrammarTopic[]> { await this.seedIfNeeded(); return (await englishAcademyDb.getAll<GrammarTopic>(stores.grammarTopics)).sort((a, b) => a.title.localeCompare(b.title)); }
  async getVocabulary(): Promise<VocabularyItem[]> { await this.seedIfNeeded(); return (await englishAcademyDb.getAll<VocabularyItem>(stores.vocabulary)).sort((a, b) => a.word.localeCompare(b.word)); }
  async getVocabularyEntries(): Promise<VocabularyEntry[]> { const [items, progress] = await Promise.all([this.getVocabulary(), englishAcademyDb.getAll<UserVocabularyProgress>(stores.vocabularyProgress)]); return items.map((item) => ({ item, progress: progress.find((record) => record.userId === learnerId && record.vocabularyId === item.id) })); }
  async getPracticeQuestions(filters: { skill?: "grammar" | "vocabulary"; difficulty?: number; count: number }): Promise<Question[]> { await this.seedIfNeeded(); const questions = await englishAcademyDb.getAll<Question>(stores.questions); return questions.filter((question) => (!filters.skill || question.skill === filters.skill) && (!filters.difficulty || question.difficulty === filters.difficulty)).sort(() => 0.5 - Math.random()).slice(0, filters.count); }
  async getDueReviewItems(): Promise<ReviewItem[]> { await this.seedIfNeeded(); return new IntervalReviewScheduler().getDueItems(await englishAcademyDb.getAll<ReviewItem>(stores.reviewItems)); }

  async recordActivity(lessonId: string, blockId: string, response?: string, score?: number, confidence?: UserActivityProgress["confidence"]): Promise<void> {
    await this.seedIfNeeded(); const now = timestamp();
    const lesson = await englishAcademyDb.get<Lesson>(stores.lessons, lessonId);
    if (!lesson) throw new AppError("ContentError", "পাঠটি খুঁজে পাওয়া যায়নি।");
    const existing = (await englishAcademyDb.getByIndex<UserActivityProgress>(stores.activityProgress, "userBlock", [learnerId, lessonId, blockId]))[0];
    await englishAcademyDb.put(stores.activityProgress, { id: existing?.id ?? `activity-${learnerId}-${lessonId}-${blockId}`, schemaVersion: 4, updatedAt: now, userId: learnerId, lessonId, blockId, completed: true, response, score, confidence });
    const progress = (await englishAcademyDb.getByIndex<UserLessonProgress>(stores.progress, "userLesson", [learnerId, lessonId]))[0];
    const completedBlockIds = Array.from(new Set([...(progress?.completedBlockIds ?? []), blockId]));
    const requiredBlocks = lesson.completionPolicy?.requiredBlockIds ?? [];
    const blocksComplete = requiredBlocks.length === 0 || requiredBlocks.every((id) => completedBlockIds.includes(id));
    const requiresQuestions = (lesson.completionPolicy?.requiredQuestionIds ?? lesson.questionIds).length > 0;
    const completed = Boolean(progress?.completed) || (blocksComplete && !requiresQuestions);
    await englishAcademyDb.put(stores.progress, { id: progress?.id ?? `progress-${learnerId}-${lessonId}`, schemaVersion: 4, updatedAt: now, userId: learnerId, lessonId, completed, completedAt: completed ? now : progress?.completedAt, startedAt: progress?.startedAt ?? now, lastPosition: Math.max(progress?.lastPosition ?? 0, 1), completedBlockIds, correctCount: progress?.correctCount ?? 0, wrongCount: progress?.wrongCount ?? 0, timeSpentSeconds: progress?.timeSpentSeconds ?? 0, confidence, lastActivityAt: now });
    await this.updateSettings({ lastLessonId: lessonId });
  }

  async recordAnswer(questionId: string, userAnswer: string): Promise<AnswerRecord> {
    await this.seedIfNeeded(); const question = await englishAcademyDb.get<Question>(stores.questions, questionId); if (!question) throw new AppError("ContentError", "প্রশ্নটি খুঁজে পাওয়া যায়নি।");
    const outcome = validateAnswer(question, userAnswer); const now = timestamp(); const lesson = await englishAcademyDb.get<Lesson>(stores.lessons, question.lessonId); if (!lesson) throw new AppError("ContentError", "পাঠটি খুঁজে পাওয়া যায়নি।");
    const attempt: Attempt = { id: `attempt-${crypto.randomUUID()}`, schemaVersion: 4, updatedAt: now, userId: learnerId, questionId, lessonId: question.lessonId, questionType: question.type, userAnswer, isCorrect: outcome.isCorrect, submittedAt: now };
    const [existing, attempts, activities] = await Promise.all([englishAcademyDb.getByIndex<UserLessonProgress>(stores.progress, "userLesson", [learnerId, question.lessonId]), englishAcademyDb.getAll<Attempt>(stores.attempts), englishAcademyDb.getByIndex<UserActivityProgress>(stores.activityProgress, "lessonId", question.lessonId)]);
    const correctIds = new Set([...attempts.filter((item) => item.userId === learnerId && item.lessonId === question.lessonId && item.isCorrect).map((item) => item.questionId), ...(outcome.isCorrect ? [questionId] : [])]);
    const required = lesson.completionPolicy?.requiredQuestionIds ?? lesson.questionIds;
    const requiredBlocks = lesson.completionPolicy?.requiredBlockIds ?? [];
    const completedBlocks = new Set(activities.filter((item) => item.userId === learnerId && item.completed).map((item) => item.blockId));
    const blocksComplete = requiredBlocks.length === 0 || requiredBlocks.every((id) => completedBlocks.has(id));
    const questionsComplete = required.length === 0 || required.every((id) => correctIds.has(id)); const prior = existing[0];
    const completed = (questionsComplete && blocksComplete) || Boolean(prior?.completed);
    const progress: UserLessonProgress = { id: prior?.id ?? `progress-${learnerId}-${question.lessonId}`, schemaVersion: 4, updatedAt: now, userId: learnerId, lessonId: question.lessonId, completed: completed || prior?.completed || false, completedAt: completed ? now : prior?.completedAt, startedAt: prior?.startedAt ?? now, lastPosition: prior?.lastPosition ?? 0, completedBlockIds: prior?.completedBlockIds ?? [], correctCount: (prior?.correctCount ?? 0) + (outcome.isCorrect ? 1 : 0), wrongCount: (prior?.wrongCount ?? 0) + (outcome.isCorrect ? 0 : 1), timeSpentSeconds: prior?.timeSpentSeconds ?? 0, lastActivityAt: now };
    const reviewId = `review-question-${questionId}`; const previousReview = await englishAcademyDb.get<ReviewItem>(stores.reviewItems, reviewId); const scheduler = new IntervalReviewScheduler(); const reviewBase: ReviewItem = previousReview ?? { id: reviewId, schemaVersion: 4, updatedAt: now, userId: learnerId, itemId: questionId, itemType: "question", masteryScore: 0, confidence: 0, attemptCount: 0, correctCount: 0, wrongCount: 0, nextReviewAt: now, reviewLevel: 0 };
    const reviewed = outcome.isCorrect ? scheduler.recordSuccess(reviewBase) : scheduler.recordFailure(reviewBase);
    const writes: Promise<void>[] = [englishAcademyDb.put(stores.attempts, attempt), englishAcademyDb.put(stores.progress, progress), englishAcademyDb.put(stores.reviewItems, { ...reviewed, updatedAt: now, masteryScore: scoreForAttempts(reviewed.correctCount, reviewed.wrongCount) }), this.updateSettings({ lastLessonId: question.lessonId }).then(() => undefined)];
    if (question.type === "vocabulary-recall") writes.push(this.recordVocabularyRecall(question.vocabularyId, outcome.isCorrect, now));
    if (!outcome.isCorrect) writes.push(englishAcademyDb.put(stores.mistakes, { id: `mistake-${crypto.randomUUID()}`, schemaVersion: 4, updatedAt: now, userId: learnerId, questionId, userAnswer, correctAnswer: getCorrectAnswer(question), reason: "ভুল উত্তর", timestamp: now, attemptCount: 1, resolved: false }));
    await Promise.all(writes); return outcome;
  }

  private async recordVocabularyRecall(vocabularyId: string, isCorrect: boolean, now: string): Promise<void> { const existing = (await englishAcademyDb.getByIndex<UserVocabularyProgress>(stores.vocabularyProgress, "userVocabulary", [learnerId, vocabularyId]))[0]; await englishAcademyDb.put(stores.vocabularyProgress, { id: existing?.id ?? `vocabulary-${learnerId}-${vocabularyId}`, schemaVersion: 4, updatedAt: now, userId: learnerId, vocabularyId, learned: isCorrect || existing?.learned || false, recallCount: (existing?.recallCount ?? 0) + 1, correctCount: (existing?.correctCount ?? 0) + (isCorrect ? 1 : 0), wrongCount: (existing?.wrongCount ?? 0) + (isCorrect ? 0 : 1), lastReviewedAt: now }); }
  async recordFlashcardReview(vocabularyId: string, rating: "again" | "hard" | "good" | "easy"): Promise<void> { await this.seedIfNeeded(); const now = timestamp(); const correct = rating === "good" || rating === "easy"; await this.recordVocabularyRecall(vocabularyId, correct, now); const reviewId = `review-vocabulary-${vocabularyId}`; const prior = await englishAcademyDb.get<ReviewItem>(stores.reviewItems, reviewId); const base: ReviewItem = prior ?? { id: reviewId, schemaVersion: 4, updatedAt: now, userId: learnerId, itemId: vocabularyId, itemType: "vocabulary", masteryScore: 0, confidence: 0, attemptCount: 0, correctCount: 0, wrongCount: 0, nextReviewAt: now, reviewLevel: 0 }; const reviewed = rating === "again" ? new IntervalReviewScheduler().recordFailure(base) : new IntervalReviewScheduler().recordSuccess(base); await englishAcademyDb.put(stores.reviewItems, { ...reviewed, updatedAt: now, confidence: rating === "easy" ? 3 : rating === "good" ? 2 : rating === "hard" ? 1 : 0, masteryScore: scoreForAttempts(reviewed.correctCount, reviewed.wrongCount) }); }

  async getWritingDraft(promptId: string): Promise<WritingDraft | undefined> { await this.seedIfNeeded(); return (await englishAcademyDb.getByIndex<WritingDraft>(stores.writingDrafts, "userPrompt", [learnerId, promptId]))[0]; }
  async saveWritingDraft(promptId: string, text: string, submitted = false): Promise<WritingDraft> { await this.seedIfNeeded(); const now = timestamp(); const existing = await this.getWritingDraft(promptId); const draft: WritingDraft = { id: existing?.id ?? `draft-${learnerId}-${promptId}`, schemaVersion: 4, updatedAt: now, userId: learnerId, promptId, text, submittedAt: submitted ? now : existing?.submittedAt }; await englishAcademyDb.put(stores.writingDrafts, draft); return draft; }
  async toggleBookmark(contentId: string, contentType: Bookmark["contentType"]): Promise<boolean> { await this.seedIfNeeded(); const existing = (await englishAcademyDb.getByIndex<Bookmark>(stores.bookmarks, "userContent", [learnerId, contentId]))[0]; if (existing) { await englishAcademyDb.delete(stores.bookmarks, existing.id); return false; } const now = timestamp(); await englishAcademyDb.put(stores.bookmarks, { id: `bookmark-${learnerId}-${contentId}`, schemaVersion: 4, updatedAt: now, userId: learnerId, contentId, contentType, createdAt: now }); return true; }
  async saveNote(contentId: string, text: string): Promise<PersonalNote> { await this.seedIfNeeded(); const now = timestamp(); const existing = (await englishAcademyDb.getByIndex<PersonalNote>(stores.notes, "userContent", [learnerId, contentId]))[0]; const note: PersonalNote = { id: existing?.id ?? `note-${learnerId}-${contentId}`, schemaVersion: 4, updatedAt: now, userId: learnerId, contentId, text }; await englishAcademyDb.put(stores.notes, note); return note; }
  async getMistakes(): Promise<MistakeBundle[]> { await this.seedIfNeeded(); const [records, questions] = await Promise.all([englishAcademyDb.getAll<MistakeRecord>(stores.mistakes), englishAcademyDb.getAll<Question>(stores.questions)]); return records.filter((record) => record.userId === learnerId && !record.resolved).sort((a, b) => b.timestamp.localeCompare(a.timestamp)).map((record) => ({ record, question: questions.find((question) => question.id === record.questionId) })); }
  async getProgressSnapshot() { await this.seedIfNeeded(); const [roadmap, vocabulary, mistakes, attempts, reviews] = await Promise.all([this.getRoadmap(), this.getVocabularyEntries(), this.getMistakes(), englishAcademyDb.getAll<Attempt>(stores.attempts), this.getDueReviewItems()]); const completed = roadmap.filter((item) => item.completed).length; const learned = vocabulary.filter((entry) => entry.progress?.learned).length; const skills = (["grammar", "vocabulary", "reading", "listening", "speaking", "writing", "pronunciation"] as Skill[]).map((skill) => { const relevant = attempts.filter((attempt) => attempt.userId === learnerId && (phase2Seed.questions.find((question) => question.id === attempt.questionId)?.skill === skill)); return { skill, attempts: relevant.length, correct: relevant.filter((attempt) => attempt.isCorrect).length }; }); return { completed, totalLessons: roadmap.length, learned, totalVocabulary: vocabulary.length, mistakes: mistakes.length, reviewDue: reviews.length, skills, lastLessonId: (await this.getSettings()).lastLessonId, next: await this.getContinueLearning() }; }

  async exportUserData() { await this.seedIfNeeded(); const [settings, progress, activityProgress, vocabularyProgress, attempts, mistakes, reviewItems, writingDrafts, bookmarks, notes, objectives, sessions] = await Promise.all([this.getSettings(), englishAcademyDb.getAll<UserLessonProgress>(stores.progress), englishAcademyDb.getAll<UserActivityProgress>(stores.activityProgress), englishAcademyDb.getAll<UserVocabularyProgress>(stores.vocabularyProgress), englishAcademyDb.getAll<Attempt>(stores.attempts), englishAcademyDb.getAll<MistakeRecord>(stores.mistakes), englishAcademyDb.getAll<ReviewItem>(stores.reviewItems), englishAcademyDb.getAll<WritingDraft>(stores.writingDrafts), englishAcademyDb.getAll<Bookmark>(stores.bookmarks), englishAcademyDb.getAll<PersonalNote>(stores.notes), englishAcademyDb.getAll<ObjectiveProgress>(stores.objectives), englishAcademyDb.getAll<LearningSession>(stores.sessions)]); return { format: "english-academy-user-data", version: 3, exportedAt: timestamp(), settings, progress, activityProgress, vocabularyProgress, attempts, mistakes, reviewItems, writingDrafts, bookmarks, notes, objectives, sessions }; }
  async importUserData(value: unknown): Promise<void> { const data = value as Record<string, unknown>; if (!data || data.format !== "english-academy-user-data" || !Array.isArray(data.progress)) throw new AppError("ContentError", "এই ফাইলটি English Academy backup নয়। "); await this.resetUserData(); const collections: Array<[typeof stores.progress | typeof stores.activityProgress | typeof stores.vocabularyProgress | typeof stores.attempts | typeof stores.mistakes | typeof stores.reviewItems | typeof stores.writingDrafts | typeof stores.bookmarks | typeof stores.notes | typeof stores.objectives | typeof stores.sessions, unknown]> = [[stores.progress, data.progress], [stores.activityProgress, data.activityProgress], [stores.vocabularyProgress, data.vocabularyProgress], [stores.attempts, data.attempts], [stores.mistakes, data.mistakes], [stores.reviewItems, data.reviewItems], [stores.writingDrafts, data.writingDrafts], [stores.bookmarks, data.bookmarks], [stores.notes, data.notes], [stores.objectives, data.objectives], [stores.sessions, data.sessions]]; await Promise.all(collections.flatMap(([store, values]) => Array.isArray(values) ? values.map((item) => englishAcademyDb.put(store, item)) : [])); if (data.settings && typeof data.settings === "object") await englishAcademyDb.put(stores.settings, { ...defaultSettings(), ...(data.settings as AppSettings), id: settingsId, seedVersion }); }
  async resetUserData(): Promise<void> { await this.seedIfNeeded(); const settings = await this.getSettings(); await Promise.all([englishAcademyDb.clear(stores.progress), englishAcademyDb.clear(stores.activityProgress), englishAcademyDb.clear(stores.vocabularyProgress), englishAcademyDb.clear(stores.attempts), englishAcademyDb.clear(stores.mistakes), englishAcademyDb.clear(stores.reviewItems), englishAcademyDb.clear(stores.writingDrafts), englishAcademyDb.clear(stores.bookmarks), englishAcademyDb.clear(stores.notes), englishAcademyDb.clear(stores.objectives), englishAcademyDb.clear(stores.sessions), englishAcademyDb.put(stores.settings, { ...settings, lastLessonId: undefined, updatedAt: timestamp() })]); }
}

export const learningRepository = new LearningRepository();
