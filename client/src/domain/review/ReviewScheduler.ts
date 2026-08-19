import type { ReviewItem } from "@/domain/learning/types";

export interface ReviewScheduler {
  schedule(item: ReviewItem, now?: Date): ReviewItem;
  recordSuccess(item: ReviewItem, now?: Date): ReviewItem;
  recordFailure(item: ReviewItem, now?: Date): ReviewItem;
  getDueItems(items: ReviewItem[], now?: Date): ReviewItem[];
}

/** A replaceable Phase 0 scheduler—not a permanent SRS algorithm. */
export class IntervalReviewScheduler implements ReviewScheduler {
  schedule(item: ReviewItem, now = new Date()): ReviewItem {
    return { ...item, nextReviewAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString() };
  }
  recordSuccess(item: ReviewItem, now = new Date()): ReviewItem {
    const level = Math.min(item.reviewLevel + 1, 7);
    const days = Math.max(1, 2 ** Math.min(level, 6));
    return { ...item, reviewLevel: level, correctCount: item.correctCount + 1, attemptCount: item.attemptCount + 1, lastAttemptAt: now.toISOString(), nextReviewAt: new Date(now.getTime() + days * 86400000).toISOString() };
  }
  recordFailure(item: ReviewItem, now = new Date()): ReviewItem {
    return { ...item, reviewLevel: 0, wrongCount: item.wrongCount + 1, attemptCount: item.attemptCount + 1, lastAttemptAt: now.toISOString(), nextReviewAt: new Date(now.getTime() + 86400000).toISOString() };
  }
  getDueItems(items: ReviewItem[], now = new Date()): ReviewItem[] {
    return items.filter((item) => new Date(item.nextReviewAt) <= now);
  }
}
