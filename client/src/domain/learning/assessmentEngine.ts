/** Emerald Study House assessment engine: deterministic, offline-first and evidence-only. */
import type { AssessmentAnswer, AssessmentBlueprint, AssessmentQuestion, AssessmentQuestionType, AssessmentReviewStatus, AssessmentSection, LevelCode } from "@/domain/learning/types";

export type SelectedAssessmentQuestion = { questionId: string; sectionId: string; order: number };
export type QuestionSelection = { selections: SelectedAssessmentQuestion[]; warnings: Array<{ sectionId: string; requested: number; available: number }> };
export type AssessmentScoringInput = Pick<AssessmentAnswer, "questionId" | "sectionId" | "response" | "selectedOptionId" | "matchingResponse"> & { answered?: boolean };
export type ScoredAssessmentAnswer = { questionId: string; sectionId: string; earnedPoints?: number; isCorrect?: boolean; reviewStatus: AssessmentReviewStatus; explanation?: string };
export type AssessmentScore = { earnedPoints: number; totalPoints: number; score: number; passed: boolean; reviewStatus: AssessmentReviewStatus; answers: ScoredAssessmentAnswer[]; sectionScores: Array<{ sectionId: string; earnedPoints: number; totalPoints: number; score: number; passed?: boolean }>; manualReviewQuestionIds: string[]; wrongQuestionIds: string[]; correctQuestionIds: string[] };

const normalize = (value = "") => value.trim().toLocaleLowerCase("en-US").replace(/[.,!?;:]/g, "").replace(/\s+/g, " ");
const hash = (value: string) => Array.from(value).reduce((total, character) => ((total << 5) - total + character.charCodeAt(0)) | 0, 0) >>> 0;
const scorePercent = (earnedPoints: number, totalPoints: number) => totalPoints > 0 ? Math.max(0, Math.min(100, Math.round((earnedPoints / totalPoints) * 100))) : 0;

const isObjective = (type: AssessmentQuestionType) => !["short-writing", "spoken-response"].includes(type);

export function selectAssessmentQuestions(blueprint: AssessmentBlueprint, questions: AssessmentQuestion[], seed = blueprint.id): QuestionSelection {
  const selections: SelectedAssessmentQuestion[] = [];
  const warnings: QuestionSelection["warnings"] = [];
  blueprint.sections.forEach((section) => {
    const candidates = questions
      .filter((question) => question.approved && question.assessmentTypes.includes(blueprint.assessmentType) && question.skill === section.skill)
      .filter((question) => section.questionTypes.includes(question.type))
      .filter((question) => !section.tags?.length || section.tags.some((tag) => question.tags.includes(tag)))
      .filter((question) => !section.difficultyBands?.length || section.difficultyBands.includes(question.difficulty))
      .sort((left, right) => blueprint.randomizeQuestions ? hash(`${seed}:${left.id}`) - hash(`${seed}:${right.id}`) : left.id.localeCompare(right.id));
    const chosen = candidates.slice(0, section.questionCount);
    if (chosen.length < section.questionCount) warnings.push({ sectionId: section.id, requested: section.questionCount, available: chosen.length });
    chosen.forEach((question) => selections.push({ questionId: question.id, sectionId: section.id, order: selections.length }));
  });
  return { selections, warnings };
}

/** Chooses the next eligible item around the current evidence-derived difficulty; it never labels a result as official CEFR placement. */
export function selectAdaptiveQuestion(questions: AssessmentQuestion[], answered: Array<{ questionId: string; isCorrect?: boolean }>, targetLevel?: LevelCode): AssessmentQuestion | undefined {
  const answeredIds = new Set(answered.map((item) => item.questionId));
  const completed = answered.filter((item) => item.isCorrect !== undefined);
  const accuracy = completed.length ? completed.filter((item) => item.isCorrect).length / completed.length : 0.5;
  const targetDifficulty = Math.max(1, Math.min(5, Math.round(3 + (accuracy - 0.5) * 4)));
  return questions
    .filter((question) => question.approved && isObjective(question.type) && !answeredIds.has(question.id) && (!targetLevel || question.level === targetLevel))
    .sort((left, right) => Math.abs(left.difficulty - targetDifficulty) - Math.abs(right.difficulty - targetDifficulty) || left.id.localeCompare(right.id))[0];
}

export function estimatedPlacementLevel(score: number): LevelCode {
  if (score < 35) return "Pre-A1";
  if (score < 55) return "A1";
  if (score < 75) return "A2";
  return "B1";
}

function objectiveAnswer(question: AssessmentQuestion, input?: AssessmentScoringInput): { isCorrect: boolean; earnedPoints: number } {
  const answered = Boolean(input?.answered ?? input?.response ?? input?.selectedOptionId ?? input?.matchingResponse);
  let correct = false;
  if (question.type === "mcq" || question.type === "true-false") correct = input?.selectedOptionId === question.correctOptionId;
  if (question.type === "fill-blank") correct = Boolean(input?.response && question.acceptedAnswers?.some((answer) => normalize(answer) === normalize(input.response)));
  if (question.type === "sentence-builder") correct = Boolean(input?.response && question.correctSentence && normalize(input.response) === normalize(question.correctSentence));
  if (question.type === "matching") {
    const pairs = question.matchingPairs ?? [];
    const matched = pairs.filter((pair) => input?.matchingResponse?.[pair.left] === pair.right).length;
    correct = pairs.length > 0 && matched === pairs.length;
    if (question.partialCreditEnabled && pairs.length) return { isCorrect: correct, earnedPoints: Math.round((matched / pairs.length) * question.maxPoints * 100) / 100 };
  }
  if (correct) return { isCorrect: true, earnedPoints: question.maxPoints };
  return { isCorrect: false, earnedPoints: answered && question.negativeMarking ? -Math.min(question.negativeMarking, question.maxPoints) : 0 };
}

function scoreAnswer(question: AssessmentQuestion, sectionId: string, input?: AssessmentScoringInput): ScoredAssessmentAnswer {
  if (question.manualReviewRequired || !isObjective(question.type)) return { questionId: question.id, sectionId, reviewStatus: "manual-review" };
  const result = objectiveAnswer(question, input);
  return { questionId: question.id, sectionId, isCorrect: result.isCorrect, earnedPoints: result.earnedPoints, reviewStatus: "scored", explanation: question.banglaExplanation ?? question.explanation };
}

export function scoreAssessment(blueprint: AssessmentBlueprint, selected: SelectedAssessmentQuestion[], questions: AssessmentQuestion[], inputs: AssessmentScoringInput[]): AssessmentScore {
  const questionMap = new Map(questions.map((question) => [question.id, question]));
  const inputMap = new Map(inputs.map((input) => [input.questionId, input]));
  const answers = selected.flatMap((selection) => {
    const question = questionMap.get(selection.questionId);
    return question ? [scoreAnswer(question, selection.sectionId, inputMap.get(question.id))] : [];
  });
  const sectionScores = blueprint.sections.map((section) => {
    const scored = answers.filter((answer) => answer.sectionId === section.id && answer.reviewStatus === "scored");
    const sectionQuestions = selected.map((selection) => ({ selection, question: questionMap.get(selection.questionId) })).filter((item) => item.selection.sectionId === section.id && item.question?.manualReviewRequired !== true && item.question && isObjective(item.question.type));
    const earnedPoints = scored.reduce((total, answer) => total + (answer.earnedPoints ?? 0), 0);
    const totalPoints = sectionQuestions.reduce((total, item) => total + (item.question?.maxPoints ?? 0), 0);
    const score = scorePercent(earnedPoints, totalPoints);
    return { sectionId: section.id, earnedPoints, totalPoints, score, passed: section.minimumScore === undefined ? undefined : score >= section.minimumScore };
  });
  const earnedPoints = sectionScores.reduce((total, section) => total + section.earnedPoints, 0);
  const totalPoints = sectionScores.reduce((total, section) => total + section.totalPoints, 0);
  const score = scorePercent(earnedPoints, totalPoints);
  const manualReviewQuestionIds = answers.filter((answer) => answer.reviewStatus === "manual-review").map((answer) => answer.questionId);
  const wrongQuestionIds = answers.filter((answer) => answer.reviewStatus === "scored" && answer.isCorrect === false).map((answer) => answer.questionId);
  const correctQuestionIds = answers.filter((answer) => answer.isCorrect).map((answer) => answer.questionId);
  const passedSections = sectionScores.every((section) => section.passed !== false);
  const passed = manualReviewQuestionIds.length === 0 && score >= (blueprint.overallMinimumScore ?? 0) && (!blueprint.requireAllSections || passedSections);
  return { earnedPoints, totalPoints, score, passed, reviewStatus: manualReviewQuestionIds.length ? "manual-review" : "scored", answers, sectionScores, manualReviewQuestionIds, wrongQuestionIds, correctQuestionIds };
}

export function canStartAssessment(blueprint: AssessmentBlueprint, selection: QuestionSelection): { allowed: boolean; message?: string } {
  if (!selection.warnings.length) return { allowed: true };
  const shortSections = selection.warnings.map((warning) => `${warning.available}/${warning.requested}`).join(", ");
  return { allowed: false, message: `এই assessment-এর approved question pool এখনো অসম্পূর্ণ (${shortSections})। ফল তৈরি করা হয়নি।` };
}
