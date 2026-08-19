/** Stable, content-first domain contracts for English Academy Phase 0. */

export type EntityId = string;
export type LevelCode = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type Skill = "grammar" | "vocabulary" | "pronunciation" | "listening" | "speaking" | "reading" | "writing";

export interface Versioned {
  id: EntityId;
  schemaVersion: number;
  updatedAt: string;
}

export interface Course extends Versioned {
  title: string;
  banglaTitle: string;
  description: string;
  levelIds: EntityId[];
  contentVersion: string;
}

export interface Level extends Versioned {
  courseId: EntityId;
  code: LevelCode;
  title: string;
  summary: string;
  unitIds: EntityId[];
  order: number;
}

export interface Unit extends Versioned {
  levelId: EntityId;
  title: string;
  summary: string;
  lessonIds: EntityId[];
  order: number;
}

export type LessonBlock =
  | { id: EntityId; type: "heading"; text: string }
  | { id: EntityId; type: "explanation"; title?: string; text: string; tip?: string }
  | { id: EntityId; type: "example"; english: string; bangla: string; note?: string }
  | { id: EntityId; type: "vocabulary"; vocabularyIds: EntityId[] }
  | { id: EntityId; type: "question"; questionId: EntityId }
  | { id: EntityId; type: "review"; text: string };

export interface Lesson extends Versioned {
  unitId: EntityId;
  title: string;
  banglaTitle: string;
  objectives: string[];
  skillFocus: Skill[];
  estimatedMinutes: number;
  order: number;
  blocks: LessonBlock[];
  vocabularyIds: EntityId[];
  questionIds: EntityId[];
  status?: "draft" | "published";
}

export interface QuestionOption {
  id: EntityId;
  text: string;
}

export interface Question extends Versioned {
  lessonId: EntityId;
  type: "mcq";
  prompt: string;
  banglaPrompt?: string;
  options: QuestionOption[];
  correctOptionId: EntityId;
  explanation: string;
  skill: Skill;
  difficulty: 1 | 2 | 3 | 4 | 5;
  tags: string[];
}

export interface VocabularyItem extends Versioned {
  word: string;
  meaning: string;
  definition: string;
  partOfSpeech: string;
  pronunciation: string;
  example: string;
  topic: string;
  level: LevelCode;
  difficulty: 1 | 2 | 3 | 4 | 5;
  synonyms: string[];
  antonyms: string[];
  collocations: string[];
  audioAssetId?: EntityId;
  imageAssetId?: EntityId;
}

export interface UserLessonProgress extends Versioned {
  userId: EntityId;
  lessonId: EntityId;
  completed: boolean;
  completedAt?: string;
  lastPosition: number;
  correctCount: number;
  wrongCount: number;
  timeSpentSeconds: number;
}

export interface Attempt extends Versioned {
  userId: EntityId;
  questionId: EntityId;
  lessonId: EntityId;
  selectedOptionId: EntityId;
  isCorrect: boolean;
  submittedAt: string;
}

export interface MistakeRecord extends Versioned {
  userId: EntityId;
  questionId: EntityId;
  selectedOptionId: EntityId;
  correctOptionId: EntityId;
  reason: string;
  timestamp: string;
  attemptCount: number;
  resolved: boolean;
}

export interface ReviewItem extends Versioned {
  userId: EntityId;
  itemId: EntityId;
  itemType: "vocabulary" | "question" | "lesson";
  masteryScore: number;
  confidence: number;
  attemptCount: number;
  correctCount: number;
  wrongCount: number;
  lastAttemptAt?: string;
  nextReviewAt: string;
  reviewLevel: number;
}

export interface AppSettings extends Versioned {
  theme: "light" | "dark" | "focus";
  seedVersion?: string;
}

export type LearningSeed = {
  courses: Course[];
  levels: Level[];
  units: Unit[];
  lessons: Lesson[];
  vocabulary: VocabularyItem[];
  questions: Question[];
};
