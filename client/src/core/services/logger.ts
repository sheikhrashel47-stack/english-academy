/** Development logging only. Do not log answer text or personally identifying data. */
export const logger = {
  debug(event: string, meta?: Record<string, unknown>) {
    if (import.meta.env.DEV) console.debug(`[English Academy] ${event}`, meta ?? {});
  },
  warn(event: string, meta?: Record<string, unknown>) {
    if (import.meta.env.DEV) console.warn(`[English Academy] ${event}`, meta ?? {});
  },
};
