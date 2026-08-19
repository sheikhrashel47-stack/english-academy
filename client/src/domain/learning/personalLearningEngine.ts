/** Emerald Study House / Phase 7: calm, evidence-led, local-only motivation rules. */
import type { AchievementDefinition, AchievementProgress, DailyStudyPlan, LearningGoal, PersonalLearningEvent, PersonalLearningProfile, Skill, StudyDayRecord } from "./types";

export const XP_RULES: Record<PersonalLearningEvent["type"], { amount: number; reason: string; banglaReason: string }> = {
  "lesson-completed": { amount: 20, reason: "Lesson completion", banglaReason: "পাঠ সম্পন্ন" },
  "lesson-practiced": { amount: 6, reason: "Lesson practice", banglaReason: "পাঠ অনুশীলন" },
  "vocabulary-reviewed": { amount: 3, reason: "Vocabulary review", banglaReason: "শব্দ পুনরাবৃত্তি" },
  "skill-completed": { amount: 12, reason: "Skill activity", banglaReason: "Skill অনুশীলন" },
  "assessment-passed": { amount: 35, reason: "Passed assessment", banglaReason: "Assessment পাস" },
  "certificate-issued": { amount: 25, reason: "Local completion record", banglaReason: "স্থানীয় সম্পন্নতা রেকর্ড" },
};

export const localStudyDate = (value: string) => value.slice(0, 10);
const dayDistance = (from: string, to: string) => Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);

export function calculateEventXp(type: PersonalLearningEvent["type"], sameDayEventCount: number) {
  const rule = XP_RULES[type];
  const multiplier = sameDayEventCount === 0 ? 1 : sameDayEventCount === 1 ? 0.65 : sameDayEventCount === 2 ? 0.35 : 0;
  return { ...rule, amount: Math.round(rule.amount * multiplier), ruleId: `phase7.${type}.repeat-${Math.min(sameDayEventCount + 1, 4)}` };
}

export function academyLevelFor(totalXp: number) { return Math.max(1, Math.floor(Math.sqrt(Math.max(0, totalXp) / 100)) + 1); }

export function updateStudyDay(current: StudyDayRecord | undefined, event: PersonalLearningEvent): StudyDayRecord {
  const date = localStudyDate(event.occurredAt);
  const eventTypes = Array.from(new Set([...(current?.eventTypes ?? []), event.type]));
  return {
    id: current?.id ?? `study-day-${event.userId}-${date}`, schemaVersion: 9, createdAt: current?.createdAt ?? event.occurredAt, updatedAt: event.occurredAt,
    userId: event.userId, date, meaningfulEventCount: (current?.meaningfulEventCount ?? 0) + 1, minutes: (current?.minutes ?? 0) + (event.minutes ?? 0), xpEarned: current?.xpEarned ?? 0,
    eventTypes, streakEligible: true,
  };
}

export function updateStreak(profile: PersonalLearningProfile, activeDate: string) {
  if (!profile.lastActiveDate) return { ...profile, lastActiveDate: activeDate, currentStreak: 1, longestStreak: Math.max(1, profile.longestStreak) };
  const distance = dayDistance(profile.lastActiveDate, activeDate);
  if (distance <= 0) return profile;
  if (distance === 1) {
    const currentStreak = profile.currentStreak + 1;
    return { ...profile, lastActiveDate: activeDate, currentStreak, longestStreak: Math.max(profile.longestStreak, currentStreak) };
  }
  if (distance === 2 && profile.streakFreezeCredits > 0) {
    const currentStreak = profile.currentStreak + 1;
    return { ...profile, lastActiveDate: activeDate, currentStreak, longestStreak: Math.max(profile.longestStreak, currentStreak), streakFreezeCredits: profile.streakFreezeCredits - 1 };
  }
  return { ...profile, lastActiveDate: activeDate, currentStreak: 1 };
}

export function updateGoals(goals: LearningGoal[], event: PersonalLearningEvent) {
  const date = localStudyDate(event.occurredAt);
  const increment = (metric: LearningGoal["metric"]) => {
    if (metric === "minutes") return event.minutes ?? 0;
    if (metric === "lessons") return event.type === "lesson-completed" ? 1 : 0;
    if (metric === "reviews") return event.type === "vocabulary-reviewed" ? 1 : 0;
    if (metric === "skill-activities") return event.type === "skill-completed" ? 1 : 0;
    return event.type === "assessment-passed" ? 1 : 0;
  };
  return goals.map((goal) => {
    if (goal.goalStatus !== "active" || date < goal.startsOn || date > goal.endsOn) return goal;
    const current = Math.min(goal.target, goal.current + increment(goal.metric));
    return { ...goal, current, goalStatus: current >= goal.target ? "complete" as const : "active" as const, updatedAt: event.occurredAt };
  });
}

function criterionValue(definition: AchievementDefinition, events: PersonalLearningEvent[], profile: PersonalLearningProfile) {
  const count = (type: PersonalLearningEvent["type"]) => events.filter((event) => event.type === type).length;
  if (definition.criterion === "lessons-completed") return count("lesson-completed");
  if (definition.criterion === "reviews-completed") return count("vocabulary-reviewed");
  if (definition.criterion === "skill-activities") return count("skill-completed");
  if (definition.criterion === "assessment-passed") return count("assessment-passed");
  if (definition.criterion === "certificate-issued") return count("certificate-issued");
  if (definition.criterion === "streak-days") return profile.currentStreak;
  return profile.totalXp;
}

export function updateAchievements(input: { definitions: AchievementDefinition[]; existing: AchievementProgress[]; events: PersonalLearningEvent[]; profile: PersonalLearningProfile; at: string }) {
  const existingByDefinition = new Map(input.existing.map((item) => [item.achievementId, item]));
  return input.definitions.map((definition) => {
    const previous = existingByDefinition.get(definition.id);
    const currentValue = criterionValue(definition, input.events, input.profile);
    const unlocked = currentValue >= definition.threshold;
    return {
      id: previous?.id ?? `achievement-progress-${input.profile.userId}-${definition.id}`, schemaVersion: 9, createdAt: previous?.createdAt ?? input.at, updatedAt: input.at,
      userId: input.profile.userId, achievementId: definition.id, currentValue, achievementStatus: unlocked ? "unlocked" as const : "locked" as const,
      unlockedAt: unlocked ? previous?.unlockedAt ?? input.at : undefined, notifiedAt: previous?.notifiedAt,
      newlyUnlocked: unlocked && previous?.achievementStatus !== "unlocked", xpReward: unlocked && previous?.achievementStatus !== "unlocked" ? definition.xpReward : 0,
    };
  });
}

export function buildDailyStudyPlan(input: { userId: string; date: string; goals: LearningGoal[]; dueReviewCount: number; currentLesson?: { id: string; title: string; banglaTitle: string }; weakSkills: Skill[] }): DailyStudyPlan {
  const items: DailyStudyPlan["items"] = [];
  if (input.dueReviewCount > 0) items.push({ id: `review-${input.date}`, type: "review", title: "Due review", banglaTitle: `${Math.min(input.dueReviewCount, 12)}টি পুনরাবৃত্তি`, estimatedMinutes: Math.min(15, Math.max(5, input.dueReviewCount * 2)), completed: false });
  if (input.currentLesson) items.push({ id: `lesson-${input.currentLesson.id}`, type: "lesson", title: input.currentLesson.title, banglaTitle: input.currentLesson.banglaTitle, relatedContentId: input.currentLesson.id, estimatedMinutes: 15, completed: false });
  input.weakSkills.slice(0, 2).forEach((skill) => items.push({ id: `skill-${skill}-${input.date}`, type: "skill", title: `${skill} practice`, banglaTitle: `${skill} অনুশীলন`, estimatedMinutes: 10, completed: false }));
  if (!items.length && input.goals.some((goal) => goal.goalStatus === "active")) items.push({ id: `review-start-${input.date}`, type: "review", title: "Gentle review", banglaTitle: "সহজ পুনরাবৃত্তি", estimatedMinutes: 8, completed: false });
  return { id: `daily-study-plan-${input.userId}-${input.date}`, schemaVersion: 9, createdAt: `${input.date}T00:00:00.000Z`, updatedAt: `${input.date}T00:00:00.000Z`, userId: input.userId, date: input.date, goalIds: input.goals.filter((goal) => goal.goalStatus === "active").map((goal) => goal.id), items, generatedBy: "rule-based" };
}
