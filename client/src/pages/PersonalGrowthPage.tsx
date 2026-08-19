/**
 * Design reminder — “Emerald Study House”: personal growth is a calm learning
 * ledger. Evidence and next steps lead; XP is supportive, never noisy or punitive.
 */
import { Award, BookOpen, CalendarDays, CheckCircle2, ChevronRight, Clock3, Goal, ListChecks, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { learningUseCases } from "@/application/usecases/LearningUseCases";
import { AppShell, PhaseZeroNotice } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { useLearningPreferences } from "@/contexts/LearningPreferencesContext";
import type { AchievementDefinition, AchievementProgress, DailyStudyPlan, LearningGoal, PersonalLearningProfile, StudyDayRecord, XpLedgerEntry } from "@/domain/learning/types";

type GrowthState = {
  profile: PersonalLearningProfile;
  goals: LearningGoal[];
  plan: DailyStudyPlan;
  ledger: XpLedgerEntry[];
  definitions: AchievementDefinition[];
  achievements: AchievementProgress[];
  studyDays: StudyDayRecord[];
};

const localDate = (offset = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
};

const dayLabel = (value: string) => new Intl.DateTimeFormat("bn-BD", { weekday: "narrow" }).format(new Date(`${value}T12:00:00`));

export default function PersonalGrowthPage() {
  const [, setLocation] = useLocation();
  const { settings } = useLearningPreferences();
  const [state, setState] = useState<GrowthState>();
  const [loading, setLoading] = useState(true);
  const [savingGoal, setSavingGoal] = useState(false);
  const today = localDate();

  const load = async () => {
    setLoading(true);
    const [profile, goals, plan, ledger, definitions, achievements, studyDays] = await Promise.all([
      learningUseCases.getPersonalLearningProfile(), learningUseCases.getLearningGoals(), learningUseCases.getOrCreateDailyStudyPlan(today),
      learningUseCases.getXpLedger(12), learningUseCases.getAchievementDefinitions(), learningUseCases.getAchievementProgress(), learningUseCases.getStudyDayRecords(),
    ]);
    setState({ profile, goals, plan, ledger, definitions, achievements, studyDays });
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const addGentleGoal = async () => {
    setSavingGoal(true);
    await learningUseCases.saveLearningGoal({ period: "daily", metric: "minutes", title: "Daily study minutes", banglaTitle: "আজ ১৫ মিনিট অনুশীলন", target: 15, current: 0, startsOn: today, endsOn: today, goalStatus: "active", source: "learner" });
    if (settings?.hapticEnabled && typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(12);
    await load();
    setSavingGoal(false);
  };

  const week = useMemo(() => Array.from({ length: 7 }, (_, index) => localDate(index - 6)), []);
  const achievementById = useMemo(() => new Map(state?.achievements.map((item) => [item.achievementId, item]) ?? []), [state]);
  const unlockedCount = state?.achievements.filter((item) => item.achievementStatus === "unlocked").length ?? 0;
  const activeGoals = state?.goals.filter((item) => item.goalStatus === "active") ?? [];

  const openPlanItem = (item: DailyStudyPlan["items"][number]) => {
    if (item.type === "lesson" && item.relatedContentId) setLocation(`/lesson/${item.relatedContentId}`);
    else if (item.type === "review") setLocation("/review");
    else if (item.type === "skill") setLocation("/skills/listening");
    else setLocation("/exams");
  };

  return (
    <AppShell eyebrow="Personal learning" title="তোমার শেখার ছন্দ">
      <div className="growth-workspace">
        <section className="growth-hero paper-card" aria-labelledby="growth-heading">
          <div>
            <p className="card-kicker">LOCAL LEARNING LEDGER · CEFR STUDY PATH</p>
            <h2 id="growth-heading">তোমার শেখার প্রমাণে গড়ে ওঠে<br /><em>ইংরেজির পরের ধাপ।</em></h2>
            <p>এখানে এই device-এ রাখা বাস্তব lesson, review, skill ও assessment evidence দেখা যায়। আজকের পরের ছোট step-টাই যথেষ্ট।</p>
          </div>
          <div className="growth-level-mark" aria-label={`Academy level ${state?.profile.academyLevel ?? 1}`}>
            <span>Learning record level</span><strong>{state?.profile.academyLevel ?? 1}</strong><small>{state?.profile.totalXp ?? 0} XP · local evidence</small>
          </div>
        </section>

        <section className="growth-cefr-ribbon paper-card" aria-label="CEFR study path">
          <div><p className="card-kicker">CEFR STUDY PATH</p><strong>Pre-A1 থেকে C2: শেখার evidence-এর ধারাবাহিক মানচিত্র</strong><small>এটি local learning path; এটি কোনো official CEFR determination নয়।</small></div>
          <ol>{["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"].map((level, index) => <li key={level} className={index === 0 ? "is-entry" : ""}><span>{index + 1}</span><b>{level}</b></li>)}</ol>
        </section>

        {loading || !state ? <section className="growth-loading paper-card"><Sparkles size={20} /><div><strong>তোমার personal learning ledger প্রস্তুত হচ্ছে</strong><p>Local profile, daily plan এবং achievement evidence পড়া হচ্ছে।</p></div></section> : <>
          <section className="growth-signal-grid" aria-label="Personal learning signals">
            <article className="growth-signal-card paper-card"><span className="growth-signal-icon"><CalendarDays size={18} /></span><p>নিয়মিত অধ্যয়নের ধারা</p><strong>{state.profile.currentStreak} দিন</strong><small>সর্বোচ্চ {state.profile.longestStreak} দিন · বিরতি নেওয়াও স্বাভাবিক</small></article>
            <article className="growth-signal-card paper-card"><span className="growth-signal-icon"><ListChecks size={18} /></span><p>Learning evidence</p><strong>{state.profile.totalXp} XP</strong><small>বাস্তব lesson, review, skill ও assessment record থেকে</small></article>
            <article className="growth-signal-card paper-card"><span className="growth-signal-icon"><BookOpen size={18} /></span><p>লিপিবদ্ধ মাইলস্টোন</p><strong>{unlockedCount}/{state.definitions.length}</strong><small>প্রতিটি evidence তোমার learning ledger-এ থাকবে</small></article>
          </section>

          <section className="growth-layout">
            <div className="growth-main-column">
              <section className="growth-plan paper-card" aria-labelledby="plan-heading">
                <div className="growth-section-heading"><div><p className="card-kicker">TODAY · RULE-BASED PLAN</p><h2 id="plan-heading">আজকের শান্ত পরিকল্পনা</h2></div><span><Clock3 size={15} /> {state.plan.items.reduce((sum, item) => sum + item.estimatedMinutes, 0)} মিনিট</span></div>
                {state.plan.items.length ? <ol className="growth-plan-list">{state.plan.items.map((item, index) => <li key={item.id}><span className="growth-plan-number">{index + 1}</span><div><strong>{item.banglaTitle}</strong><small>{item.title} · {item.estimatedMinutes} মিনিট</small></div><button type="button" onClick={() => openPlanItem(item)}>খুলুন <ChevronRight size={15} /></button></li>)}</ol> : <div className="growth-empty"><ListChecks size={18} /><div><strong>আজকের জন্য কোনো নির্ধারিত task নেই</strong><p>একটি ছোট goal সেট করলে local plan তৈরি হবে।</p></div><Button variant="outline" onClick={addGentleGoal} disabled={savingGoal}>{savingGoal ? "সংরক্ষণ হচ্ছে…" : "১৫ মিনিটের goal"}</Button></div>}
              </section>

              <section className="growth-goals paper-card" aria-labelledby="goals-heading">
                <div className="growth-section-heading"><div><p className="card-kicker">GOAL TRACKER</p><h2 id="goals-heading">তোমার সক্রিয় লক্ষ্য</h2></div>{!activeGoals.length && <Button variant="outline" onClick={addGentleGoal} disabled={savingGoal}>{savingGoal ? "সংরক্ষণ হচ্ছে…" : "সহজ goal যোগ করো"}</Button>}</div>
                {activeGoals.length ? <div className="growth-goal-list">{activeGoals.map((goal) => { const progress = Math.round((goal.current / Math.max(1, goal.target)) * 100); return <article key={goal.id}><div><strong>{goal.banglaTitle}</strong><small>{goal.current}/{goal.target} · {goal.metric}</small></div><div className="growth-meter" aria-label={`${progress}% complete`}><span style={{ width: `${progress}%` }} /></div><b>{progress}%</b></article>; })}</div> : <p className="growth-muted">তোমার সময় অনুযায়ী ছোট একটি লক্ষ্য দিয়ে শুরু করা যায়। এটি কোনো ranking নয়।</p>}
              </section>

              <section className="growth-achievements paper-card" aria-labelledby="achievement-heading"><div className="growth-section-heading"><div><p className="card-kicker">MILESTONE RECORD</p><h2 id="achievement-heading">অগ্রগতির প্রমাণ</h2></div><span>{unlockedCount} recorded</span></div><div className="growth-achievement-grid">{state.definitions.map((definition) => { const progress = achievementById.get(definition.id); const unlocked = progress?.achievementStatus === "unlocked"; return <article key={definition.id} className={unlocked ? "is-unlocked" : ""}><span>{unlocked ? <CheckCircle2 size={18} /> : <Award size={18} />}</span><div><strong>{definition.banglaTitle}</strong><small>{definition.description}</small><em>Evidence: {Math.min(progress?.currentValue ?? 0, definition.threshold)}/{definition.threshold}</em></div></article>; })}</div></section>
            </div>

            <aside className="growth-side-column">
              <section className="growth-calendar paper-card" aria-labelledby="calendar-heading"><div className="growth-section-heading"><div><p className="card-kicker">STUDY RHYTHM</p><h2 id="calendar-heading">সাম্প্রতিক ৭ দিন</h2></div><CalendarDays size={18} /></div><div className="growth-week">{week.map((date) => { const record = state.studyDays.find((item) => item.date === date); return <div key={date} className={record ? "is-active" : ""}><b>{dayLabel(date)}</b><span title={record ? `${record.minutes} minutes, ${record.xpEarned} XP` : "No local study record"}>{record ? record.meaningfulEventCount : "—"}</span><small>{record ? `${record.minutes}m` : "rest"}</small></div>; })}</div><p>একটি activity-ও evidence। বিরতি হলে কোনো guilt message নেই।</p></section>
              <section className="growth-ledger paper-card" aria-labelledby="ledger-heading"><div className="growth-section-heading"><div><p className="card-kicker">EVIDENCE LEDGER</p><h2 id="ledger-heading">সাম্প্রতিক learning record</h2></div></div>{state.ledger.length ? <ul>{state.ledger.slice(0, 6).map((item) => <li key={item.id}><div><strong>{item.banglaReason}</strong><small>{new Intl.DateTimeFormat("bn-BD", { month: "short", day: "numeric" }).format(new Date(item.occurredAt))}</small></div><b>+{item.amount}</b></li>)}</ul> : <div className="growth-ledger-empty"><Sparkles size={17} /><span>তোমার প্রথম lesson, review বা skill activity এখানেই দেখা যাবে।</span></div>}</section>
              <section className="growth-safe-note"><Goal size={18} /><div><strong>তোমার data, তোমার device</strong><p>Learning evidence, goal ও study rhythm local browser storage-এ থাকে। এটি কোনো official score নয়।</p></div></section>
            </aside>
          </section>
        </>}
      </div>
      <PhaseZeroNotice />
    </AppShell>
  );
}
