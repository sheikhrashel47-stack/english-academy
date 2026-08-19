/**
 * Design reminder — “ভাষার মানচিত্র”: settings is a learner's quiet field desk;
 * each control names the current reading environment and its next safe setup step.
 */
import { Check, Compass, Database, Moon, Palette, Sun, Target } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { useTheme, type Theme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

const themes: { id: Theme; label: string; description: string; icon: typeof Sun }[] = [
  { id: "light", label: "Premium Light", description: "দীর্ঘ পড়ার জন্য উষ্ণ parchment", icon: Sun },
  { id: "dark", label: "Dark", description: "কম আলোয় মনোযোগী পড়া", icon: Moon },
  { id: "focus", label: "Focus", description: "বিক্ষেপ কম, ফিকে accent", icon: Target },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const selected = themes.find((item) => item.id === theme) ?? themes[0];
  return (
    <AppShell eyebrow="Workspace setup" title="তোমার পড়ার পরিবেশ">
      <section className="settings-route-card map-contour"><div className="settings-stamp"><Compass size={17} /><span>Workspace stamp · {theme}</span></div><div><p className="card-kicker">বর্তমান reading mode</p><h2>{selected.label}</h2><p>{selected.description}। এই পছন্দটি browser-এ সংরক্ষিত থাকে, যাতে পরেরবারও একই পরিবেশে ফিরে আসতে পারো।</p></div><i className="settings-compass">N</i></section>
      <div className="settings-layout"><section className="settings-card paper-card"><header><Palette size={20} /><div><p className="card-kicker">Appearance</p><h2 className="section-title">Theme mode</h2></div></header><div className="theme-grid">{themes.map((item) => { const Icon = item.icon; const isSelected = theme === item.id; return <button key={item.id} type="button" className={cn("theme-choice", isSelected && "theme-choice-active")} onClick={() => setTheme?.(item.id)}><Icon size={19} /><strong>{item.label}</strong><span>{item.description}</span>{isSelected && <i><Check size={14} /></i>}</button>; })}</div></section><section className="settings-card paper-card"><header><Database size={20} /><div><p className="card-kicker">Local data</p><h2 className="section-title">Offline foundation</h2></div></header><div className="settings-fact"><span>Storage</span><strong>IndexedDB</strong></div><div className="settings-fact"><span>Content update</span><strong>Versioned schema</strong></div><div className="settings-fact"><span>Cloud sync</span><strong>Phase 0-এ যুক্ত নয়</strong></div><p className="settings-help">এই prototype-এ lesson, question, attempt এবং progress browser-এর local database-এ থাকে। ভবিষ্যতে cloud sync আলাদা repository boundary দিয়ে যুক্ত করা যাবে।</p></section></div>
    </AppShell>
  );
}
