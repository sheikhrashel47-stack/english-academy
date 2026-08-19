/** Emerald Study House / Phase 3: license-aware, offline-first learning contracts for a large corpus. */

export type EntityId = string;
export type LevelCode = "Pre-A1" | "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type Skill = "grammar" | "vocabulary" | "pronunciation" | "listening" | "speaking" | "reading" | "writing" | "communication";
export type LanguageMode = "bangla" | "mixed" | "immersion";
export type ContentStatus = "draft" | "published" | "archived";
export type DifficultyBand = "beginner" | "elementary" | "intermediate" | "upper-intermediate" | "advanced";
export type PrerequisiteKind = "lesson" | "unit" | "level";
export type LearningEventType = "lesson-started" | "lesson-completed" | "practice" | "review" | "assessment";
export type VocabularyMasteryState = "new" | "learning" | "familiar" | "strong" | "mastered";
export type FlashcardRating = "again" | "hard" | "good" | "easy";
export type DiagnosticSkill = "vocabulary" | "grammar" | "reading" | "listening";
export type SupportedLicense = "MIT" | "Apache-2.0" | "CC0-1.0" | "CC-BY-2.0-FR" | "CC-BY-4.0" | "CC-BY-SA-4.0" | "WordNet-3.0" | "Public-Domain" | "Original" | "Other";

export interface Versioned {
  id: EntityId;
  schemaVersion: number;
  updatedAt: string;
  createdAt?: string;
  contentVersion?: string;
  status?: ContentStatus;
  tags?: string[];
}

export interface Prerequisite { kind: PrerequisiteKind; id: EntityId; }

export interface CompletionPolicy {
  requiredBlockIds?: EntityId[];
  requiredQuestionIds?: EntityId[];
  minimumScore?: number;
  allowSkip?: boolean;
  allowTestOut?: boolean;
}

export interface Course extends Versioned { title: string; banglaTitle: string; description: string; levelIds: EntityId[]; }
export interface Level extends Versioned {
  courseId: EntityId; code: LevelCode; title: string; summary: string; objective?: string; unitIds: EntityId[]; order: number;
  availability?: "available" | "coming-soon"; prerequisites?: Prerequisite[]; assessmentLessonId?: EntityId;
}
export interface Unit extends Versioned {
  levelId: EntityId; title: string; summary: string; objective?: string; lessonIds: EntityId[]; chapterIds?: EntityId[]; order: number;
  prerequisites?: Prerequisite[]; completionPolicy?: CompletionPolicy;
}
export interface Chapter extends Versioned { unitId: EntityId; title: string; banglaTitle?: string; summary: string; lessonIds: EntityId[]; order: number; }

export type LessonBlock =
  | { id: EntityId; type: "heading"; text: string }
  | { id: EntityId; type: "explanation"; title?: string; text: string; tip?: string }
  | { id: EntityId; type: "example"; english: string; bangla: string; note?: string }
  | { id: EntityId; type: "dialogue"; title?: string; turns: Array<{ speaker: string; english: string; bangla?: string }> }
  | { id: EntityId; type: "reading"; title?: string; text: string; banglaSummary?: string }
  | { id: EntityId; type: "vocabulary"; vocabularyIds: EntityId[] }
  | { id: EntityId; type: "image"; alt: string; caption?: string; src?: string }
  | { id: EntityId; type: "audio"; label: string; transcript?: string; audioAssetId?: EntityId }
  | { id: EntityId; type: "question"; questionId: EntityId }
  | { id: EntityId; type: "speaking"; prompt: string; hint?: string }
  | { id: EntityId; type: "writing"; promptId: EntityId; prompt: string; minWords?: number; hint?: string }
  | { id: EntityId; type: "mini-test"; questionIds: EntityId[]; minimumScore?: number }
  | { id: EntityId; type: "self-check"; prompt: string; options: string[] }
  | { id: EntityId; type: "review"; text: string }
  | { id: EntityId; type: "assessment"; questionIds: EntityId[]; title?: string; minimumScore?: number };

export interface Lesson extends Versioned {
  unitId: EntityId; chapterId?: EntityId; title: string; banglaTitle: string; objectives: string[]; skillFocus: Skill[]; estimatedMinutes: number; order: number;
  blocks: LessonBlock[]; vocabularyIds: EntityId[]; questionIds: EntityId[]; prerequisites?: Prerequisite[]; completionPolicy?: CompletionPolicy; difficultyBand?: DifficultyBand; isAssessment?: boolean;
}

export interface QuestionOption { id: EntityId; text: string; }
export interface BaseQuestion extends Versioned { lessonId: EntityId; prompt: string; banglaPrompt?: string; explanation: string; skill: Skill; difficulty: 1 | 2 | 3 | 4 | 5; tags: string[]; }
export interface McqQuestion extends BaseQuestion { type: "mcq"; options: QuestionOption[]; correctOptionId: EntityId; }
export interface FillBlankQuestion extends BaseQuestion { type: "fill-blank"; acceptedAnswers: string[]; placeholder?: string; }
export interface SentenceBuilderQuestion extends BaseQuestion { type: "sentence-builder"; tokens: string[]; correctSentence: string; }
export interface VocabularyRecallQuestion extends BaseQuestion { type: "vocabulary-recall"; word: string; vocabularyId: EntityId; acceptedAnswers: string[]; hint?: string; }
export type Question = McqQuestion | FillBlankQuestion | SentenceBuilderQuestion | VocabularyRecallQuestion;

export interface VocabularyItem extends Versioned {
  word: string;
  /** Canonical lower-case lookup key. Imports always normalize this field. */
  lemma?: string;
  meaning: string;
  definition: string;
  partOfSpeech: string;
  pronunciation: string;
  ipa?: string;
  example: string;
  topic: string;
  level: LevelCode;
  difficulty: 1 | 2 | 3 | 4 | 5;
  synonyms: string[];
  antonyms: string[];
  collocations: string[];
  wordFamily?: Array<{ word: string; partOfSpeech: string; meaning: string }>;
  phrasalVerbs?: Array<{ phrase: string; meaning: string; example?: string }>;
  idioms?: Array<{ phrase: string; meaning: string; example?: string }>;
  frequencyRank?: number;
  sourceId?: EntityId;
  license?: SupportedLicense;
  licenseUrl?: string;
  commercialUseAllowed?: boolean;
  attribution?: string;
  audioAssetId?: EntityId;
  imageAssetId?: EntityId;
}

/** A reusable source registry retains rights, version and attribution data outside individual records. */
export interface VocabularySource extends Versioned {
  name: string; url: string; license: SupportedLicense; licenseUrl?: string; commercialUseAllowed: boolean; attribution: string; dataVersion?: string; notice?: string;
}

/** A sentence stays separately attributable, so corpus records can be audited and removed independently. */
export interface VocabularySentence extends Versioned {
  vocabularyId?: EntityId; text: string; banglaTranslation?: string; language: "en"; sourceId: EntityId; license: SupportedLicense; licenseUrl?: string; commercialUseAllowed: boolean; attribution: string;
}

export interface DiagnosticResult {
  completedAt: string;
  score: number;
  suggestedLevel: LevelCode;
  focusSkill: DiagnosticSkill;
  skillScores: Record<DiagnosticSkill, { correct: number; total: number }>;
}

export interface PersonalStudyPath {
  diagnostic?: DiagnosticResult;
  status: "diagnostic-needed" | "ready";
  targetLevel: LevelCode;
  focusSkill: DiagnosticSkill;
  dailyGoalMinutes: number;
  nextLessonId?: EntityId;
  reviewFocus: "vocabulary" | "grammar";
  message: string;
}

export interface GrammarTopic extends Versioned { lessonId: EntityId; title: string; banglaTitle: string; description: string; level: LevelCode; }
export interface GrammarExample { english: string; bangla: string; note?: string; }
export interface GrammarConcept extends Versioned {
  title: string; banglaTitle: string; category: string; level: LevelCode; summary: string;
  rules: Array<{ rule: string; banglaExplanation: string }>;
  examples: GrammarExample[];
  commonMistakes: Array<{ incorrect: string; corrected: string; banglaExplanation: string }>;
  prerequisites: EntityId[];
  relatedConceptIds: EntityId[];
  layeredExplanations: Array<{ audience: "quick" | "foundation" | "deep-dive"; title: string; banglaExplanation: string }>;
  practiceQuestionIds: EntityId[];
  sourceId: EntityId;
  license: SupportedLicense;
  licenseUrl?: string;
  commercialUseAllowed: boolean;
  attribution: string;
}

export interface UserLessonProgress extends Versioned {
  userId: EntityId; lessonId: EntityId; completed: boolean; completedAt?: string; startedAt?: string; lastPosition: number; completedBlockIds?: EntityId[];
  correctCount: number; wrongCount: number; timeSpentSeconds: number; confidence?: "easy" | "okay" | "difficult"; lastActivityAt?: string;
}
export interface UserActivityProgress extends Versioned { userId: EntityId; lessonId: EntityId; blockId: EntityId; completed: boolean; score?: number; confidence?: "easy" | "okay" | "difficult"; response?: string; updatedAt: string; }
export interface UserVocabularyProgress extends Versioned {
  userId: EntityId; vocabularyId: EntityId; learned: boolean; recallCount: number; correctCount: number; wrongCount: number; lastReviewedAt?: string; masteryState?: VocabularyMasteryState;
}
/** Persisted SRS state is separate from content and can evolve without rewriting a 20k-word corpus. */
export interface SRSCard extends Versioned {
  userId: EntityId; vocabularyId: EntityId; masteryState: VocabularyMasteryState; nextReviewAt: string; intervalDays: number; easeFactor: number; streak: number; lapses: number; repetitions: number; lastReviewedAt?: string; lastRating?: FlashcardRating;
}

export interface Attempt extends Versioned { userId: EntityId; questionId: EntityId; lessonId: EntityId; questionType: Question["type"]; userAnswer: string; isCorrect: boolean; submittedAt: string; }
export interface MistakeRecord extends Versioned { userId: EntityId; questionId: EntityId; userAnswer: string; correctAnswer: string; reason: string; timestamp: string; attemptCount: number; resolved: boolean; }
export interface ReviewItem extends Versioned {
  userId: EntityId; itemId: EntityId; itemType: "vocabulary" | "question" | "lesson" | "objective"; masteryScore: number; confidence: number; attemptCount: number; correctCount: number; wrongCount: number; lastAttemptAt?: string; nextReviewAt: string; reviewLevel: number;
}
export interface ObjectiveProgress extends Versioned { userId: EntityId; lessonId: EntityId; objective: string; state: "introduced" | "practiced" | "reviewed" | "assessed" | "mastered"; }
export interface Bookmark extends Versioned { userId: EntityId; contentId: EntityId; contentType: "lesson" | "grammar" | "vocabulary" | "reading" | "writing"; createdAt: string; }
export interface PersonalNote extends Versioned { userId: EntityId; contentId: EntityId; text: string; }
export interface LearningSession extends Versioned { userId: EntityId; activity: LearningEventType; lessonId?: EntityId; skill?: Skill; startedAt: string; endedAt?: string; durationSeconds?: number; completed: boolean; }
export interface AppSettings extends Versioned { theme: "light" | "dark" | "focus"; languageMode: LanguageMode; soundEnabled: boolean; animationsEnabled: boolean; reducedMotion: boolean; dailyGoalMinutes: 10 | 15 | 20 | 30; seedVersion?: string; corpusVersion?: string; audioPackVersion?: string; lastLessonId?: EntityId; diagnosticResult?: DiagnosticResult; }
export interface WritingDraft extends Versioned { userId: EntityId; promptId: EntityId; text: string; submittedAt?: string; }

/** The skill labs share one activity contract while preserving each skill's own payload shape. */
export type LabSkill = "listening" | "pronunciation" | "speaking" | "reading" | "writing" | "communication";
export type SkillActivityStage = "learn" | "guided-practice" | "independent-practice" | "assessment" | "review";
export type SkillActivityKind = "listen-choose" | "listen-type" | "dictation" | "minimal-pair" | "repeat" | "read-aloud" | "roleplay" | "reading-check" | "writing-task" | "communication-scenario";
export type SkillMasteryState = "not-started" | "learning" | "practicing" | "strong" | "mastered";
export type SkillConfidence = "low" | "medium" | "high";

export interface SkillContentSource extends Versioned {
  name: string; creator: string; url?: string; license: SupportedLicense; licenseUrl?: string; attribution: string; commercialUseAllowed: boolean; notice?: string;
}

export interface SkillActivityContent {
  text?: string;
  transcript?: string;
  prompt?: string;
  banglaPrompt?: string;
  options?: QuestionOption[];
  acceptedAnswers?: string[];
  correctOptionId?: EntityId;
  explanation?: string;
  vocabulary?: Array<{ word: string; meaning_bn: string; pronunciation?: string; example?: string }>;
  usefulPhrases?: EntityId[];
  expectedLanguage?: string[];
  role?: string;
  goal?: string;
  preparationSeconds?: number;
  speakingSeconds?: number;
  imageAlt?: string;
}

export interface SkillActivity extends Versioned {
  skill: LabSkill; stage: SkillActivityStage; kind: SkillActivityKind; level: LevelCode; topic: string; difficulty: 1 | 2 | 3 | 4 | 5;
  title: string; banglaTitle: string; instructions: string; banglaInstructions: string; content: SkillActivityContent; estimatedTime: number;
  prerequisites: EntityId[]; assessment: { required: boolean; minimumScore?: number; transcriptAllowed?: boolean; confidenceRequired?: boolean };
  completionRule: { type: "complete" | "correct" | "minimum-score" | "self-reflection"; minimumScore?: number };
  sourceId: EntityId; license: SupportedLicense; licenseUrl?: string; attribution: string; commercialUseAllowed: boolean;
}

export interface Phrase extends Versioned {
  phrase: string; meaning: string; meaning_bn: string; pronunciation?: string; context: string; level: LevelCode; topic: string; example: string;
  formality: "neutral" | "informal" | "formal"; sourceId: EntityId; license: SupportedLicense; licenseUrl?: string; attribution: string; commercialUseAllowed: boolean;
}

export interface SkillAttempt extends Versioned {
  userId: EntityId; activityId: EntityId; skill: LabSkill; stage: SkillActivityStage; response?: string; selectedOptionId?: EntityId;
  isCorrect?: boolean; score?: number; confidence?: SkillConfidence; attempts: number; timeSpentSeconds?: number; submittedAt: string;
  feedbackState: "instant" | "self-reflection" | "manual-review" | "analysis-unavailable";
}

export interface SkillError extends Versioned {
  userId: EntityId; activityId: EntityId; skill: LabSkill; type: string; content: string; userResponse?: string; correctResponse?: string;
  explanation: string; timestamp: string; frequency: number; resolved: boolean;
}

export interface SkillMastery extends Versioned {
  userId: EntityId; skill: LabSkill; state: SkillMasteryState; activitiesCompleted: number; attemptCount: number; correctCount: number;
  accuracy?: number; totalTimeSeconds: number; latestConfidence?: SkillConfidence; lastActivityAt?: string;
}

export interface PronunciationAnalysis { score?: number; detectedIssues: string[]; suggestions: string[]; confidence?: number; status: "available" | "manual-review" | "unavailable"; }
export interface PronunciationAnalyzer { analyze(input: { audio: Blob; targetText: string; locale: string }): Promise<PronunciationAnalysis>; }
export interface WritingAnalysis { score?: number; issues: Array<{ category: string; message: string }>; suggestions: string[]; strengths: string[]; status: "available" | "manual-review" | "unavailable"; }
export interface WritingAnalyzer { analyze(input: { text: string; activityId: EntityId; level: LevelCode }): Promise<WritingAnalysis>; }

/** Phase 6 keeps assessment content, sessions and results distinct from ordinary lesson practice. */
export type AssessmentType = "diagnostic" | "placement" | "lesson" | "unit" | "skill" | "level" | "final" | "mock";
export type AssessmentQuestionType = "mcq" | "true-false" | "fill-blank" | "matching" | "sentence-builder" | "short-writing" | "spoken-response";
export type AssessmentSessionStatus = "not-started" | "in-progress" | "submitted" | "expired" | "abandoned";
export type AssessmentReviewStatus = "scored" | "manual-review" | "analysis-unavailable" | "not-applicable";

export interface AssessmentSource extends Versioned {
  name: string; creator: string; url?: string; license: SupportedLicense; licenseUrl?: string; attribution: string; commercialUseAllowed: boolean; notice?: string;
}

export interface AssessmentQuestion extends Versioned {
  type: AssessmentQuestionType; assessmentTypes: AssessmentType[]; prompt: string; banglaPrompt?: string; instructions?: string; skill: Skill; level: LevelCode;
  topic: string; difficulty: 1 | 2 | 3 | 4 | 5; tags: string[]; maxPoints: number; options?: QuestionOption[]; correctOptionId?: EntityId;
  acceptedAnswers?: string[]; matchingPairs?: Array<{ left: string; right: string }>; sentenceTokens?: string[]; correctSentence?: string;
  explanation?: string; banglaExplanation?: string; manualReviewRequired?: boolean; partialCreditEnabled?: boolean; negativeMarking?: number;
  approved: boolean; approvalNote?: string; sourceId: EntityId; license: SupportedLicense; licenseUrl?: string; attribution: string; commercialUseAllowed: boolean;
}

export interface AssessmentSection {
  id: EntityId; title: string; banglaTitle: string; skill: Skill; questionCount: number; durationMinutes?: number; minimumScore?: number;
  questionTypes: AssessmentQuestionType[]; tags?: string[]; difficultyBands?: Array<1 | 2 | 3 | 4 | 5>;
}

export interface AssessmentBlueprint extends Versioned {
  assessmentType: AssessmentType; title: string; banglaTitle: string; description: string; level?: LevelCode; linkedContentId?: EntityId;
  sections: AssessmentSection[]; durationMinutes?: number; overallMinimumScore?: number; requireAllSections?: boolean; randomizeQuestions: boolean;
  feedbackPolicy: "after-each" | "after-submit" | "review-only"; sourceId: EntityId; license: SupportedLicense; attribution: string; commercialUseAllowed: boolean;
}

export interface AssessmentAnswer extends Versioned {
  sessionId: EntityId; questionId: EntityId; sectionId: EntityId; response?: string; selectedOptionId?: EntityId; matchingResponse?: Record<string, string>;
  markedForReview: boolean; answeredAt?: string; score?: number; isCorrect?: boolean; reviewStatus: AssessmentReviewStatus;
}

export interface AssessmentSession extends Versioned {
  userId: EntityId; blueprintId: EntityId; assessmentType: AssessmentType; sessionStatus: AssessmentSessionStatus; startedAt?: string; submittedAt?: string; expiresAt?: string;
  currentQuestionIndex: number; questionIds: EntityId[]; sectionOrder: EntityId[]; remainingSeconds?: number; lastSavedAt: string; resumedCount: number;
}

export interface AssessmentResult extends Versioned {
  userId: EntityId; sessionId: EntityId; blueprintId: EntityId; assessmentType: AssessmentType; level?: LevelCode; completedAt: string;
  score: number; earnedPoints: number; totalPoints: number; passed: boolean; estimatedLevel?: LevelCode; sectionScores: Array<{ sectionId: EntityId; skill: Skill; earnedPoints: number; totalPoints: number; score: number; passed?: boolean }>;
  reviewStatus: AssessmentReviewStatus; manualReviewQuestionIds: EntityId[]; wrongQuestionIds: EntityId[]; correctQuestionIds: EntityId[];
}

export interface EducationalCertificate extends Versioned {
  userId: EntityId; courseId?: EntityId; level?: LevelCode; assessmentResultId?: EntityId; certificateNumber: string; issuedAt: string;
  learnerName: string; title: string; banglaTitle: string; verificationPayload: string; verificationStatus: "local-educational-record"; statement: string;
}

export type LearningSeed = { courses: Course[]; levels: Level[]; units: Unit[]; chapters: Chapter[]; lessons: Lesson[]; vocabulary: VocabularyItem[]; questions: Question[]; grammarTopics: GrammarTopic[]; };
export type VocabularySearchFilters = { query?: string; letter?: string; level?: LevelCode; topic?: string; partOfSpeech?: string; masteryState?: VocabularyMasteryState; page?: number; pageSize?: number; };
export type VocabularySearchResult = { entries: Array<{ item: VocabularyItem; progress?: UserVocabularyProgress; srsCard?: SRSCard }>; page: number; pageSize: number; total: number; hasMore: boolean; };
export type GrammarConceptFilters = { level?: LevelCode; category?: string; page?: number; pageSize?: number; };
export type SkillActivityFilters = { skill?: LabSkill; stage?: SkillActivityStage; level?: LevelCode; topic?: string; page?: number; pageSize?: number; };
