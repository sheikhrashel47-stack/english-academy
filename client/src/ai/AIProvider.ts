/** Provider-independent contract. No AI provider is activated in Phase 0. */
export interface AIProvider {
  explain(input: { question: string; learnerLanguage: "bn" }): Promise<{ text: string }>;
  provideWritingFeedback(input: { text: string; learnerLanguage: "bn" }): Promise<{ feedback: string }>;
}

export class UnavailableAIProvider implements AIProvider {
  async explain(): Promise<{ text: string }> {
    throw new Error("AI is not enabled in Phase 0. Use the structured lesson explanation instead.");
  }
  async provideWritingFeedback(): Promise<{ feedback: string }> {
    throw new Error("AI is not enabled in Phase 0. Your writing remains preserved locally.");
  }
}
