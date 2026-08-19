import { AppError } from "@/core/errors/AppError";
import { validateLearningSeed } from "@/data/content/ContentValidator";
import type { LearningSeed } from "@/domain/learning/types";

const requiredCollections = ["courses", "levels", "units", "chapters", "lessons", "vocabulary", "questions", "grammarTopics"] as const;

export function importLearningSeed(input: unknown): LearningSeed {
  if (!input || typeof input !== "object") throw new AppError("ContentError", "Content import must be a JSON object.");
  const candidate = input as Record<string, unknown>;
  const missing = requiredCollections.filter((key) => !Array.isArray(candidate[key]));
  if (missing.length) throw new AppError("ContentError", `Content import is missing required collections: ${missing.join(", ")}.`);
  const seed = candidate as unknown as LearningSeed;
  validateLearningSeed(seed);
  return seed;
}
