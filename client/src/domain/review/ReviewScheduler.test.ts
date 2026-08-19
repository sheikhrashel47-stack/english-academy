import { describe, expect, it } from "vitest";
import { IntervalReviewScheduler, VocabularySrsScheduler } from "./ReviewScheduler";
import type { ReviewItem } from "@/domain/learning/types";

const review: ReviewItem = {
  id: "review-question-demo",
  schemaVersion: 1,
  updatedAt: "2026-08-19T00:00:00.000Z",
  userId: "learner",
  itemId: "question-demo",
  itemType: "question",
  masteryScore: 0,
  confidence: 0,
  attemptCount: 0,
  correctCount: 0,
  wrongCount: 0,
  nextReviewAt: "2026-08-19T00:00:00.000Z",
  reviewLevel: 0,
};

describe("IntervalReviewScheduler", () => {
  it("moves a successful answer forward by an increasing interval", () => {
    const scheduler = new IntervalReviewScheduler();
    const next = scheduler.recordSuccess(review, new Date("2026-08-19T00:00:00.000Z"));
    expect(next.correctCount).toBe(1);
    expect(next.reviewLevel).toBe(1);
    expect(next.nextReviewAt).toBe("2026-08-21T00:00:00.000Z");
  });

  it("resets a failed answer to the next day", () => {
    const scheduler = new IntervalReviewScheduler();
    const advanced = { ...review, reviewLevel: 4, correctCount: 3, attemptCount: 3 };
    const next = scheduler.recordFailure(advanced, new Date("2026-08-19T00:00:00.000Z"));
    expect(next.reviewLevel).toBe(0);
    expect(next.wrongCount).toBe(1);
    expect(next.nextReviewAt).toBe("2026-08-20T00:00:00.000Z");
  });
});

describe("VocabularySrsScheduler", () => {
  it("grows the interval and mastery after successful recall", () => {
    const scheduler = new VocabularySrsScheduler();
    const created = scheduler.createCard("learner", "word", new Date("2026-08-19T00:00:00.000Z"));
    const first = scheduler.record(created, "good", new Date("2026-08-19T00:00:00.000Z"));
    const next = scheduler.record(first, "easy", new Date("2026-08-20T00:00:00.000Z"));
    expect(next.intervalDays).toBeGreaterThanOrEqual(3);
    expect(next.repetitions).toBe(2);
    expect(next.masteryState).toBe("familiar");
  });

  it("records a lapse and schedules an immediate recovery review", () => {
    const scheduler = new VocabularySrsScheduler();
    const created = scheduler.createCard("learner", "word", new Date("2026-08-19T00:00:00.000Z"));
    const failed = scheduler.record(created, "again", new Date("2026-08-19T00:00:00.000Z"));
    expect(failed.lapses).toBe(1);
    expect(failed.streak).toBe(0);
    expect(failed.nextReviewAt).toBe("2026-08-19T00:10:00.000Z");
  });
});
