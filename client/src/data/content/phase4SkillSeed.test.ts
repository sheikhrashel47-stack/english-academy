import { describe, expect, it } from "vitest";
import { phase4Phrases, phase4SkillActivities, phase4SkillSources } from "./phase4SkillSeed";
import type { LabSkill } from "@/domain/learning/types";

describe("Phase 4 skill starter catalogue", () => {
  const skills: LabSkill[] = ["listening", "pronunciation", "speaking", "reading", "writing", "communication"];

  it("provides exactly 20 original activities for every supported skill", () => {
    for (const skill of skills) {
      const activities = phase4SkillActivities.filter((activity) => activity.skill === skill);
      expect(activities).toHaveLength(20);
      expect(new Set(activities.map((activity) => activity.id)).size).toBe(20);
      expect(activities.every((activity) => activity.license === "Original" && activity.commercialUseAllowed)).toBe(true);
      expect(new Set(activities.map((activity) => activity.stage))).toEqual(new Set(["learn", "guided-practice", "independent-practice", "assessment", "review"]));
    }
  });

  it("keeps the phrase shelf and source ledger rights-clear", () => {
    expect(phase4Phrases).toHaveLength(20);
    expect(new Set(phase4Phrases.map((phrase) => phrase.id)).size).toBe(20);
    expect(phase4Phrases.every((phrase) => phrase.license === "Original" && phrase.commercialUseAllowed)).toBe(true);
    expect(phase4SkillSources).toHaveLength(1);
    expect(phase4SkillSources[0]).toMatchObject({ license: "Original", commercialUseAllowed: true });
  });
});
