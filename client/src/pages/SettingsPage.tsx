/**
 * Design reminder — “Emerald Study House”: settings is a learner's quiet study desk;
 * each control names the current reading environment and its next safe setup step.
 */
import { Check, Database, Download, Languages, Moon, Palette, RotateCcw, Sun, Target, Upload, Volume2, WandSparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { learningUseCases } from "@/application/usecases/LearningUseCases";
import { AppShell } from "@/components/app/AppShell";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useTheme, type Theme } from "@/contexts/ThemeContext";
import { useLearningPreferences } from "@/contexts/LearningPreferencesContext";
import { cn } from "@/lib/utils";

const themes: { id: Theme; label: string; description: string; icon: typeof Sun }[] = [
  { id: "light", label: "Premium Light", description: "দীর্ঘ পড়ার জন্য শান্ত neutral canvas", icon: Sun },
  { id: "dark", label: "Dark", description: "কম আলোয় মনোযোগী পড়া", icon: Moon },
  { id: "focus", label: "Focus", description: "বিক্ষেপ কম, ফিকে accent", icon: Target },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { settings, languageMode, updatePreferences } = useLearningPreferences();
  const [prefs, setPrefs] = useState({ soundEnabled: true, animationsEnabled: true, reducedMotion: false, dailyGoalMinutes: 15 as 10 | 15 | 20 | 30 });
  const fileInput = useRef<HTMLInputElement>(null);
  const selected = themes.find((item) => item.id === theme) ?? themes[0];
  useEffect(() => {
    if (settings) setPrefs({ soundEnabled: settings.soundEnabled, animationsEnabled: settings.animationsEnabled, reducedMotion: settings.reducedMotion, dailyGoalMinutes: settings.dailyGoalMinutes });
  }, [settings]);

  const setPreference = async (patch: Partial<typeof prefs>) => {
    setPrefs((current) => ({ ...current, ...patch }));
    await updatePreferences(patch);
  };
  const setAppearance = async (nextTheme: Theme) => { setTheme?.(nextTheme); await updatePreferences({ theme: nextTheme }); };
  const exportBackup = async () => {
    const data = await learningUseCases.exportUserData();
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `english-academy-backup-${new Date().toISOString().slice(0, 10)}.json`; anchor.click(); URL.revokeObjectURL(url);
    toast.success("তোমার local learning backup তৈরি হয়েছে।");
  };
  const importBackup = async (file?: File) => {
    if (!file) return;
    try { await learningUseCases.importUserData(JSON.parse(await file.text())); toast.success("Backup থেকে শেখার data ফিরিয়ে আনা হয়েছে।"); window.location.reload(); }
    catch { toast.error("এই JSON file-টি English Academy backup নয়।"); }
  };
  const resetData = async () => { await learningUseCases.resetUserData(); toast.success("Local progress reset হয়েছে; content map অপরিবর্তিত আছে।"); window.location.reload(); };

  return <AppShell eyebrow="Workspace setup" title="তোমার পড়ার পরিবেশ">
    <section className="settings-route-card map-contour"><div className="settings-stamp"><span className="settings-ledger-mark" aria-hidden="true" /><span>Workspace standard · {theme}</span></div><div><p className="card-kicker">বর্তমান reading mode</p><h2>{selected.label}</h2><p>{selected.description}। এই পছন্দটি browser-এ সংরক্ষিত থাকে, যাতে পরেরবারও একই পরিবেশে ফিরে আসতে পারো।</p></div><i className="settings-compass">EA</i></section>
    <div className="settings-layout">
      <section className="settings-card paper-card"><header><Palette size={20} /><div><p className="card-kicker">Appearance</p><h2 className="section-title">Theme mode</h2></div></header><div className="theme-grid">{themes.map((item) => { const Icon = item.icon; const isSelected = theme === item.id; return <button key={item.id} type="button" className={cn("theme-choice", isSelected && "theme-choice-active")} onClick={() => void setAppearance(item.id)}><Icon size={19} /><strong>{item.label}</strong><span>{item.description}</span>{isSelected && <i><Check size={14} /></i>}</button>; })}</div></section>
      <section className="settings-card paper-card"><header><Languages size={20} /><div><p className="card-kicker">Explanation language</p><h2 className="section-title">Language mode</h2></div></header><div className="language-mode-grid">{([ ["bangla", "Bangla Support", "বাংলা ব্যাখ্যা ও সহায়তা"], ["mixed", "Mixed Mode", "English-এর সঙ্গে প্রয়োজনীয় বাংলা"], ["immersion", "English Immersion", "মূলত ইংরেজি নির্দেশনা"] ] as const).map(([id, label, hint]) => <button key={id} type="button" className={cn("language-mode-choice", languageMode === id && "language-mode-choice-active")} onClick={() => void updatePreferences({ languageMode: id })}><strong>{label}</strong><small>{hint}</small>{languageMode === id && <Check size={15} />}</button>)}</div><p className="settings-help">নতুন lesson ও skill sample-এ এই পছন্দ অনুযায়ী ব্যাখ্যার ভাষা বদলাবে।</p></section>
      <section className="settings-card paper-card"><header><WandSparkles size={20} /><div><p className="card-kicker">Study preferences</p><h2 className="section-title">মনোযোগের নিয়ন্ত্রণ</h2></div></header><div className="preference-row"><div><Volume2 size={18} /><span><strong>Sound cue</strong><small>সঠিক বা ভুল উত্তরে ছোট feedback sound</small></span></div><button className={cn("preference-switch", prefs.soundEnabled && "preference-switch-active")} role="switch" aria-checked={prefs.soundEnabled} onClick={() => void setPreference({ soundEnabled: !prefs.soundEnabled })}><i /></button></div><div className="preference-row"><div><WandSparkles size={18} /><span><strong>Gentle motion</strong><small>পড়ার surface-এ ছোট animation</small></span></div><button className={cn("preference-switch", prefs.animationsEnabled && "preference-switch-active")} role="switch" aria-checked={prefs.animationsEnabled} onClick={() => void setPreference({ animationsEnabled: !prefs.animationsEnabled })}><i /></button></div><div className="preference-row"><div><Target size={18} /><span><strong>Reduced motion</strong><small>System motion ও celebratory feedback কমাও</small></span></div><button className={cn("preference-switch", prefs.reducedMotion && "preference-switch-active")} role="switch" aria-checked={prefs.reducedMotion} onClick={() => void setPreference({ reducedMotion: !prefs.reducedMotion })}><i /></button></div><div className="daily-goal-row"><span><strong>Daily goal</strong><small>প্রতিদিনের লক্ষ্য সময়</small></span><select value={prefs.dailyGoalMinutes} aria-label="দৈনিক লক্ষ্য" onChange={(event) => void setPreference({ dailyGoalMinutes: Number(event.target.value) as 10 | 15 | 20 | 30 })}>{[10, 15, 20, 30].map((minutes) => <option key={minutes} value={minutes}>{minutes} মিনিট</option>)}</select></div></section>
      <section className="settings-card paper-card settings-data-card"><header><Database size={20} /><div><p className="card-kicker">Local data</p><h2 className="section-title">Offline foundation</h2></div></header><div className="settings-fact"><span>Storage</span><strong>IndexedDB</strong></div><div className="settings-fact"><span>Content update</span><strong>Versioned schema</strong></div><div className="settings-fact"><span>Cloud sync</span><strong>এই phase-এ নেই</strong></div><p className="settings-help">তোমার lesson, attempt, vocabulary recall এবং Mistake Bank এই browser-এর local database-এ থাকে। Backup তৈরি করে নিরাপদে রাখো।</p><div className="settings-actions"><Button variant="outline" onClick={() => void exportBackup()}><Download size={16} /> Backup export</Button><Button variant="outline" onClick={() => fileInput.current?.click()}><Upload size={16} /> Backup import</Button><input ref={fileInput} className="sr-only" type="file" accept="application/json" onChange={(event) => void importBackup(event.target.files?.[0])} /></div><AlertDialog><AlertDialogTrigger asChild><Button className="reset-data-button" variant="ghost"><RotateCcw size={16} /> শুধু learning data reset</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Local learning data reset করবেন?</AlertDialogTitle><AlertDialogDescription>তোমার progress, attempt, vocabulary recall, review এবং Mistake Bank মুছে যাবে। Lesson content map মুছে যাবে না।</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>না, ফিরি</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => void resetData()}>হ্যাঁ, reset করি</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></section>
    </div>
  </AppShell>;
}
