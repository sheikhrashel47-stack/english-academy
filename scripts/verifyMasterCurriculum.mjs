import { masterCurriculumSeed, masterCurriculumStats } from "../client/src/data/content/masterCurriculumSeed.ts";

const lessonNumbers = masterCurriculumSeed.lessons
  .map((lesson) => Number(lesson.id.replace("master-lesson-", "")))
  .sort((a, b) => a - b);
const expected = Array.from({ length: 1290 }, (_, index) => index + 1);
const contiguous = lessonNumbers.length === expected.length && lessonNumbers.every((number, index) => number === expected[index]);
const prerequisiteContinuity = masterCurriculumSeed.lessons.every((lesson, index) => {
  if (index === 0) return lesson.prerequisites.length === 0;
  return lesson.prerequisites[0]?.id === `master-lesson-${String(index).padStart(4, "0")}`;
});
if (masterCurriculumStats.lessons !== 1290 || !contiguous || !prerequisiteContinuity) {
  throw new Error(JSON.stringify({ stats: masterCurriculumStats, contiguous, prerequisiteContinuity }));
}
console.log(JSON.stringify({ stats: masterCurriculumStats, contiguous, prerequisiteContinuity }, null, 2));
