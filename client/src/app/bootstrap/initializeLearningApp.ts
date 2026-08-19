import { learningUseCases } from "@/application/usecases/LearningUseCases";
import { logger } from "@/core/services/logger";

/** Seeds only versioned Phase 0 content; existing progress remains untouched. */
export async function initializeLearningApp(): Promise<void> {
  await learningUseCases.initialize();
  logger.debug("app-initialized", { mode: "offline-first" });
}
