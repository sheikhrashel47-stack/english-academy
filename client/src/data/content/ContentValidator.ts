/** Emerald Study House / Phase 3: central integrity and explicit-rights validation boundary. */
import { AppError } from "@/core/errors/AppError";
import { getCorrectAnswer } from "@/domain/practice/exerciseEngine";
import type { GrammarConcept, LearningSeed, Prerequisite, VocabularyItem, VocabularySentence, VocabularySource } from "@/domain/learning/types";

const knownBlockTypes = new Set(["heading", "explanation", "example", "dialogue", "reading", "vocabulary", "image", "audio", "question", "speaking", "writing", "mini-test", "self-check", "review", "assessment"]);

function prerequisiteExists(prerequisite: Prerequisite, ids: { lessons: Set<string>; units: Set<string>; levels: Set<string> }) {
  return prerequisite.kind === "lesson" ? ids.lessons.has(prerequisite.id) : prerequisite.kind === "unit" ? ids.units.has(prerequisite.id) : ids.levels.has(prerequisite.id);
}

/** All external corpus records must name their source, license, commercial-use permission and attribution. */
export function validateVocabularyLicense(item: Pick<VocabularyItem, "id" | "sourceId" | "license" | "commercialUseAllowed" | "attribution">, sources: Map<string, VocabularySource>): void {
  if (!item.sourceId || !item.license || item.commercialUseAllowed !== true || !item.attribution?.trim()) throw new AppError("ContentError", `Vocabulary ${item.id} has no explicit commercial-use license metadata.`);
  const source = sources.get(item.sourceId);
  if (!source || source.commercialUseAllowed !== true || source.license !== item.license) throw new AppError("ContentError", `Vocabulary ${item.id} has an invalid source or license reference.`);
}

export function validateSentenceLicense(sentence: VocabularySentence, sources: Map<string, VocabularySource>): void {
  if (!sentence.sourceId || !sentence.license || sentence.commercialUseAllowed !== true || !sentence.attribution?.trim()) throw new AppError("ContentError", `Sentence ${sentence.id} has no explicit commercial-use license metadata.`);
  const source = sources.get(sentence.sourceId);
  if (!source || source.commercialUseAllowed !== true || source.license !== sentence.license) throw new AppError("ContentError", `Sentence ${sentence.id} has an invalid source or license reference.`);
}

export function validateGrammarConcepts(concepts: GrammarConcept[], sources: VocabularySource[], questionIds: Iterable<string> = []): void {
  const conceptIds = new Set(concepts.map((concept) => concept.id)); const sourceMap = new Map(sources.map((source) => [source.id, source])); const questions = new Set(questionIds);
  if (conceptIds.size !== concepts.length) throw new AppError("ContentError", "Grammar concept IDs must be unique.");
  for (const concept of concepts) {
    if (!concept.title || !concept.banglaTitle || !concept.category || !concept.summary || !concept.rules.length || !concept.examples.length || !concept.layeredExplanations.length) throw new AppError("ContentError", `Grammar concept ${concept.id} is incomplete.`);
    if (concept.prerequisites.some((id) => !conceptIds.has(id)) || concept.relatedConceptIds.some((id) => !conceptIds.has(id))) throw new AppError("ContentError", `Grammar concept ${concept.id} has a broken relationship.`);
    if (concept.practiceQuestionIds.some((id) => !questions.has(id))) throw new AppError("ContentError", `Grammar concept ${concept.id} references a missing practice question.`);
    validateVocabularyLicense(concept, sourceMap);
  }
}

export function validateLearningSeed(seed: LearningSeed): void {
  const ids = {
    courses: new Set(seed.courses.map((item) => item.id)), levels: new Set(seed.levels.map((item) => item.id)), units: new Set(seed.units.map((item) => item.id)),
    chapters: new Set(seed.chapters.map((item) => item.id)), lessons: new Set(seed.lessons.map((item) => item.id)), vocabulary: new Set(seed.vocabulary.map((item) => item.id)), questions: new Set(seed.questions.map((item) => item.id)),
  };
  const everyEntity = [...seed.courses, ...seed.levels, ...seed.units, ...seed.chapters, ...seed.lessons, ...seed.vocabulary, ...seed.questions, ...seed.grammarTopics];
  if (new Set(everyEntity.map((entity) => entity.id)).size !== everyEntity.length) throw new AppError("ContentError", "Content IDs must be globally stable and unique.");
  if (seed.levels.some((level) => !ids.courses.has(level.courseId))) throw new AppError("ContentError", "A level references an unknown course.");
  if (seed.units.some((unit) => !ids.levels.has(unit.levelId))) throw new AppError("ContentError", "A unit references an unknown level.");
  if (seed.chapters.some((chapter) => !ids.units.has(chapter.unitId) || chapter.lessonIds.some((id) => !ids.lessons.has(id)))) throw new AppError("ContentError", "A chapter has an invalid unit or lesson reference.");
  for (const lesson of seed.lessons) {
    if (!ids.units.has(lesson.unitId)) throw new AppError("ContentError", `Lesson ${lesson.id} references an unknown unit.`);
    if (lesson.chapterId && !ids.chapters.has(lesson.chapterId)) throw new AppError("ContentError", `Lesson ${lesson.id} references an unknown chapter.`);
    if ((lesson.prerequisites ?? []).some((item) => !prerequisiteExists(item, ids))) throw new AppError("ContentError", `Lesson ${lesson.id} has a broken prerequisite.`);
    if (lesson.blocks.some((block) => !knownBlockTypes.has(block.type))) throw new AppError("ContentError", `Lesson ${lesson.id} has an unknown block type.`);
    if (lesson.blocks.some((block) => block.type === "question" && !ids.questions.has(block.questionId))) throw new AppError("ContentError", `Lesson ${lesson.id} references an unknown question.`);
    if (lesson.blocks.some((block) => (block.type === "mini-test" || block.type === "assessment") && block.questionIds.some((id) => !ids.questions.has(id)))) throw new AppError("ContentError", `Lesson ${lesson.id} references an unknown assessment question.`);
    if (lesson.blocks.some((block) => block.type === "vocabulary" && block.vocabularyIds.some((id) => !ids.vocabulary.has(id)))) throw new AppError("ContentError", `Lesson ${lesson.id} references unknown vocabulary.`);
    if (lesson.vocabularyIds.some((id) => !ids.vocabulary.has(id)) || lesson.questionIds.some((id) => !ids.questions.has(id))) throw new AppError("ContentError", `Lesson ${lesson.id} has invalid content references.`);
  }
  for (const unit of seed.units) if ((unit.prerequisites ?? []).some((item) => !prerequisiteExists(item, ids)) || unit.lessonIds.some((id) => !ids.lessons.has(id))) throw new AppError("ContentError", `Unit ${unit.id} has invalid learning references.`);
  for (const level of seed.levels) if ((level.prerequisites ?? []).some((item) => !prerequisiteExists(item, ids)) || level.unitIds.some((id) => !ids.units.has(id))) throw new AppError("ContentError", `Level ${level.id} has invalid learning references.`);
  for (const question of seed.questions) {
    if (!ids.lessons.has(question.lessonId)) throw new AppError("ContentError", `Question ${question.id} references an unknown lesson.`);
    if (question.type === "mcq" && !question.options.some((option) => option.id === question.correctOptionId)) throw new AppError("ContentError", `Question ${question.id} has no valid correct option.`);
    if (question.type !== "mcq" && !getCorrectAnswer(question)) throw new AppError("ContentError", `Question ${question.id} has no accepted answer.`);
  }
  if (seed.grammarTopics.some((topic) => !ids.lessons.has(topic.lessonId))) throw new AppError("ContentError", "A grammar topic references an unknown lesson.");
}
