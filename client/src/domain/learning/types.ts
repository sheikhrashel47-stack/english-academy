/** Emerald Study House / Phase 3: license-aware, offline-first learning contracts for a large corpus. */

export type EntityId = string;
export type LevelCode = "Pre-A1" | "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type Skill = "grammar" | "vocabulary" | "pronunciation" | "listening" | "speaking" | "reading" | "writing";
export type LanguageMode = "bangla" | "mixed" | "immersion";
export type ContentStatus = "draft" | "published" | "archived";
export type DifficultyBand = "beginner" | "elementary" | "intermediate" | "upper-intermediate" | "advanced";
export type PrerequisiteKind = "lesson" | "unit" | "level";
export type LearningEventType = "lesson-started" | "lesson-completed" | "practice" | "review" | "assessment";
export type VocabularyMasteryState = "new" | "learning" | "familiar" | "strong" | "mastered";
export type FlashcardRating = "again" | "hard" | "good" | "easy";
export type DiagnosticSkill = "vocabulary" | "grammar" | "reading" | "listening";
export type SupportedLicense = "MIT" | "Apache-2.0" | "CC0-1.0" | "CC-BY-2.0-FR" | "CC-BY-4.0" | "CC-BY-SA-4.0" | "WordNet-3.0" | "Public-Domain" | "Other";

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

export type LearningSeed = { courses: Course[]; levels: Level[]; units: Unit[]; chapters: Chapter[]; lessons: Lesson[]; vocabulary: VocabularyItem[]; questions: Question[]; grammarTopics: GrammarTopic[]; };
export type VocabularySearchFilters = { query?: string; level?: LevelCode; topic?: string; partOfSpeech?: string; masteryState?: VocabularyMasteryState; page?: number; pageSize?: number; };
export type VocabularySearchResult = { entries: Array<{ item: VocabularyItem; progress?: UserVocabularyProgress; srsCard?: SRSCard }>; page: number; pageSize: number; total: number; hasMore: boolean; };
export type GrammarConceptFilters = { level?: LevelCode; category?: string; page?: number; pageSize?: number; };
