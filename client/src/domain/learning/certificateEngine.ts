import type { AssessmentResult, AssessmentType, LevelCode } from "@/domain/learning/types";

/**
 * Certificate evidence is deliberately local and conservative: a badge or certificate
 * may only reference a fully scored, passed level/final assessment. Nothing here
 * represents an accredited, governmental, or official CEFR qualification.
 */
export type CompletionBadge = {
  id: string;
  level: LevelCode;
  title: string;
  banglaTitle: string;
  earnedAt: string;
  assessmentResultId: string;
  assessmentType: Extract<AssessmentType, "level" | "final">;
};

export type CertificateVerificationPayload = {
  version: "EA-LOCAL-1";
  record: "local-educational-record";
  certificateNumber: string;
  issuedDate: string;
  level?: LevelCode;
  scope: "educational-completion";
};

const levelOrder: LevelCode[] = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"];

export function isFullyScoredCompletion(result: AssessmentResult): result is AssessmentResult & { level: LevelCode; assessmentType: "level" | "final" } {
  return Boolean(
    result.passed
      && result.level
      && (result.assessmentType === "level" || result.assessmentType === "final")
      && result.reviewStatus === "scored"
      && result.manualReviewQuestionIds.length === 0,
  );
}

export function deriveCompletionBadges(results: AssessmentResult[]): CompletionBadge[] {
  const latestByLevel = new Map<LevelCode, AssessmentResult & { level: LevelCode; assessmentType: "level" | "final" }>();
  results.filter(isFullyScoredCompletion).forEach((result) => {
    const previous = latestByLevel.get(result.level);
    if (!previous || result.completedAt > previous.completedAt) latestByLevel.set(result.level, result);
  });
  return Array.from(latestByLevel.values())
    .sort((a, b) => levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level))
    .map((result) => ({
      id: `completion-badge-${result.level.toLowerCase()}`,
      level: result.level,
      title: `${result.level} Complete`,
      banglaTitle: `${result.level} সম্পন্ন`,
      earnedAt: result.completedAt,
      assessmentResultId: result.id,
      assessmentType: result.assessmentType,
    }));
}

export function createPrivacySafeVerificationPayload(input: { certificateNumber: string; issuedAt: string; level?: LevelCode }): string {
  const payload: CertificateVerificationPayload = {
    version: "EA-LOCAL-1",
    record: "local-educational-record",
    certificateNumber: input.certificateNumber,
    issuedDate: input.issuedAt.slice(0, 10),
    level: input.level,
    scope: "educational-completion",
  };
  return JSON.stringify(payload);
}
