import type { FlashcardRating, ReviewItem, SRSCard } from "@/domain/learning/types";

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

const masteryFor = (card: SRSCard): SRSCard["masteryState"] => {
  if (card.repetitions >= 8 && card.intervalDays >= 30) return "mastered";
  if (card.repetitions >= 5) return "strong";
  if (card.repetitions >= 2) return "familiar";
  return card.repetitions > 0 ? "learning" : "new";
};

/** A small, explainable SM-2-inspired scheduler for offline flashcards. */
export class VocabularySrsScheduler {
  createCard(userId: string, vocabularyId: string, now = new Date()): SRSCard {
    return { id: `srs-${userId}-${vocabularyId}`, schemaVersion: 5, createdAt: now.toISOString(), updatedAt: now.toISOString(), userId, vocabularyId, masteryState: "new", nextReviewAt: now.toISOString(), intervalDays: 0, easeFactor: 2.5, streak: 0, lapses: 0, repetitions: 0 };
  }

  record(card: SRSCard, rating: FlashcardRating, now = new Date()): SRSCard {
    const timestamp = now.toISOString();
    if (rating === "again") {
      const failed = { ...card, updatedAt: timestamp, lastReviewedAt: timestamp, lastRating: rating, intervalDays: 1, easeFactor: Math.max(1.3, card.easeFactor - 0.2), streak: 0, lapses: card.lapses + 1, repetitions: 0, nextReviewAt: new Date(now.getTime() + 10 * 60 * 1000).toISOString() };
      return { ...failed, masteryState: "learning" };
    }
    const multiplier = rating === "easy" ? 1.3 : rating === "hard" ? 0.75 : 1;
    const baseInterval = card.repetitions === 0 ? 1 : card.repetitions === 1 ? 3 : Math.max(4, Math.round(card.intervalDays * card.easeFactor * multiplier));
    const next = { ...card, updatedAt: timestamp, lastReviewedAt: timestamp, lastRating: rating, intervalDays: baseInterval, easeFactor: Math.min(3.0, Math.max(1.3, card.easeFactor + (rating === "easy" ? 0.15 : rating === "hard" ? -0.15 : 0))), streak: card.streak + 1, repetitions: card.repetitions + 1, nextReviewAt: new Date(now.getTime() + baseInterval * 86400000).toISOString() };
    return { ...next, masteryState: masteryFor(next) };
  }
}
