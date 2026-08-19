import type { AchievementDefinition } from "@/domain/learning/types";

const configuredAt = "2026-08-19T00:00:00.000Z";
const definition = (code: string, title: string, banglaTitle: string, criterion: AchievementDefinition["criterion"], threshold: number, xpReward: number, category: AchievementDefinition["category"]): AchievementDefinition => ({
  id: `achievement-${code}`, schemaVersion: 9, createdAt: configuredAt, updatedAt: configuredAt, code, title, banglaTitle, description: "A local English Academy learning milestone.", criterion, threshold, xpReward, category, visibility: "visible",
});

export const phase7AchievementDefinitions: AchievementDefinition[] = [
  definition("first-lesson", "First lesson", "প্রথম পাঠ", "lessons-completed", 1, 10, "milestone"),
  definition("steady-lessons", "Steady learner", "নিয়মিত পাঠ", "lessons-completed", 10, 25, "practice"),
  definition("review-rhythm", "Review rhythm", "পুনরাবৃত্তির ছন্দ", "reviews-completed", 20, 20, "practice"),
  definition("skill-builder", "Skill builder", "Skill গড়ার পথ", "skill-activities", 5, 20, "skill"),
  definition("assessment-ready", "Assessment ready", "Assessment প্রস্তুতি", "assessment-passed", 1, 30, "assessment"),
  definition("three-day-rhythm", "Three-day rhythm", "তিন দিনের ধারাবাহিকতা", "streak-days", 3, 15, "consistency"),
  definition("academy-250", "Academy 250", "Academy ২৫০ XP", "xp-earned", 250, 25, "milestone"),
  definition("local-completion", "Local completion", "স্থানীয় সম্পন্নতা", "certificate-issued", 1, 25, "assessment"),
];
