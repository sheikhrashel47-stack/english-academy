/** Design reminder — Emerald Study House: learner preferences are quiet, local, and reliable. */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { learningUseCases } from "@/application/usecases/LearningUseCases";
import type { AppSettings, LanguageMode } from "@/domain/learning/types";

type LearningPreferencesContextValue = {
  settings: AppSettings | null;
  languageMode: LanguageMode;
  updatePreferences: (patch: Partial<Omit<AppSettings, "id" | "schemaVersion" | "updatedAt">>) => Promise<void>;
};

const LearningPreferencesContext = createContext<LearningPreferencesContextValue | undefined>(undefined);

export function LearningPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  useEffect(() => { void learningUseCases.getSettings().then(setSettings); }, []);
  const languageMode = settings?.languageMode ?? "mixed";

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.languageMode = languageMode;
    root.classList.toggle("reduce-motion", settings?.reducedMotion ?? false);
  }, [languageMode, settings?.reducedMotion]);

  const value = useMemo<LearningPreferencesContextValue>(() => ({
    settings,
    languageMode,
    updatePreferences: async (patch) => { const next = await learningUseCases.updateSettings(patch); setSettings(next); },
  }), [settings, languageMode]);

  return <LearningPreferencesContext.Provider value={value}>{children}</LearningPreferencesContext.Provider>;
}

export function useLearningPreferences() {
  const context = useContext(LearningPreferencesContext);
  if (!context) throw new Error("useLearningPreferences must be used within LearningPreferencesProvider");
  return context;
}
