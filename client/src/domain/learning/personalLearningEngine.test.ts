import { describe, expect, it } from "vitest";
import { academyLevelFor, buildDailyStudyPlan, calculateEventXp, updateGoals, updateStreak } from "./personalLearningEngine";
import type { LearningGoal, PersonalLearningEvent, PersonalLearningProfile } from "./types";

const profile: PersonalLearningProfile = { id: "profile", schemaVersion: 9, updatedAt: "2026-08-19T09:00:00.000Z", userId: "learner", learnerIntent: "balanced", focusSkills: ["vocabulary"], weeklyTargetDays: 5, totalXp: 0, academyLevel: 1, currentStreak: 2, longestStreak: 2, lastActiveDate: "2026-08-18", streakFreezeCredits: 1, onboardingComplete: true };
const event: PersonalLearningEvent = { id: "event", schemaVersion: 9, updatedAt: "2026-08-19T09:00:00.000Z", userId: "learner", eventKey: "lesson-1", type: "lesson-completed", occurredAt: "2026-08-19T09:00:00.000Z", minutes: 12 };

describe("personal learning engine", () => {
  it("uses diminishing XP rather than rewarding repeated same-day actions indefinitely", () => {
    expect(calculateEventXp("lesson-completed", 0).amount).toBe(20);
    expect(calculateEventXp("lesson-completed", 1).amount).toBe(13);
    expect(calculateEventXp("lesson-completed", 3).amount).toBe(0);
  });
  it("continues a streak with one local freeze, then restarts supportively", () => {
    expect(updateStreak(profile, "2026-08-20").currentStreak).toBe(3);
    expect(updateStreak(profile, "2026-08-20").streakFreezeCredits).toBe(0);
    expect(updateStreak({ ...profile, streakFreezeCredits: 0 }, "2026-08-21").currentStreak).toBe(1);
  });
  it("updates matching goals and creates a review-first deterministic plan", () => {
    const goal: LearningGoal = { id: "goal", schemaVersion: 9, updatedAt: event.occurredAt, userId: "learner", period: "daily", metric: "lessons", title: "One lesson", banglaTitle: "একটি পাঠ", target: 1, current: 0, startsOn: "2026-08-19", endsOn: "2026-08-19", goalStatus: "active", source: "learner" };
    expect(updateGoals([goal], event)[0].goalStatus).toBe("complete");
    const plan = buildDailyStudyPlan({ userId: "learner", date: "2026-08-19", goals: [goal], dueReviewCount: 3, currentLesson: { id: "lesson-1", title: "First lesson", banglaTitle: "প্রথম পাঠ" }, weakSkills: ["listening"] });
    expect(plan.items[0].type).toBe("review");
    expect(academyLevelFor(900)).toBeGreaterThan(1);
  });
});
