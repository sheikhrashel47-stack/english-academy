import { AppError } from "@/core/errors/AppError";
import { logger } from "@/core/services/logger";
import { importLearningSeed } from "@/data/content/ContentImporter";
import { validateGrammarConcepts, validateLibraryRecords, validateSentenceLicense, validateVocabularyLicense } from "@/data/content/ContentValidator";
import { importVocabularyPackage, type VocabularyImportReport } from "@/data/content/VocabularyImporter";
import { phase2Seed } from "@/data/content/phase2Seed";
import { originalSampleSource, phase3GrammarConcepts, phase3PracticeQuestions, phase3Vocabulary } from "@/data/content/phase3Seed";
import { phase4Phrases, phase4SkillActivities, phase4SkillSources } from "@/data/content/phase4SkillSeed";
import { phase6AssessmentBlueprints, phase6AssessmentQuestions, phase6AssessmentSources } from "@/data/content/phase6AssessmentSeed";
import { phase7AchievementDefinitions } from "@/data/content/phase7PersonalSeed";
import { phase8LibrarySeed } from "@/data/content/phase8LibrarySeed";
import { productionCorpusManifest, type ProductionCorpusAudit } from "@/data/content/productionCorpus";
import { englishAcademyDb, stores } from "@/data/indexeddb/EnglishAcademyDb";
import { isUnlocked, scoreForAttempts, type CompletionState } from "@/domain/learning/progressionEngine";
import { getCorrectAnswer, validateAnswer } from "@/domain/practice/exerciseEngine";
import { IntervalReviewScheduler, VocabularySrsScheduler } from "@/domain/review/ReviewScheduler";
import type { AppSettings, AssessmentBlueprint, AssessmentQuestion, AssessmentType, Attempt, Bookmark, Chapter, DiagnosticResult, EducationalCertificate, FlashcardRating, GrammarConcept, GrammarConceptFilters, GrammarTopic, LabSkill, Lesson, LearningSeed, LearningSession, LibraryActivity, LibraryCategory, LibraryResource, LibraryResourceFilters, LibrarySearchFilters, LibrarySearchHistory, LibrarySearchHit, LibrarySearchResult, MistakeRecord, ObjectiveProgress, PersonalNote, PersonalStudyPath, Phrase, Question, ReviewItem, SRSCard, Skill, SkillActivity, SkillActivityFilters, SkillAttempt, SkillConfidence, SkillError, SkillMastery, SkillMasteryState, Unit, UserActivityProgress, UserLessonProgress, UserVocabularyProgress, VocabularyItem, VocabularySearchFilters, VocabularySearchResult, VocabularySentence, VocabularySource, WritingDraft } from "@/domain/learning/types";
import type { AssessmentAnswer, AssessmentResult, AssessmentSession } from "@/domain/learning/types";
import type { AchievementDefinition, AchievementProgress, DailyStudyPlan, LearningGoal, PersonalLearningEvent, PersonalLearningProfile, StudyDayRecord, XpLedgerEntry } from "@/domain/learning/types";
import { createPrivacySafeVerificationPayload, deriveCompletionBadges, isFullyScoredCompletion, type CompletionBadge } from "@/domain/learning/certificateEngine";
import { academyLevelFor, buildDailyStudyPlan, calculateEventXp, localStudyDate, updateAchievements, updateGoals, updateStreak, updateStudyDay } from "@/domain/learning/personalLearningEngine";

const learnerId = "local-learner";
const settingsId = "app-settings";
const seedVersion = "phase8.library.1";
const timestamp = () => new Date().toISOString();
const corpusChunkSize = 500;
const alphabetLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const letterRange = (letter: string) => {
  const normalized = letter.trim().slice(0, 1).toLocaleLowerCase("en-US");
  return normalized ? IDBKeyRange.bound(normalized, `${normalized}\uffff`) : undefined;
};
const normalizeSearchTerms = (value: string) => value.toLocaleLowerCase("en-US").normalize("NFKC").replace(/[.,;:!?()[\]{}"'“”‘’/\\|+*=<>—–-]+/g, " ").split(/\s+/).filter((token) => token.length > 0).slice(0, 4);

type ProductionCorpusPackage = { sources: VocabularySource[]; vocabulary: VocabularyItem[]; sentences: VocabularySentence[]; audit: ProductionCorpusAudit };

const defaultPersonalProfile = (): PersonalLearningProfile => ({
  id: `personal-profile-${learnerId}`, schemaVersion: 9, updatedAt: timestamp(), createdAt: timestamp(), userId: learnerId,
  learnerIntent: "balanced", focusSkills: ["vocabulary", "grammar", "listening"], weeklyTargetDays: 5,
  totalXp: 0, academyLevel: 1, currentStreak: 0, longestStreak: 0, streakFreezeCredits: 0, onboardingComplete: false,
});

export type LessonBundle = { lesson: Lesson; vocabulary: VocabularyItem[]; questions: Question[]; progress?: UserLessonProgress; activityProgress: UserActivityProgress[]; bookmarked: boolean; note?: PersonalNote };
export type UnitBundle = { unit: Unit; level: import("@/domain/learning/types").Level; lessons: Lesson[]; chapters: Chapter[]; unlocked: boolean; completed: boolean };
export type AnswerRecord = ReturnType<typeof validateAnswer>;
export type VocabularyEntry = { item: VocabularyItem; progress?: UserVocabularyProgress };
export type MistakeBundle = { record: MistakeRecord; question?: Question };
export type RoadmapItem = { lesson: Lesson; progress?: UserLessonProgress; unlocked: boolean; completed: boolean; unitId: string; levelId: string };
export type LearningSummary = { totalLessons: number; completedLessons: number; timeSpentSeconds: number; practicedSkills: Skill[]; currentLevel?: import("@/domain/learning/types").Level; nextLesson?: RoadmapItem; completedAssessments: number; totalAssessments: number };
export type VocabularyReviewQueue = { overdue: VocabularySearchResult["entries"]; dueToday: VocabularySearchResult["entries"]; newItems: VocabularySearchResult["entries"]; learning: VocabularySearchResult["entries"]; review: VocabularySearchResult["entries"]; mastered: VocabularySearchResult["entries"] };
export type CorpusSnapshot = { vocabulary: number; sentences: number; grammar: number; sources: number; corpusVersion?: string };
export type SkillActivityPage = { activities: SkillActivity[]; page: number; pageSize: number; total: number; hasMore: boolean };
export type SkillRecommendation = { skill: LabSkill; title: string; banglaTitle: string; reason: string; activityId?: string };
export type CertificateEligibility = { result: AssessmentResult; level: NonNullable<AssessmentResult["level"]>; assessmentType: "level" | "final" };

const defaultSettings = (): AppSettings => ({ id: settingsId, schemaVersion: 5, updatedAt: timestamp(), theme: "light", languageMode: "mixed", soundEnabled: true, hapticEnabled: false, animationsEnabled: true, reducedMotion: false, dailyGoalMinutes: 15, seedVersion });

class LearningRepository {
  private productionCorpusBootstrap?: Promise<void>;
  private localSeedBootstrap?: Promise<void>;

  async seedIfNeeded(options: { waitForCorpus?: boolean } = {}): Promise<void> {
    if (!this.localSeedBootstrap) {
      this.localSeedBootstrap = this.seedLocalData().finally(() => {
        this.localSeedBootstrap = undefined;
      });
    }
    await this.localSeedBootstrap;
    if (options.waitForCorpus !== false) await this.ensureProductionCorpus();
  }

  private async seedLocalData(): Promise<void> {
    const settings = await englishAcademyDb.get<AppSettings>(stores.settings, settingsId);
    if (settings?.seedVersion !== seedVersion) {
      await this.persistCurriculum(phase2Seed);
      await this.persistPhase3Seed();
      await this.persistSkillSeed();
      await this.persistAssessmentSeed();
      await this.persistLibrarySeed();
      await this.persistPersonalLearningSeed();
      await this.ensurePersonalLearningProfile();
      await englishAcademyDb.put(stores.settings, { ...defaultSettings(), ...(settings ?? {}), id: settingsId, seedVersion, updatedAt: timestamp() });
      logger.debug("seed-loaded", { version: seedVersion });
    }
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

  private async persistPhase3Seed(): Promise<void> {
    const curriculumVocabulary = (await englishAcademyDb.getAll<VocabularyItem>(stores.vocabulary)).filter((item) => !item.sourceId);
    const enrichedCurriculumVocabulary = curriculumVocabulary.map((item) => ({ ...item, schemaVersion: 5, lemma: item.word.toLocaleLowerCase("en-US"), sourceId: originalSampleSource.id, license: "MIT" as const, licenseUrl: originalSampleSource.licenseUrl, commercialUseAllowed: true, attribution: originalSampleSource.attribution }));
    await Promise.all([
      englishAcademyDb.put(stores.vocabularySources, originalSampleSource),
      ...enrichedCurriculumVocabulary.map((item) => englishAcademyDb.put(stores.vocabulary, item)),
      ...phase3Vocabulary.map((item) => englishAcademyDb.put(stores.vocabulary, item)),
      ...phase3PracticeQuestions.map((item) => englishAcademyDb.put(stores.questions, item)),
      ...phase3GrammarConcepts.map((item) => englishAcademyDb.put(stores.grammarConcepts, item)),
    ]);
  }

  private async persistSkillSeed(): Promise<void> {
    await Promise.all([
      englishAcademyDb.putMany(stores.skillSources, phase4SkillSources),
      englishAcademyDb.putMany(stores.skillActivities, phase4SkillActivities),
      englishAcademyDb.putMany(stores.phrases, phase4Phrases),
    ]);
  }

  private async persistAssessmentSeed(): Promise<void> {
    await Promise.all([
      englishAcademyDb.putMany(stores.assessmentSources, phase6AssessmentSources),
      englishAcademyDb.putMany(stores.assessmentQuestions, phase6AssessmentQuestions),
      englishAcademyDb.putMany(stores.assessmentBlueprints, phase6AssessmentBlueprints),
    ]);
  }

  private async persistLibrarySeed(): Promise<void> {
    validateLibraryRecords(phase8LibrarySeed.source, phase8LibrarySeed.categories, phase8LibrarySeed.resources);
    await Promise.all([
      englishAcademyDb.put(stores.librarySources, phase8LibrarySeed.source),
      englishAcademyDb.putMany(stores.libraryCategories, phase8LibrarySeed.categories),
      englishAcademyDb.putMany(stores.libraryResources, phase8LibrarySeed.resources),
    ]);
  }

  private async persistPersonalLearningSeed(): Promise<void> { await englishAcademyDb.putMany(stores.achievementDefinitions, phase7AchievementDefinitions); }

  private async ensurePersonalLearningProfile(): Promise<void> {
    const profile = await englishAcademyDb.get<PersonalLearningProfile>(stores.personalProfiles, `personal-profile-${learnerId}`);
    if (!profile) await englishAcademyDb.put(stores.personalProfiles, defaultPersonalProfile());
  }

  private async ensureProductionCorpus(): Promise<void> {
    const manifest = productionCorpusManifest;
    if (!manifest.url) return;
    const settings = await englishAcademyDb.get<AppSettings>(stores.settings, settingsId);
    if (settings?.corpusVersion === manifest.version) return;
    if (!this.productionCorpusBootstrap) {
      this.productionCorpusBootstrap = this.downloadProductionCorpus(manifest, settings).finally(() => {
        this.productionCorpusBootstrap = undefined;
      });
    }
    await this.productionCorpusBootstrap;
  }

  private async downloadProductionCorpus(manifest: typeof productionCorpusManifest, settings?: AppSettings): Promise<void> {
    try {
      const response = await fetch(manifest.url);
      if (!response.ok) throw new AppError("ContentError", `Corpus package পাওয়া যায়নি (${response.status})।`);
      const corpus = await response.json() as ProductionCorpusPackage;
      this.assertProductionCorpus(corpus, manifest.expected);
      const sourceMap = new Map(corpus.sources.map((source) => [source.id, source]));
      corpus.vocabulary.forEach((item) => validateVocabularyLicense(item, sourceMap));
      corpus.sentences.forEach((sentence) => validateSentenceLicense(sentence, sourceMap));
      await englishAcademyDb.putMany(stores.vocabularySources, corpus.sources);
      for (let start = 0; start < corpus.vocabulary.length; start += corpusChunkSize) await englishAcademyDb.putMany(stores.vocabulary, corpus.vocabulary.slice(start, start + corpusChunkSize));
      for (let start = 0; start < corpus.sentences.length; start += corpusChunkSize) await englishAcademyDb.putMany(stores.sentences, corpus.sentences.slice(start, start + corpusChunkSize));
      await englishAcademyDb.put(stores.settings, { ...defaultSettings(), ...(settings ?? {}), id: settingsId, seedVersion, corpusVersion: manifest.version, updatedAt: timestamp() });
      logger.debug("licensed-corpus-loaded", corpus.audit);
    } catch (error) {
      // The curated sample remains usable when an initial offline bootstrap cannot download.
      logger.warn("licensed-corpus-unavailable", { version: manifest.version, error: error instanceof Error ? error.message : String(error) });
    }
  }

  private assertProductionCorpus(corpus: ProductionCorpusPackage, expected: ProductionCorpusAudit): void {
    const audit = corpus.audit;
    const countsMatch = audit && audit.vocabularyCount === expected.vocabularyCount && audit.sentenceCount === expected.sentenceCount
      && audit.banglaMeaningCount === expected.banglaMeaningCount && audit.attributedSentenceCount === expected.attributedSentenceCount
      && audit.linkedSentenceCount >= expected.linkedSentenceCount;
    if (!countsMatch || corpus.vocabulary.length !== expected.vocabularyCount || corpus.sentences.length !== expected.sentenceCount) {
      throw new AppError("ContentError", "Corpus audit count manifest-এর সঙ্গে মেলেনি।");
    }
  }

  async getSettings(): Promise<AppSettings> { await this.seedIfNeeded({ waitForCorpus: false }); const saved = await englishAcademyDb.get<AppSettings>(stores.settings, settingsId); return { ...defaultSettings(), ...saved, id: settingsId }; }
  async getAssessmentBlueprints(filters: { assessmentType?: AssessmentType; level?: AssessmentBlueprint["level"] } = {}): Promise<AssessmentBlueprint[]> {
    await this.seedIfNeeded({ waitForCorpus: false });
    const records = filters.assessmentType
      ? await englishAcademyDb.getByIndex<AssessmentBlueprint>(stores.assessmentBlueprints, "assessmentType", filters.assessmentType)
      : await englishAcademyDb.getAll<AssessmentBlueprint>(stores.assessmentBlueprints);
    return records.filter((item) => !filters.level || item.level === filters.level).sort((a, b) => a.title.localeCompare(b.title));
  }
  async getAssessmentBlueprint(blueprintId: string): Promise<AssessmentBlueprint | undefined> { await this.seedIfNeeded({ waitForCorpus: false }); return englishAcademyDb.get<AssessmentBlueprint>(stores.assessmentBlueprints, blueprintId); }
  async getAssessmentQuestions(filters: { assessmentType?: AssessmentType; skill?: Skill; level?: AssessmentQuestion["level"]; approvedOnly?: boolean } = {}): Promise<AssessmentQuestion[]> {
    await this.seedIfNeeded({ waitForCorpus: false });
    const records = filters.skill
      ? await englishAcademyDb.getByIndex<AssessmentQuestion>(stores.assessmentQuestions, "skill", filters.skill)
      : filters.level
        ? await englishAcademyDb.getByIndex<AssessmentQuestion>(stores.assessmentQuestions, "level", filters.level)
        : await englishAcademyDb.getAll<AssessmentQuestion>(stores.assessmentQuestions);
    return records.filter((item) => (filters.approvedOnly === false || item.approved) && (!filters.assessmentType || item.assessmentTypes.includes(filters.assessmentType))).sort((a, b) => a.id.localeCompare(b.id));
  }
  async createAssessmentSession(input: { blueprint: AssessmentBlueprint; questionIds: string[]; sectionOrder: string[]; remainingSeconds?: number }): Promise<AssessmentSession> {
    await this.seedIfNeeded({ waitForCorpus: false });
    const now = timestamp();
    const session: AssessmentSession = { id: `assessment-session-${crypto.randomUUID()}`, schemaVersion: 7, updatedAt: now, userId: learnerId, blueprintId: input.blueprint.id, assessmentType: input.blueprint.assessmentType, sessionStatus: "in-progress", startedAt: now, expiresAt: input.remainingSeconds ? new Date(Date.now() + input.remainingSeconds * 1000).toISOString() : undefined, currentQuestionIndex: 0, questionIds: input.questionIds, sectionOrder: input.sectionOrder, remainingSeconds: input.remainingSeconds, lastSavedAt: now, resumedCount: 0 };
    await englishAcademyDb.put(stores.assessmentSessions, session);
    return session;
  }
  async getAssessmentSession(sessionId: string): Promise<AssessmentSession | undefined> { await this.seedIfNeeded({ waitForCorpus: false }); return englishAcademyDb.get<AssessmentSession>(stores.assessmentSessions, sessionId); }
  async getResumableAssessmentSession(blueprintId: string): Promise<AssessmentSession | undefined> {
    await this.seedIfNeeded({ waitForCorpus: false });
    const sessions = await englishAcademyDb.getByIndex<AssessmentSession>(stores.assessmentSessions, "userBlueprint", [learnerId, blueprintId]);
    return sessions.filter((session) => session.sessionStatus === "in-progress").sort((a, b) => b.lastSavedAt.localeCompare(a.lastSavedAt))[0];
  }
  async saveAssessmentSession(session: AssessmentSession, patch: Partial<Pick<AssessmentSession, "currentQuestionIndex" | "remainingSeconds" | "sessionStatus" | "submittedAt" | "resumedCount">> = {}): Promise<AssessmentSession> {
    await this.seedIfNeeded({ waitForCorpus: false });
    const now = timestamp();
    const next: AssessmentSession = { ...session, ...patch, updatedAt: now, lastSavedAt: now };
    await englishAcademyDb.put(stores.assessmentSessions, next);
    return next;
  }
  async getAssessmentAnswers(sessionId: string): Promise<AssessmentAnswer[]> { await this.seedIfNeeded({ waitForCorpus: false }); return englishAcademyDb.getByIndex<AssessmentAnswer>(stores.assessmentAnswers, "sessionId", sessionId); }
  async saveAssessmentAnswer(input: Omit<AssessmentAnswer, "id" | "schemaVersion" | "updatedAt">): Promise<AssessmentAnswer> {
    await this.seedIfNeeded({ waitForCorpus: false });
    const existing = (await englishAcademyDb.getByIndex<AssessmentAnswer>(stores.assessmentAnswers, "sessionQuestion", [input.sessionId, input.questionId]))[0];
    const answer: AssessmentAnswer = { ...existing, ...input, id: existing?.id ?? `assessment-answer-${input.sessionId}-${input.questionId}`, schemaVersion: 7, updatedAt: timestamp() };
    await englishAcademyDb.put(stores.assessmentAnswers, answer);
    return answer;
  }
  async saveAssessmentResult(input: Omit<AssessmentResult, "id" | "schemaVersion" | "updatedAt" | "userId">): Promise<AssessmentResult> {
    await this.seedIfNeeded({ waitForCorpus: false });
    const now = timestamp();
    const result: AssessmentResult = { ...input, id: `assessment-result-${crypto.randomUUID()}`, schemaVersion: 7, updatedAt: now, userId: learnerId };
    await englishAcademyDb.put(stores.assessmentResults, result);
    const session = await this.getAssessmentSession(input.sessionId);
    if (session) await this.saveAssessmentSession(session, { sessionStatus: "submitted", submittedAt: input.completedAt, remainingSeconds: 0 });
    return result;
  }
  async getAssessmentResults(): Promise<AssessmentResult[]> { await this.seedIfNeeded({ waitForCorpus: false }); return (await englishAcademyDb.getAll<AssessmentResult>(stores.assessmentResults)).filter((item) => item.userId === learnerId).sort((a, b) => b.completedAt.localeCompare(a.completedAt)); }
  async getCertificateEligibility(): Promise<CertificateEligibility[]> {
    const results = await this.getAssessmentResults();
    return results.filter(isFullyScoredCompletion).map((result) => ({ result, level: result.level, assessmentType: result.assessmentType }));
  }
  async getCompletionBadges(): Promise<CompletionBadge[]> { return deriveCompletionBadges(await this.getAssessmentResults()); }
  async getEducationalCertificates(): Promise<EducationalCertificate[]> {
    await this.seedIfNeeded({ waitForCorpus: false });
    const records = await englishAcademyDb.getByIndexRange<EducationalCertificate>(stores.educationalCertificates, "userIssued", IDBKeyRange.bound([learnerId, ""], [learnerId, "\uffff"]));
    return records.sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));
  }
  async getEducationalCertificate(certificateNumber: string): Promise<EducationalCertificate | undefined> {
    await this.seedIfNeeded({ waitForCorpus: false });
    return (await englishAcademyDb.getByIndex<EducationalCertificate>(stores.educationalCertificates, "certificateNumber", certificateNumber)).find((record) => record.userId === learnerId);
  }
  async createEducationalCertificate(input: { assessmentResultId: string; learnerName: string }): Promise<EducationalCertificate> {
    const learnerName = input.learnerName.trim().replace(/\s+/g, " ");
    if (!learnerName || learnerName.length > 80) throw new Error("Certificate-এর নাম ১ থেকে ৮০ অক্ষরের মধ্যে হওয়া দরকার।");
    const eligible = (await this.getCertificateEligibility()).find((item) => item.result.id === input.assessmentResultId);
    if (!eligible) throw new Error("এই resultটি fully-scored passed level/final completion evidence নয়; তাই certificate তৈরি করা যাবে না।");
    const existing = (await this.getEducationalCertificates()).find((record) => record.assessmentResultId === input.assessmentResultId);
    if (existing) return existing;
    const now = timestamp(); const reference = crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase(); const certificateNumber = `EA-LER-${now.slice(0, 10).replace(/-/g, "")}-${reference}`;
    const levels = await englishAcademyDb.getAll<import("@/domain/learning/types").Level>(stores.levels);
    const certificate: EducationalCertificate = {
      id: `educational-certificate-${crypto.randomUUID()}`, schemaVersion: 7, updatedAt: now, createdAt: now, userId: learnerId, courseId: levels.find((level) => level.code === eligible.level)?.courseId, level: eligible.level, assessmentResultId: eligible.result.id, certificateNumber, issuedAt: now, learnerName,
      title: `English Academy ${eligible.level} Offline Certificate`, banglaTitle: `${eligible.level} সম্পন্নতার স্থানীয় রেকর্ড`, verificationPayload: createPrivacySafeVerificationPayload({ certificateNumber, issuedAt: now, level: eligible.level }), verificationStatus: "local-educational-record", statement: "Educational completion record — English Academy local learning workspace.",
    };
    await englishAcademyDb.put(stores.educationalCertificates, certificate);
    return certificate;
  }
  async getCorpusSnapshot(): Promise<CorpusSnapshot> {
    await this.seedIfNeeded();
    const [vocabulary, sentences, grammar, sources, settings] = await Promise.all([
      englishAcademyDb.count(stores.vocabulary), englishAcademyDb.count(stores.sentences), englishAcademyDb.count(stores.grammarConcepts), englishAcademyDb.count(stores.vocabularySources), this.getSettings(),
    ]);
    return { vocabulary, sentences, grammar, sources, corpusVersion: settings.corpusVersion };
  }
  async updateSettings(patch: Partial<Omit<AppSettings, "id" | "schemaVersion" | "updatedAt">>): Promise<AppSettings> { const current = await this.getSettings(); const next = { ...current, ...patch, updatedAt: timestamp() }; await englishAcademyDb.put(stores.settings, next); return next; }
  async getPersonalLearningProfile(): Promise<PersonalLearningProfile> {
    await this.seedIfNeeded({ waitForCorpus: false });
    return (await englishAcademyDb.get<PersonalLearningProfile>(stores.personalProfiles, `personal-profile-${learnerId}`)) ?? defaultPersonalProfile();
  }
  async updatePersonalLearningProfile(patch: Partial<Omit<PersonalLearningProfile, "id" | "schemaVersion" | "updatedAt" | "createdAt" | "userId">>): Promise<PersonalLearningProfile> {
    const current = await this.getPersonalLearningProfile(); const next = { ...current, ...patch, updatedAt: timestamp() };
    await englishAcademyDb.put(stores.personalProfiles, next); return next;
  }
  async getLearningGoals(period?: LearningGoal["period"]): Promise<LearningGoal[]> {
    await this.seedIfNeeded({ waitForCorpus: false });
    const records = period ? await englishAcademyDb.getByIndex<LearningGoal>(stores.learningGoals, "userPeriodStatus", [learnerId, period, "active"]) : await englishAcademyDb.getAll<LearningGoal>(stores.learningGoals);
    return records.filter((goal) => goal.userId === learnerId).sort((a, b) => a.endsOn.localeCompare(b.endsOn));
  }
  async saveLearningGoal(input: Omit<LearningGoal, "id" | "schemaVersion" | "updatedAt" | "createdAt" | "userId"> & { id?: string }): Promise<LearningGoal> {
    await this.seedIfNeeded({ waitForCorpus: false }); const existing = input.id ? await englishAcademyDb.get<LearningGoal>(stores.learningGoals, input.id) : undefined; const now = timestamp();
    const goal: LearningGoal = { ...input, id: existing?.id ?? `learning-goal-${crypto.randomUUID()}`, schemaVersion: 8, updatedAt: now, createdAt: existing?.createdAt ?? now, userId: learnerId };
    await englishAcademyDb.put(stores.learningGoals, goal); return goal;
  }
  async getPersonalLearningEvents(limit = 120): Promise<PersonalLearningEvent[]> {
    await this.seedIfNeeded({ waitForCorpus: false });
    return englishAcademyDb.getByIndexRange<PersonalLearningEvent>(stores.personalLearningEvents, "userOccurred", IDBKeyRange.bound([learnerId, ""], [learnerId, "\uffff"]), limit);
  }
  async recordPersonalLearningEvent(input: Omit<PersonalLearningEvent, "id" | "schemaVersion" | "updatedAt" | "createdAt" | "userId">): Promise<PersonalLearningEvent> {
    await this.seedIfNeeded({ waitForCorpus: false });
    const existing = (await englishAcademyDb.getByIndex<PersonalLearningEvent>(stores.personalLearningEvents, "userEventKey", [learnerId, input.eventKey]))[0]; if (existing) return existing;
    const now = timestamp(); const event: PersonalLearningEvent = { ...input, id: `personal-learning-event-${crypto.randomUUID()}`, schemaVersion: 8, updatedAt: now, createdAt: now, userId: learnerId };
    await englishAcademyDb.put(stores.personalLearningEvents, event); return event;
  }
  async getXpLedger(limit = 180): Promise<XpLedgerEntry[]> {
    await this.seedIfNeeded({ waitForCorpus: false }); return englishAcademyDb.getByIndexRange<XpLedgerEntry>(stores.xpLedger, "userOccurred", IDBKeyRange.bound([learnerId, ""], [learnerId, "\uffff"]), limit);
  }
  async getStudyDayRecords(): Promise<StudyDayRecord[]> { await this.seedIfNeeded({ waitForCorpus: false }); return englishAcademyDb.getByIndexRange<StudyDayRecord>(stores.studyDays, "userDate", IDBKeyRange.bound([learnerId, ""], [learnerId, "\uffff"])); }
  async getAchievementDefinitions(): Promise<AchievementDefinition[]> { await this.seedIfNeeded({ waitForCorpus: false }); return englishAcademyDb.getAll<AchievementDefinition>(stores.achievementDefinitions); }
  async getAchievementProgress(): Promise<AchievementProgress[]> { await this.seedIfNeeded({ waitForCorpus: false }); return (await englishAcademyDb.getAll<AchievementProgress>(stores.achievementProgress)).filter((item) => item.userId === learnerId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)); }
  async getDailyStudyPlan(date: string): Promise<DailyStudyPlan | undefined> { await this.seedIfNeeded({ waitForCorpus: false }); return (await englishAcademyDb.getByIndex<DailyStudyPlan>(stores.dailyStudyPlans, "userDate", [learnerId, date]))[0]; }
  async getOrCreateDailyStudyPlan(date: string): Promise<DailyStudyPlan> {
    const saved = await this.getDailyStudyPlan(date); if (saved) return saved;
    const [goals, reviews, resume, mastery] = await Promise.all([this.getLearningGoals(), this.getDueReviewItems(), this.getContinueLearning(), this.getSkillMastery()]);
    const weakSkills = mastery.filter((item) => item.attemptCount > 0).sort((a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0) || a.activitiesCompleted - b.activitiesCompleted).map((item) => item.skill).slice(0, 2);
    const plan = buildDailyStudyPlan({ userId: learnerId, date, goals, dueReviewCount: reviews.length, currentLesson: resume ? { id: resume.lesson.id, title: resume.lesson.title, banglaTitle: resume.lesson.banglaTitle } : undefined, weakSkills });
    return this.saveDailyStudyPlan({ date: plan.date, goalIds: plan.goalIds, items: plan.items, generatedBy: plan.generatedBy });
  }
  async saveDailyStudyPlan(input: Omit<DailyStudyPlan, "id" | "schemaVersion" | "updatedAt" | "createdAt" | "userId">): Promise<DailyStudyPlan> {
    await this.seedIfNeeded({ waitForCorpus: false }); const existing = await this.getDailyStudyPlan(input.date); const now = timestamp();
    const plan: DailyStudyPlan = { ...input, id: existing?.id ?? `daily-study-plan-${learnerId}-${input.date}`, schemaVersion: 9, createdAt: existing?.createdAt ?? now, updatedAt: now, userId: learnerId };
    await englishAcademyDb.put(stores.dailyStudyPlans, plan); return plan;
  }
  async applyPersonalLearningEvent(input: Omit<PersonalLearningEvent, "id" | "schemaVersion" | "updatedAt" | "createdAt" | "userId">) {
    await this.seedIfNeeded({ waitForCorpus: false });
    const existing = (await englishAcademyDb.getByIndex<PersonalLearningEvent>(stores.personalLearningEvents, "userEventKey", [learnerId, input.eventKey]))[0];
    if (existing) return { event: existing, applied: false, xpAwarded: 0, unlockedAchievementIds: [] as string[] };
    const event = await this.recordPersonalLearningEvent(input);
    const [profile, allEvents, allDays, goals, definitions, achievementProgress] = await Promise.all([this.getPersonalLearningProfile(), this.getPersonalLearningEvents(600), this.getStudyDayRecords(), this.getLearningGoals(), this.getAchievementDefinitions(), this.getAchievementProgress()]);
    const priorEvents = allEvents.filter((item) => item.id !== event.id); const date = localStudyDate(event.occurredAt); const sameDayCount = priorEvents.filter((item) => item.type === event.type && localStudyDate(item.occurredAt) === date).length;
    const xp = calculateEventXp(event.type, sameDayCount); const nextDay = updateStudyDay(allDays.find((item) => item.date === date), event); const streakProfile = updateStreak(profile, date);
    const firstProfile = { ...streakProfile, totalXp: profile.totalXp + xp.amount, academyLevel: academyLevelFor(profile.totalXp + xp.amount), updatedAt: event.occurredAt };
    const progress = updateAchievements({ definitions, existing: achievementProgress, events: [...priorEvents, event], profile: firstProfile, at: event.occurredAt }); const achievementXp = progress.reduce((total, item) => total + item.xpReward, 0);
    const nextProfile = { ...firstProfile, totalXp: firstProfile.totalXp + achievementXp, academyLevel: academyLevelFor(firstProfile.totalXp + achievementXp) }; const nextGoals = updateGoals(goals, event); const unlockedAchievementIds = progress.filter((item) => item.newlyUnlocked).map((item) => item.achievementId);
    const ledger: XpLedgerEntry = { id: `xp-ledger-${event.id}`, schemaVersion: 9, createdAt: event.occurredAt, updatedAt: event.occurredAt, userId: learnerId, eventId: event.id, amount: xp.amount + achievementXp, ruleId: xp.ruleId, reason: xp.reason, banglaReason: achievementXp ? `${xp.banglaReason} + অর্জন` : xp.banglaReason, occurredAt: event.occurredAt };
    await Promise.all([englishAcademyDb.put(stores.xpLedger, ledger), englishAcademyDb.put(stores.personalProfiles, nextProfile), englishAcademyDb.put(stores.studyDays, { ...nextDay, xpEarned: nextDay.xpEarned + ledger.amount }), ...nextGoals.map((goal) => englishAcademyDb.put(stores.learningGoals, goal)), ...progress.map(({ newlyUnlocked: _newlyUnlocked, xpReward: _xpReward, ...item }) => englishAcademyDb.put(stores.achievementProgress, item))]);
    return { event, applied: true, xpAwarded: ledger.amount, unlockedAchievementIds, profile: nextProfile };
  }

  private async getCurriculum() {
    await this.seedIfNeeded({ waitForCorpus: false });
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

  private async entryForVocabulary(item: VocabularyItem) {
    const [progress, srsCard] = await Promise.all([
      englishAcademyDb.getByIndex<UserVocabularyProgress>(stores.vocabularyProgress, "userVocabulary", [learnerId, item.id]),
      englishAcademyDb.getByIndex<SRSCard>(stores.srsCards, "userVocabulary", [learnerId, item.id]),
    ]);
    return { item, progress: progress[0], srsCard: srsCard[0] };
  }

  async getVocabularyLetterIndex(): Promise<Record<string, number>> {
    await this.seedIfNeeded();
    const counts = await Promise.all(alphabetLetters.map(async (letter) => [
      letter,
      await englishAcademyDb.countByIndex(stores.vocabulary, "lemma", letterRange(letter)),
    ] as const));
    return Object.fromEntries(counts);
  }

  async searchVocabulary(filters: VocabularySearchFilters = {}): Promise<VocabularySearchResult> {
    await this.seedIfNeeded();
    const page = Math.max(0, filters.page ?? 0); const pageSize = Math.min(100, Math.max(10, filters.pageSize ?? 24));
    const query = filters.query?.trim().toLocaleLowerCase("en-US") ?? "";
    const selectedLetter = filters.letter?.trim().slice(0, 1).toLocaleLowerCase("en-US");
    const index = selectedLetter ? "lemma" : filters.level && filters.topic ? "levelTopic" : filters.level ? "level" : filters.topic ? "topic" : filters.partOfSpeech ? "partOfSpeech" : "lemma";
    const indexedQuery = selectedLetter ? letterRange(selectedLetter) : filters.level && filters.topic ? [filters.level, filters.topic] : filters.level ?? filters.topic ?? filters.partOfSpeech;
    const matchesFilters = (item: VocabularyItem) => {
      const matchesText = !query || [item.word, item.lemma, item.meaning, item.topic, item.partOfSpeech].some((value) => value?.toLocaleLowerCase("en-US").includes(query));
      const matchesLetter = !selectedLetter || (item.lemma ?? item.word).toLocaleLowerCase("en-US").startsWith(selectedLetter);
      return matchesText && matchesLetter && (!filters.level || item.level === filters.level) && (!filters.topic || item.topic === filters.topic) && (!filters.partOfSpeech || item.partOfSpeech === filters.partOfSpeech);
    };
    if (!filters.masteryState) {
      const result = await englishAcademyDb.getFilteredPage<VocabularyItem>(stores.vocabulary, { index, query: indexedQuery, offset: page * pageSize, limit: pageSize, matches: matchesFilters });
      const entries = await Promise.all(result.items.map((item) => this.entryForVocabulary(item)));
      return { entries, page, pageSize, total: result.total, hasMore: (page + 1) * pageSize < result.total };
    }
    const [matchingVocabulary, learnerCards] = await Promise.all([
      englishAcademyDb.getFilteredPage<VocabularyItem>(stores.vocabulary, { index, query: indexedQuery, offset: 0, limit: Number.MAX_SAFE_INTEGER, matches: matchesFilters }),
      englishAcademyDb.getByIndexRange<SRSCard>(stores.srsCards, "userVocabulary", IDBKeyRange.bound([learnerId, ""], [learnerId, "\uffff"])),
    ]);
    const masteryByVocabularyId = new Map(learnerCards.map((card) => [card.vocabularyId, card.masteryState]));
    const matchingItems = matchingVocabulary.items.filter((item) => {
      const masteryState = masteryByVocabularyId.get(item.id);
      return filters.masteryState === "new" ? !masteryState || masteryState === "new" : masteryState === filters.masteryState;
    });
    const start = page * pageSize;
    const entries = await Promise.all(matchingItems.slice(start, start + pageSize).map((item) => this.entryForVocabulary(item)));
    return { entries, page, pageSize, total: matchingItems.length, hasMore: start + pageSize < matchingItems.length };
  }

  async getVocabularyDetail(vocabularyId: string, sentencePage = 0, sentencePageSize = 6) {
    await this.seedIfNeeded(); const item = await englishAcademyDb.get<VocabularyItem>(stores.vocabulary, vocabularyId);
    if (!item) throw new AppError("ContentError", "শব্দটি খুঁজে পাওয়া যায়নি।");
    const [entry, sentencePageResult, source] = await Promise.all([
      this.entryForVocabulary(item),
      englishAcademyDb.getPage<VocabularySentence>(stores.sentences, { index: "vocabularyId", query: vocabularyId, offset: sentencePage * sentencePageSize, limit: sentencePageSize }),
      item.sourceId ? englishAcademyDb.get<VocabularySource>(stores.vocabularySources, item.sourceId) : Promise.resolve(undefined),
    ]);
    return { ...entry, sentences: sentencePageResult.items, sentencePage, sentencePageSize, sentenceTotal: sentencePageResult.total, hasMoreSentences: (sentencePage + 1) * sentencePageSize < sentencePageResult.total, source };
  }

  async getVocabularySentences(vocabularyId: string, page = 0, pageSize = 6) {
    await this.seedIfNeeded();
    const result = await englishAcademyDb.getPage<VocabularySentence>(stores.sentences, { index: "vocabularyId", query: vocabularyId, offset: Math.max(0, page) * pageSize, limit: Math.min(12, Math.max(3, pageSize)) });
    return { sentences: result.items, page, pageSize, total: result.total, hasMore: (page + 1) * pageSize < result.total };
  }

  async getLibraryCategories(): Promise<LibraryCategory[]> {
    await this.seedIfNeeded({ waitForCorpus: false });
    return (await englishAcademyDb.getAll<LibraryCategory>(stores.libraryCategories)).sort((a, b) => a.order - b.order);
  }

  private async libraryCandidates(filters: Pick<LibraryResourceFilters, "categoryId" | "type" | "level">): Promise<LibraryResource[]> {
    let records: LibraryResource[];
    if (filters.categoryId && filters.type) records = await englishAcademyDb.getByIndex<LibraryResource>(stores.libraryResources, "categoryType", [filters.categoryId, filters.type]);
    else if (filters.type && filters.level) records = await englishAcademyDb.getByIndex<LibraryResource>(stores.libraryResources, "typeLevel", [filters.type, filters.level]);
    else if (filters.categoryId) records = await englishAcademyDb.getByIndex<LibraryResource>(stores.libraryResources, "categoryId", filters.categoryId);
    else if (filters.type) records = await englishAcademyDb.getByIndex<LibraryResource>(stores.libraryResources, "type", filters.type);
    else if (filters.level) records = await englishAcademyDb.getByIndex<LibraryResource>(stores.libraryResources, "level", filters.level);
    else {
      const categories = await this.getLibraryCategories();
      const categoryGroups = await Promise.all(categories.map((category) => englishAcademyDb.getByIndex<LibraryResource>(stores.libraryResources, "categoryId", category.id)));
      records = categoryGroups.reduce<LibraryResource[]>((all, group) => all.concat(group), []);
    }
    return records.filter((item) => (!filters.level || item.level === filters.level) && (!filters.type || item.type === filters.type)).sort((a, b) => a.title.localeCompare(b.title));
  }

  async getLibraryResources(filters: LibraryResourceFilters = {}) {
    await this.seedIfNeeded({ waitForCorpus: false });
    const page = Math.max(0, filters.page ?? 0); const pageSize = Math.min(48, Math.max(6, filters.pageSize ?? 18)); const records = await this.libraryCandidates(filters); const start = page * pageSize;
    return { items: records.slice(start, start + pageSize), page, pageSize, total: records.length, hasMore: start + pageSize < records.length };
  }

  async getLibraryResource(resourceId: string): Promise<LibraryResource | undefined> { await this.seedIfNeeded({ waitForCorpus: false }); return englishAcademyDb.get<LibraryResource>(stores.libraryResources, resourceId); }

  async getLibraryResourceState(resourceId: string): Promise<{ saved: boolean; activity?: LibraryActivity; note?: PersonalNote }> {
    await this.seedIfNeeded({ waitForCorpus: false });
    const [bookmark, activity, note] = await Promise.all([
      englishAcademyDb.getByIndex<Bookmark>(stores.bookmarks, "userContent", [learnerId, resourceId]),
      englishAcademyDb.getByIndex<LibraryActivity>(stores.libraryActivities, "userResource", [learnerId, resourceId]),
      englishAcademyDb.getByIndex<PersonalNote>(stores.notes, "userContent", [learnerId, resourceId]),
    ]);
    return { saved: bookmark.some((item) => item.contentType === "library"), activity: activity[0], note: note[0] };
  }

  async recordLibraryResourceView(resourceId: string, patch: Pick<LibraryActivity, "lastPosition" | "lastSectionId" | "practicedAt"> = {}): Promise<LibraryActivity> {
    await this.seedIfNeeded({ waitForCorpus: false });
    const resource = await englishAcademyDb.get<LibraryResource>(stores.libraryResources, resourceId);
    if (!resource) throw new AppError("ContentError", "Library resource-টি খুঁজে পাওয়া যায়নি। ");
    const current = (await englishAcademyDb.getByIndex<LibraryActivity>(stores.libraryActivities, "userResource", [learnerId, resourceId]))[0]; const now = timestamp();
    const activity: LibraryActivity = { id: current?.id ?? `library-activity-${learnerId}-${resourceId}`, schemaVersion: 10, updatedAt: now, userId: learnerId, resourceId, viewCount: (current?.viewCount ?? 0) + 1, firstViewedAt: current?.firstViewedAt ?? now, lastViewedAt: now, lastPosition: patch.lastPosition ?? current?.lastPosition, lastSectionId: patch.lastSectionId ?? current?.lastSectionId, practicedAt: patch.practicedAt ?? current?.practicedAt };
    await englishAcademyDb.put(stores.libraryActivities, activity); return activity;
  }

  async getLibrarySavedResources(): Promise<LibraryResource[]> {
    await this.seedIfNeeded({ waitForCorpus: false });
    const bookmarks = await englishAcademyDb.getByIndex<Bookmark>(stores.bookmarks, "userType", [learnerId, "library"]);
    const records = await Promise.all(bookmarks.map((bookmark) => englishAcademyDb.get<LibraryResource>(stores.libraryResources, bookmark.contentId)));
    return records.filter((item): item is LibraryResource => Boolean(item)).sort((a, b) => a.title.localeCompare(b.title));
  }

  async getRecentLibraryResources(limit = 4): Promise<Array<{ resource: LibraryResource; activity: LibraryActivity }>> {
    await this.seedIfNeeded({ waitForCorpus: false });
    const activities = await englishAcademyDb.getPage<LibraryActivity>(stores.libraryActivities, { index: "userViewed", query: IDBKeyRange.bound([learnerId, ""], [learnerId, "\uffff"]), limit: Math.max(1, Math.min(8, limit)), direction: "prev" });
    const records = await Promise.all(activities.items.map(async (activity) => ({ activity, resource: await englishAcademyDb.get<LibraryResource>(stores.libraryResources, activity.resourceId) })));
    return records.filter((item): item is { resource: LibraryResource; activity: LibraryActivity } => Boolean(item.resource));
  }

  async getLibrarySearchHistory(limit = 8): Promise<LibrarySearchHistory[]> {
    await this.seedIfNeeded({ waitForCorpus: false });
    const records = await englishAcademyDb.getByIndexRange<LibrarySearchHistory>(stores.librarySearchHistory, "userSearched", IDBKeyRange.bound([learnerId, ""], [learnerId, "\uffff"])); const seen = new Set<string>();
    return records.sort((a, b) => b.searchedAt.localeCompare(a.searchedAt)).filter((item) => !seen.has(item.normalizedQuery) && Boolean(seen.add(item.normalizedQuery))).slice(0, Math.max(1, limit));
  }

  async searchLibrary(filters: LibrarySearchFilters): Promise<LibrarySearchResult> {
    await this.seedIfNeeded({ waitForCorpus: false });
    const tokens = normalizeSearchTerms(filters.query); const page = Math.max(0, filters.page ?? 0); const pageSize = Math.min(40, Math.max(6, filters.pageSize ?? 18));
    if (!tokens.length) return { hits: [], groups: [], page, pageSize, total: 0, hasMore: false };
    const resourceGroups = await Promise.all(tokens.map((token) => englishAcademyDb.getByIndex<LibraryResource>(stores.libraryResources, "searchTerms", token)));
    const first = resourceGroups[0] ?? []; const matchedResources = first.filter((item) => resourceGroups.every((group) => group.some((candidate) => candidate.id === item.id))).filter((item) => (!filters.type || item.type === filters.type) && (!filters.level || item.level === filters.level));
    const normalizedQuery = tokens.join(" ");
    const libraryHits: LibrarySearchHit[] = matchedResources.map((item) => ({ id: item.id, source: "library", title: item.title, banglaTitle: item.banglaTitle, summary: item.summary, type: item.type, level: item.level, route: `/library/${item.id}`, matchedTerms: tokens }));
    const startsEnglish = /^[a-z]/i.test(tokens[0]);
    const initial = tokens[0].slice(0, 1); const vocabularyHits: LibrarySearchHit[] = filters.includeVocabulary === false || !startsEnglish ? [] : (await englishAcademyDb.getByIndexRange<VocabularyItem>(stores.vocabulary, "lemma", IDBKeyRange.bound(initial, `${initial}\uffff`))).filter((item) => [item.word, item.lemma, item.meaning].some((value) => value?.toLocaleLowerCase("en-US").includes(normalizedQuery)) && (!filters.level || item.level === filters.level)).slice(0, 10).map((item) => ({ id: item.id, source: "vocabulary", title: item.word, banglaTitle: item.meaning, summary: `${item.partOfSpeech} · ${item.topic}`, type: "vocabulary", level: item.level, route: `/vocabulary/${encodeURIComponent(item.word)}`, matchedTerms: tokens }));
    const ranked = [...libraryHits, ...vocabularyHits].sort((a, b) => (Number(b.title.toLocaleLowerCase("en-US").startsWith(normalizedQuery)) - Number(a.title.toLocaleLowerCase("en-US").startsWith(normalizedQuery))) || a.title.localeCompare(b.title));
    const start = page * pageSize; const hits = ranked.slice(start, start + pageSize); const types = Array.from(new Set(hits.map((hit) => hit.type))); const groups = types.map((type) => ({ type, items: hits.filter((hit) => hit.type === type) }));
    const now = timestamp(); await englishAcademyDb.put(stores.librarySearchHistory, { id: `library-search-${crypto.randomUUID()}`, schemaVersion: 10, updatedAt: now, userId: learnerId, query: filters.query.trim(), normalizedQuery, searchedAt: now, resultCount: ranked.length });
    return { hits, groups, page, pageSize, total: ranked.length, hasMore: start + pageSize < ranked.length };
  }

  async saveDiagnosticResult(result: DiagnosticResult): Promise<PersonalStudyPath> {
    await this.updateSettings({ diagnosticResult: result, dailyGoalMinutes: result.suggestedLevel === "Pre-A1" || result.suggestedLevel === "A1" ? 15 : 20 });
    return this.getPersonalStudyPath();
  }

  async getPersonalStudyPath(): Promise<PersonalStudyPath> {
    const [settings, roadmap] = await Promise.all([this.getSettings(), this.getRoadmap()]);
    const diagnostic = settings.diagnosticResult;
    const targetLevel = diagnostic?.suggestedLevel ?? "A1";
    const focusSkill = diagnostic?.focusSkill ?? "vocabulary";
    const levelRoadmap = roadmap.filter((item) => item.levelId.includes(targetLevel.toLocaleLowerCase("en-US")) && item.unlocked);
    const candidate = levelRoadmap.find((item) => !item.completed)?.lesson ?? roadmap.find((item) => item.unlocked && !item.completed)?.lesson;
    return {
      diagnostic,
      status: diagnostic ? "ready" : "diagnostic-needed",
      targetLevel,
      focusSkill,
      dailyGoalMinutes: settings.dailyGoalMinutes,
      nextLessonId: candidate?.id,
      reviewFocus: focusSkill === "grammar" ? "grammar" : "vocabulary",
      message: diagnostic ? `তোমার ${targetLevel} study path ${focusSkill} skill-কে অগ্রাধিকার দিচ্ছে।` : "একটি সংক্ষিপ্ত diagnostic দিয়ে তোমার শুরু করার level ও focus নির্ধারণ করো।",
    };
  }

  async getSrsCard(vocabularyId: string): Promise<SRSCard> {
    await this.seedIfNeeded(); const saved = (await englishAcademyDb.getByIndex<SRSCard>(stores.srsCards, "userVocabulary", [learnerId, vocabularyId]))[0];
    return saved ?? new VocabularySrsScheduler().createCard(learnerId, vocabularyId);
  }

  async updateVocabularyMastery(vocabularyId: string, masteryState: SRSCard["masteryState"]): Promise<SRSCard> {
    const now = timestamp(); const prior = await this.getSrsCard(vocabularyId); const card = { ...prior, updatedAt: now, masteryState, nextReviewAt: masteryState === "mastered" ? new Date(Date.now() + 30 * 86400000).toISOString() : prior.nextReviewAt };
    await englishAcademyDb.put(stores.srsCards, card); return card;
  }

  private async getCardsByMastery(masteryState: SRSCard["masteryState"], limit = 12) {
    const cards = await englishAcademyDb.getPage<SRSCard>(stores.srsCards, { index: "userMastery", query: [learnerId, masteryState], limit });
    return (await Promise.all(cards.items.map(async (card) => { const item = await englishAcademyDb.get<VocabularyItem>(stores.vocabulary, card.vocabularyId); return item ? this.entryForVocabulary(item) : undefined; }))).filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
  }

  async getVocabularyReviewQueue(): Promise<VocabularyReviewQueue> {
    await this.seedIfNeeded(); const now = new Date(); const endOfDay = new Date(now); endOfDay.setHours(23, 59, 59, 999);
    const dueCards = await englishAcademyDb.getFilteredPage<SRSCard>(stores.srsCards, { index: "nextReview", query: IDBKeyRange.upperBound(endOfDay.toISOString()), limit: 24, matches: (card) => card.userId === learnerId });
    const dueEntries = (await Promise.all(dueCards.items.map(async (card) => { const item = await englishAcademyDb.get<VocabularyItem>(stores.vocabulary, card.vocabularyId); return item ? this.entryForVocabulary(item) : undefined; }))).filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
    return {
      overdue: dueEntries.filter((entry) => entry.srsCard && entry.srsCard.nextReviewAt < now.toISOString()), dueToday: dueEntries.filter((entry) => entry.srsCard && entry.srsCard.nextReviewAt >= now.toISOString()),
      newItems: (await this.searchVocabulary({ masteryState: "new", pageSize: 12 })).entries, learning: await this.getCardsByMastery("learning"), review: [...await this.getCardsByMastery("familiar", 6), ...await this.getCardsByMastery("strong", 6)], mastered: await this.getCardsByMastery("mastered"),
    };
  }

  async importVocabularyBatch(input: unknown): Promise<VocabularyImportReport> {
    await this.seedIfNeeded(); const knownSources = await englishAcademyDb.getAll<VocabularySource>(stores.vocabularySources); const batch = importVocabularyPackage(input, knownSources);
    const sourceMap = new Map([...knownSources, ...batch.sources].map((source) => [source.id, source]));
    for (const item of batch.vocabulary) validateVocabularyLicense(item, sourceMap);
    for (const sentence of batch.sentences) validateSentenceLicense(sentence, sourceMap);
    const uniqueItems: VocabularyItem[] = [];
    for (let start = 0; start < batch.vocabulary.length; start += 250) {
      const chunk = batch.vocabulary.slice(start, start + 250);
      const existing = await Promise.all(chunk.map((item) => englishAcademyDb.getByIndex<VocabularyItem>(stores.vocabulary, "lemma", item.lemma!)));
      chunk.forEach((item, index) => { if (existing[index].length) { batch.report.duplicates += 1; batch.report.skipped += 1; batch.report.imported -= 1; } else uniqueItems.push(item); });
    }
    await englishAcademyDb.putMany(stores.vocabularySources, batch.sources);
    for (let start = 0; start < uniqueItems.length; start += corpusChunkSize) await englishAcademyDb.putMany(stores.vocabulary, uniqueItems.slice(start, start + corpusChunkSize));
    for (let start = 0; start < batch.sentences.length; start += corpusChunkSize) await englishAcademyDb.putMany(stores.sentences, batch.sentences.slice(start, start + corpusChunkSize));
    return batch.report;
  }

  async importGrammarBatch(concepts: GrammarConcept[]): Promise<void> {
    await this.seedIfNeeded(); const [sources, questions] = await Promise.all([englishAcademyDb.getAll<VocabularySource>(stores.vocabularySources), englishAcademyDb.getAll<Question>(stores.questions)]);
    validateGrammarConcepts(concepts, sources, questions.map((question) => question.id)); await Promise.all(concepts.map((concept) => englishAcademyDb.put(stores.grammarConcepts, concept)));
  }

  async getGrammarConcepts(filters: GrammarConceptFilters = {}) {
    await this.seedIfNeeded(); const page = Math.max(0, filters.page ?? 0); const pageSize = Math.min(100, Math.max(8, filters.pageSize ?? 24));
    const index = filters.level && filters.category ? "levelCategory" : filters.level ? "level" : filters.category ? "category" : undefined; const query = filters.level && filters.category ? [filters.level, filters.category] : filters.level ?? filters.category;
    const result = await englishAcademyDb.getFilteredPage<GrammarConcept>(stores.grammarConcepts, { index, query, offset: page * pageSize, limit: pageSize, matches: (item) => (!filters.level || item.level === filters.level) && (!filters.category || item.category === filters.category) });
    return { items: result.items, page, pageSize, total: result.total, hasMore: (page + 1) * pageSize < result.total };
  }

  async getGrammarConcept(conceptId: string): Promise<GrammarConcept> { await this.seedIfNeeded(); const concept = await englishAcademyDb.get<GrammarConcept>(stores.grammarConcepts, conceptId); if (!concept) throw new AppError("ContentError", "Grammar concept খুঁজে পাওয়া যায়নি।"); return concept; }

  async getGrammarTopics(): Promise<GrammarTopic[]> { await this.seedIfNeeded(); return (await englishAcademyDb.getAll<GrammarTopic>(stores.grammarTopics)).sort((a, b) => a.title.localeCompare(b.title)); }
  async getVocabulary(): Promise<VocabularyItem[]> { await this.seedIfNeeded(); return (await englishAcademyDb.getAll<VocabularyItem>(stores.vocabulary)).sort((a, b) => a.word.localeCompare(b.word)); }
  async getVocabularyEntries(): Promise<VocabularyEntry[]> { const [items, progress] = await Promise.all([this.getVocabulary(), englishAcademyDb.getAll<UserVocabularyProgress>(stores.vocabularyProgress)]); return items.map((item) => ({ item, progress: progress.find((record) => record.userId === learnerId && record.vocabularyId === item.id) })); }
  async getPracticeQuestions(filters: { skill?: "grammar" | "vocabulary"; difficulty?: number; count: number }): Promise<Question[]> { await this.seedIfNeeded(); const questions = await englishAcademyDb.getAll<Question>(stores.questions); return questions.filter((question) => (!filters.skill || question.skill === filters.skill) && (!filters.difficulty || question.difficulty === filters.difficulty)).sort(() => 0.5 - Math.random()).slice(0, filters.count); }
  async getDueReviewItems(): Promise<ReviewItem[]> { await this.seedIfNeeded({ waitForCorpus: false }); return new IntervalReviewScheduler().getDueItems(await englishAcademyDb.getAll<ReviewItem>(stores.reviewItems)); }

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
  async recordFlashcardReview(vocabularyId: string, rating: FlashcardRating): Promise<void> {
    await this.seedIfNeeded(); const now = timestamp(); const correct = rating === "good" || rating === "easy";
    await this.recordVocabularyRecall(vocabularyId, correct, now);
    const reviewId = `review-vocabulary-${vocabularyId}`; const prior = await englishAcademyDb.get<ReviewItem>(stores.reviewItems, reviewId);
    const base: ReviewItem = prior ?? { id: reviewId, schemaVersion: 5, updatedAt: now, userId: learnerId, itemId: vocabularyId, itemType: "vocabulary", masteryScore: 0, confidence: 0, attemptCount: 0, correctCount: 0, wrongCount: 0, nextReviewAt: now, reviewLevel: 0 };
    const reviewed = rating === "again" ? new IntervalReviewScheduler().recordFailure(base) : new IntervalReviewScheduler().recordSuccess(base);
    const srsCard = new VocabularySrsScheduler().record(await this.getSrsCard(vocabularyId), rating);
    const progress = (await englishAcademyDb.getByIndex<UserVocabularyProgress>(stores.vocabularyProgress, "userVocabulary", [learnerId, vocabularyId]))[0];
    await Promise.all([
      englishAcademyDb.put(stores.reviewItems, { ...reviewed, schemaVersion: 5, updatedAt: now, confidence: rating === "easy" ? 3 : rating === "good" ? 2 : rating === "hard" ? 1 : 0, masteryScore: scoreForAttempts(reviewed.correctCount, reviewed.wrongCount) }),
      englishAcademyDb.put(stores.srsCards, srsCard),
      progress ? englishAcademyDb.put(stores.vocabularyProgress, { ...progress, schemaVersion: 5, updatedAt: now, masteryState: srsCard.masteryState }) : Promise.resolve(),
    ]);
  }

  async getWritingDraft(promptId: string): Promise<WritingDraft | undefined> { await this.seedIfNeeded({ waitForCorpus: false }); return (await englishAcademyDb.getByIndex<WritingDraft>(stores.writingDrafts, "userPrompt", [learnerId, promptId]))[0]; }
  async saveWritingDraft(promptId: string, text: string, submitted = false): Promise<WritingDraft> { await this.seedIfNeeded({ waitForCorpus: false }); const now = timestamp(); const existing = await this.getWritingDraft(promptId); const draft: WritingDraft = { id: existing?.id ?? `draft-${learnerId}-${promptId}`, schemaVersion: 4, updatedAt: now, userId: learnerId, promptId, text, submittedAt: submitted ? now : existing?.submittedAt }; await englishAcademyDb.put(stores.writingDrafts, draft); return draft; }
  async getSkillActivities(filters: SkillActivityFilters = {}): Promise<SkillActivityPage> {
    await this.seedIfNeeded({ waitForCorpus: false });
    const page = Math.max(1, filters.page ?? 1); const pageSize = Math.min(30, Math.max(1, filters.pageSize ?? 12));
    let index: string | undefined; let query: IDBValidKey | undefined;
    if (filters.skill && filters.level) { index = "skillLevel"; query = [filters.skill, filters.level]; }
    else if (filters.skill && filters.stage) { index = "skillStage"; query = [filters.skill, filters.stage]; }
    else if (filters.skill) { index = "skill"; query = filters.skill; }
    else if (filters.level) { index = "level"; query = filters.level; }
    else if (filters.stage) { index = "stage"; query = filters.stage; }
    // The compact local lab catalogue is intentionally capped at a small first-run set.
    // Indexed retrieval avoids long-lived cursor transactions in fresh GitHub Pages sessions.
    const candidates = index ? await englishAcademyDb.getByIndex<SkillActivity>(stores.skillActivities, index, query!) : await englishAcademyDb.getAll<SkillActivity>(stores.skillActivities);
    const filtered = candidates
      .filter((activity) => (!filters.skill || activity.skill === filters.skill) && (!filters.level || activity.level === filters.level) && (!filters.stage || activity.stage === filters.stage) && (!filters.topic || activity.topic === filters.topic))
      .sort((a, b) => a.title.localeCompare(b.title));
    const offset = (page - 1) * pageSize;
    return { activities: filtered.slice(offset, offset + pageSize), page, pageSize, total: filtered.length, hasMore: page * pageSize < filtered.length };
  }
  async getSkillActivity(activityId: string): Promise<SkillActivity | undefined> { await this.seedIfNeeded({ waitForCorpus: false }); return englishAcademyDb.get<SkillActivity>(stores.skillActivities, activityId); }
  async getPhrases(filters: { topic?: string; level?: import("@/domain/learning/types").LevelCode } = {}): Promise<Phrase[]> {
    await this.seedIfNeeded({ waitForCorpus: false });
    const values = filters.topic && filters.level ? await englishAcademyDb.getByIndex<Phrase>(stores.phrases, "topicLevel", [filters.topic, filters.level]) : filters.topic ? await englishAcademyDb.getByIndex<Phrase>(stores.phrases, "topic", filters.topic) : filters.level ? await englishAcademyDb.getByIndex<Phrase>(stores.phrases, "level", filters.level) : await englishAcademyDb.getAll<Phrase>(stores.phrases);
    return values.sort((a, b) => a.phrase.localeCompare(b.phrase));
  }
  async recordSkillAttempt(input: { activityId: string; response?: string; selectedOptionId?: string; confidence?: SkillConfidence; timeSpentSeconds?: number }): Promise<{ attempt: SkillAttempt; activity: SkillActivity; mastery: SkillMastery }> {
    await this.seedIfNeeded({ waitForCorpus: false });
    const activity = await this.getSkillActivity(input.activityId);
    if (!activity) throw new AppError("ContentError", "Skill activity-টি খুঁজে পাওয়া যায়নি।");
    const priorAttempts = await englishAcademyDb.getByIndex<SkillAttempt>(stores.skillAttempts, "userActivity", [learnerId, activity.id]);
    const correctId = activity.content.correctOptionId;
    const isCorrect = correctId ? input.selectedOptionId === correctId : undefined;
    const now = timestamp();
    const attempt: SkillAttempt = { id: `skill-attempt-${crypto.randomUUID()}`, schemaVersion: 6, updatedAt: now, userId: learnerId, activityId: activity.id, skill: activity.skill, stage: activity.stage, response: input.response, selectedOptionId: input.selectedOptionId, isCorrect, score: isCorrect === undefined ? undefined : isCorrect ? 100 : 0, confidence: input.confidence, attempts: priorAttempts.length + 1, timeSpentSeconds: input.timeSpentSeconds, submittedAt: now, feedbackState: isCorrect === undefined ? "manual-review" : "instant" };
    await englishAcademyDb.put(stores.skillAttempts, attempt);
    if (isCorrect === false) {
      const existing = (await englishAcademyDb.getByIndex<SkillError>(stores.skillErrors, "userActivity", [learnerId, activity.id])).find((item) => !item.resolved);
      const error: SkillError = existing ? { ...existing, updatedAt: now, timestamp: now, frequency: existing.frequency + 1, userResponse: input.response ?? input.selectedOptionId } : { id: `skill-error-${crypto.randomUUID()}`, schemaVersion: 6, updatedAt: now, userId: learnerId, activityId: activity.id, skill: activity.skill, type: activity.kind, content: activity.title, userResponse: input.response ?? input.selectedOptionId, correctResponse: activity.content.options?.find((option) => option.id === correctId)?.text, explanation: activity.content.explanation ?? "সঠিক উত্তরটি আবার দেখে ধীরে অনুশীলন করো।", timestamp: now, frequency: 1, resolved: false };
      await englishAcademyDb.put(stores.skillErrors, error);
    }
    const mastery = await this.refreshSkillMastery(activity.skill);
    return { attempt, activity, mastery };
  }
  private async refreshSkillMastery(skill: LabSkill): Promise<SkillMastery> {
    const attempts = await englishAcademyDb.getByIndex<SkillAttempt>(stores.skillAttempts, "userSkill", [learnerId, skill]);
    const existing = (await englishAcademyDb.getByIndex<SkillMastery>(stores.skillMastery, "userSkill", [learnerId, skill]))[0];
    const completed = new Set(attempts.map((item) => item.activityId)).size; const scored = attempts.filter((item) => typeof item.isCorrect === "boolean");
    const correctCount = scored.filter((item) => item.isCorrect).length; const accuracy = scored.length ? Math.round((correctCount / scored.length) * 100) : undefined;
    const state: SkillMasteryState = completed === 0 ? "not-started" : completed < 3 ? "learning" : scored.length === 0 || accuracy === undefined || accuracy < 70 ? "practicing" : completed >= 12 && accuracy >= 85 ? "mastered" : completed >= 5 && accuracy >= 70 ? "strong" : "practicing";
    const latest = attempts.slice().sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))[0]; const now = timestamp();
    const mastery: SkillMastery = { id: existing?.id ?? `skill-mastery-${learnerId}-${skill}`, schemaVersion: 6, updatedAt: now, userId: learnerId, skill, state, activitiesCompleted: completed, attemptCount: attempts.length, correctCount, accuracy, totalTimeSeconds: attempts.reduce((sum, item) => sum + (item.timeSpentSeconds ?? 0), 0), latestConfidence: latest?.confidence, lastActivityAt: latest?.submittedAt };
    await englishAcademyDb.put(stores.skillMastery, mastery); return mastery;
  }
  async getSkillMastery(): Promise<SkillMastery[]> {
    await this.seedIfNeeded({ waitForCorpus: false });
    const skills: LabSkill[] = ["listening", "pronunciation", "speaking", "reading", "writing", "communication"];
    const persisted = await englishAcademyDb.getAll<SkillMastery>(stores.skillMastery); const bySkill = new Map(persisted.filter((item) => item.userId === learnerId).map((item) => [item.skill, item]));
    return skills.map((skill) => bySkill.get(skill) ?? { id: `skill-mastery-${learnerId}-${skill}`, schemaVersion: 6, updatedAt: timestamp(), userId: learnerId, skill, state: "not-started", activitiesCompleted: 0, attemptCount: 0, correctCount: 0, totalTimeSeconds: 0 });
  }
  async getSkillErrors(skill?: LabSkill): Promise<SkillError[]> { await this.seedIfNeeded({ waitForCorpus: false }); const values = skill ? await englishAcademyDb.getByIndex<SkillError>(stores.skillErrors, "userSkill", [learnerId, skill]) : await englishAcademyDb.getAll<SkillError>(stores.skillErrors); return values.filter((item) => item.userId === learnerId && !item.resolved).sort((a, b) => b.timestamp.localeCompare(a.timestamp)); }
  async getSkillRecommendations(): Promise<SkillRecommendation[]> {
    const mastery = await this.getSkillMastery();
    const weak = mastery.filter((item) => item.activitiesCompleted > 0 && item.accuracy !== undefined && item.accuracy < 70);
    const labels: Record<LabSkill, { title: string; banglaTitle: string }> = { listening: { title: "Listening recovery", banglaTitle: "Listening পুনরুদ্ধার" }, pronunciation: { title: "Minimal-pair practice", banglaTitle: "Minimal pair অনুশীলন" }, speaking: { title: "Guided speaking", banglaTitle: "নির্দেশিত speaking" }, reading: { title: "Reading detail check", banglaTitle: "Reading detail check" }, writing: { title: "Writing review", banglaTitle: "Writing review" }, communication: { title: "Communication rehearsal", banglaTitle: "Communication rehearsal" } };
    const catalogue = await this.getSkillActivities({ pageSize: 30 });
    return weak.map((item) => ({ skill: item.skill, ...labels[item.skill], reason: `Recorded accuracy ${item.accuracy}% after ${item.attemptCount} attempt${item.attemptCount === 1 ? "" : "s"}.`, activityId: catalogue.activities.find((activity) => activity.skill === item.skill && activity.stage === "guided-practice")?.id }));
  }
  async toggleBookmark(contentId: string, contentType: Bookmark["contentType"]): Promise<boolean> { await this.seedIfNeeded(); const existing = (await englishAcademyDb.getByIndex<Bookmark>(stores.bookmarks, "userContent", [learnerId, contentId]))[0]; if (existing) { await englishAcademyDb.delete(stores.bookmarks, existing.id); return false; } const now = timestamp(); await englishAcademyDb.put(stores.bookmarks, { id: `bookmark-${learnerId}-${contentId}`, schemaVersion: 4, updatedAt: now, userId: learnerId, contentId, contentType, createdAt: now }); return true; }
  async saveNote(contentId: string, text: string): Promise<PersonalNote> { await this.seedIfNeeded({ waitForCorpus: false }); const now = timestamp(); const existing = (await englishAcademyDb.getByIndex<PersonalNote>(stores.notes, "userContent", [learnerId, contentId]))[0]; const note: PersonalNote = { id: existing?.id ?? `note-${learnerId}-${contentId}`, schemaVersion: 4, updatedAt: now, userId: learnerId, contentId, text }; await englishAcademyDb.put(stores.notes, note); return note; }
  async getNote(contentId: string): Promise<PersonalNote | undefined> { await this.seedIfNeeded({ waitForCorpus: false }); return (await englishAcademyDb.getByIndex<PersonalNote>(stores.notes, "userContent", [learnerId, contentId]))[0]; }
  async getMistakes(): Promise<MistakeBundle[]> { await this.seedIfNeeded(); const [records, questions] = await Promise.all([englishAcademyDb.getAll<MistakeRecord>(stores.mistakes), englishAcademyDb.getAll<Question>(stores.questions)]); return records.filter((record) => record.userId === learnerId && !record.resolved).sort((a, b) => b.timestamp.localeCompare(a.timestamp)).map((record) => ({ record, question: questions.find((question) => question.id === record.questionId) })); }
  async getProgressSnapshot() { await this.seedIfNeeded(); const [roadmap, vocabulary, mistakes, attempts, reviews] = await Promise.all([this.getRoadmap(), this.getVocabularyEntries(), this.getMistakes(), englishAcademyDb.getAll<Attempt>(stores.attempts), this.getDueReviewItems()]); const completed = roadmap.filter((item) => item.completed).length; const learned = vocabulary.filter((entry) => entry.progress?.learned).length; const skills = (["grammar", "vocabulary", "reading", "listening", "speaking", "writing", "pronunciation"] as Skill[]).map((skill) => { const relevant = attempts.filter((attempt) => attempt.userId === learnerId && (phase2Seed.questions.find((question) => question.id === attempt.questionId)?.skill === skill)); return { skill, attempts: relevant.length, correct: relevant.filter((attempt) => attempt.isCorrect).length }; }); return { completed, totalLessons: roadmap.length, learned, totalVocabulary: vocabulary.length, mistakes: mistakes.length, reviewDue: reviews.length, skills, lastLessonId: (await this.getSettings()).lastLessonId, next: await this.getContinueLearning() }; }

  async exportUserData() { await this.seedIfNeeded(); const [settings, progress, activityProgress, vocabularyProgress, attempts, mistakes, reviewItems, writingDrafts, bookmarks, notes, objectives, sessions, skillAttempts, skillErrors, skillMastery, assessmentSessions, assessmentAnswers, assessmentResults, educationalCertificates] = await Promise.all([this.getSettings(), englishAcademyDb.getAll<UserLessonProgress>(stores.progress), englishAcademyDb.getAll<UserActivityProgress>(stores.activityProgress), englishAcademyDb.getAll<UserVocabularyProgress>(stores.vocabularyProgress), englishAcademyDb.getAll<Attempt>(stores.attempts), englishAcademyDb.getAll<MistakeRecord>(stores.mistakes), englishAcademyDb.getAll<ReviewItem>(stores.reviewItems), englishAcademyDb.getAll<WritingDraft>(stores.writingDrafts), englishAcademyDb.getAll<Bookmark>(stores.bookmarks), englishAcademyDb.getAll<PersonalNote>(stores.notes), englishAcademyDb.getAll<ObjectiveProgress>(stores.objectives), englishAcademyDb.getAll<LearningSession>(stores.sessions), englishAcademyDb.getAll<SkillAttempt>(stores.skillAttempts), englishAcademyDb.getAll<SkillError>(stores.skillErrors), englishAcademyDb.getAll<SkillMastery>(stores.skillMastery), englishAcademyDb.getAll<AssessmentSession>(stores.assessmentSessions), englishAcademyDb.getAll<AssessmentAnswer>(stores.assessmentAnswers), englishAcademyDb.getAll<AssessmentResult>(stores.assessmentResults), englishAcademyDb.getAll<EducationalCertificate>(stores.educationalCertificates)]); return { format: "english-academy-user-data", version: 5, exportedAt: timestamp(), settings, progress, activityProgress, vocabularyProgress, attempts, mistakes, reviewItems, writingDrafts, bookmarks, notes, objectives, sessions, skillAttempts, skillErrors, skillMastery, assessmentSessions, assessmentAnswers, assessmentResults, educationalCertificates }; }
  async importUserData(value: unknown): Promise<void> { const data = value as Record<string, unknown>; if (!data || data.format !== "english-academy-user-data" || !Array.isArray(data.progress)) throw new AppError("ContentError", "এই ফাইলটি English Academy backup নয়। "); await this.resetUserData(); const collections: Array<[typeof stores.progress | typeof stores.activityProgress | typeof stores.vocabularyProgress | typeof stores.attempts | typeof stores.mistakes | typeof stores.reviewItems | typeof stores.writingDrafts | typeof stores.bookmarks | typeof stores.notes | typeof stores.objectives | typeof stores.sessions | typeof stores.skillAttempts | typeof stores.skillErrors | typeof stores.skillMastery | typeof stores.assessmentSessions | typeof stores.assessmentAnswers | typeof stores.assessmentResults | typeof stores.educationalCertificates, unknown]> = [[stores.progress, data.progress], [stores.activityProgress, data.activityProgress], [stores.vocabularyProgress, data.vocabularyProgress], [stores.attempts, data.attempts], [stores.mistakes, data.mistakes], [stores.reviewItems, data.reviewItems], [stores.writingDrafts, data.writingDrafts], [stores.bookmarks, data.bookmarks], [stores.notes, data.notes], [stores.objectives, data.objectives], [stores.sessions, data.sessions], [stores.skillAttempts, data.skillAttempts], [stores.skillErrors, data.skillErrors], [stores.skillMastery, data.skillMastery], [stores.assessmentSessions, data.assessmentSessions], [stores.assessmentAnswers, data.assessmentAnswers], [stores.assessmentResults, data.assessmentResults], [stores.educationalCertificates, data.educationalCertificates]]; await Promise.all(collections.flatMap(([store, values]) => Array.isArray(values) ? values.map((item) => englishAcademyDb.put(store, item)) : [])); if (data.settings && typeof data.settings === "object") await englishAcademyDb.put(stores.settings, { ...defaultSettings(), ...(data.settings as AppSettings), id: settingsId, seedVersion }); }
  async resetUserData(): Promise<void> { await this.seedIfNeeded(); const settings = await this.getSettings(); await Promise.all([englishAcademyDb.clear(stores.progress), englishAcademyDb.clear(stores.activityProgress), englishAcademyDb.clear(stores.vocabularyProgress), englishAcademyDb.clear(stores.attempts), englishAcademyDb.clear(stores.mistakes), englishAcademyDb.clear(stores.reviewItems), englishAcademyDb.clear(stores.writingDrafts), englishAcademyDb.clear(stores.bookmarks), englishAcademyDb.clear(stores.notes), englishAcademyDb.clear(stores.objectives), englishAcademyDb.clear(stores.sessions), englishAcademyDb.clear(stores.skillAttempts), englishAcademyDb.clear(stores.skillErrors), englishAcademyDb.clear(stores.skillMastery), englishAcademyDb.clear(stores.assessmentSessions), englishAcademyDb.clear(stores.assessmentAnswers), englishAcademyDb.clear(stores.assessmentResults), englishAcademyDb.clear(stores.educationalCertificates), englishAcademyDb.put(stores.settings, { ...settings, lastLessonId: undefined, updatedAt: timestamp() })]); }
}

export const learningRepository = new LearningRepository();
