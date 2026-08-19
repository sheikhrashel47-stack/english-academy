import { describe, expect, it } from "vitest";
import { createPrivacySafeVerificationPayload, deriveCompletionBadges } from "@/domain/learning/certificateEngine";
import type { AssessmentResult } from "@/domain/learning/types";

const result = (overrides: Partial<AssessmentResult> = {}): AssessmentResult => ({
  id: "assessment-result-1", schemaVersion: 7, updatedAt: "2026-08-19T00:00:00.000Z", userId: "local-learner", sessionId: "session-1", blueprintId: "assessment-level-pre-a1", assessmentType: "level", level: "Pre-A1", completedAt: "2026-08-19T00:00:00.000Z", score: 80, earnedPoints: 8, totalPoints: 10, passed: true, sectionScores: [], reviewStatus: "scored", manualReviewQuestionIds: [], wrongQuestionIds: [], correctQuestionIds: [], ...overrides,
});

describe("certificate completion evidence", () => {
  it("derives one badge from the newest fully scored completion result", () => {
    const badges = deriveCompletionBadges([result({ completedAt: "2026-08-18T00:00:00.000Z" }), result({ id: "assessment-result-2", completedAt: "2026-08-19T00:00:00.000Z" })]);
    expect(badges).toHaveLength(1);
    expect(badges[0]).toMatchObject({ level: "Pre-A1", assessmentResultId: "assessment-result-2" });
  });

  it("never issues a completion badge from a manual-review or non-passed attempt", () => {
    expect(deriveCompletionBadges([result({ manualReviewQuestionIds: ["aq-writing-01"], reviewStatus: "manual-review" }), result({ id: "assessment-result-3", passed: false })])).toEqual([]);
  });

  it("creates a verification payload without the learner name, user id or assessment result id", () => {
    const payload = createPrivacySafeVerificationPayload({ certificateNumber: "EA-LER-20260819-ABCD1234", issuedAt: "2026-08-19T12:00:00.000Z", level: "Pre-A1" });
    expect(payload).toContain("EA-LER-20260819-ABCD1234");
    expect(payload).not.toContain("local-learner");
    expect(payload).not.toContain("assessment-result");
  });
});
