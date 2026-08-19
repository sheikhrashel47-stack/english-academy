/**
 * Design reminder — “Emerald Study House”: the home screen is a calm learning
 * ledger. Live learner data leads; secondary tools are grouped, never noisy.
 */
import { ArrowRight, BookOpenCheck, BrainCircuit, CalendarDays, Clock3, LibraryBig, Play, RotateCcw, Sparkles, Target, Wrench } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { learningUseCases } from "@/application/usecases/LearningUseCases";
import { AppShell, PhaseZeroNotice } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import type { LabSkill, Lesson, PersonalStudyPath, SkillMastery, UserLessonProgress } from "@/domain/learning/types";

type RoadmapItem = { lesson: Lesson; progress?: UserLessonProgress; unlocked: boolean };
type SkillRecommendation = Awaited<ReturnType<typeof learningUseCases.getSkillRecommendations>>[number];
const skillLabel: Record<LabSkill, string> = { listening: "Listening", pronunciation: "Pronunciation", speaking: "Speaking", reading: "Reading", writing: "Writing", communication: "Communication" };

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>([]);
  const [dueCount, setDueCount] = useState(0);
  const [resumeLesson, setResumeLesson] = useState<Lesson | undefined>();
  const [studyPath, setStudyPath] = useState<PersonalStudyPath>();
  const [skillMastery, setSkillMastery] = useState<SkillMastery[]>([]);
  const [recommendations, setRecommendations] = useState<SkillRecommendation[]>([]);

  useEffect(() => {
    void Promise.all([learningUseCases.getRoadmap(), learningUseCases.getDueReviews(), learningUseCases.getContinueLearning(), learningUseCases.getPersonalStudyPath(), learningUseCases.getSkillMastery(), learningUseCases.getSkillRecommendations()]).then(([items, due, resume, path, mastery, nextRecommendations]) => {
      setRoadmap(items); setDueCount(due.length); setResumeLesson(resume?.lesson); setStudyPath(path); setSkillMastery(mastery); setRecommendations(nextRecommendations);
    });
  }, []);

  const completed = roadmap.filter((item) => item.progress?.completed).length;
  const current = resumeLesson ?? roadmap.find((item) => !item.progress?.completed && item.unlocked)?.lesson ?? roadmap.find((item) => item.unlocked)?.lesson;
  const cefrLevels = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"];
  const completionRate = Math.min(100, Math.round((completed / Math.max(1, roadmap.length)) * 100));
  const activeSkillRecords = skillMastery.filter((record) => record.attemptCount > 0);
  const nextSkill = recommendations[0]?.skill ?? activeSkillRecords.slice().sort((a, b) => (a.accuracy ?? 101) - (b.accuracy ?? 101))[0]?.skill ?? "listening";

  return (
    <AppShell eyebrow="আজকের পরিকল্পনা" title="তোমার English study space">
      <div className="academy-dashboard">
        <section className="academy-dashboard-main">
          <section className="academy-hero paper-card" aria-labelledby="today-heading">
            <div className="academy-hero-copy"><p className="card-kicker">Current learning · {studyPath?.targetLevel ?? "Pre-A1"} Foundation</p><h2 id="today-heading">আজকের ছোট পরিকল্পনা,<br /><em>আগামী কথোপকথনের প্রস্তুতি।</em></h2><p>একটি lesson অথবা কয়েকটি review—তোমার পরের ইংরেজি পদক্ষেপ এখান থেকেই শুরু হবে।</p><Button className="hero-cta" onClick={() => current ? setLocation(`/lesson/${current.id}`) : setLocation("/practice")}><Play size={16} fill="currentColor" /> {current ? "Learning চালিয়ে যাও" : "Practice শুরু করো"}</Button></div>
            <div className="academy-hero-level" aria-label={`বর্তমান CEFR স্তর ${studyPath?.targetLevel ?? "Pre-A1"}`}><span>Current level</span><strong>{studyPath?.targetLevel ?? "Pre-A1"}</strong><small>Foundation</small></div>
          </section>

          <section className="academy-mission paper-card" aria-labelledby="mission-heading"><div className="academy-mission-heading"><span className="academy-icon-tile"><Sparkles size={18} /></span><div><p className="card-kicker">আজকের mission</p><h2 id="mission-heading">{current?.banglaTitle ?? "তোমার review queue"}</h2></div><span className="academy-duration"><Clock3 size={14} /> {current?.estimatedMinutes ?? 5} মিনিট</span></div><p>{current?.objectives[0] ?? "আজ একটি ছোট practice session শুরু করো এবং পরের শেখার নির্দেশনা তৈরি করো।"}</p><div className="academy-mission-actions"><Button variant="outline" onClick={() => current ? setLocation(`/lesson/${current.id}`) : setLocation("/practice")}>শুরু করো <ArrowRight size={16} /></Button><button type="button" className="academy-text-action" onClick={() => setLocation("/learn")}>CEFR পাঠক্রম দেখো</button></div></section>

          <section className="academy-path paper-card" aria-labelledby="path-heading"><div className="section-heading-row"><div><p className="card-kicker">CEFR progression</p><h2 className="section-title" id="path-heading">তোমার current study level</h2></div><span className="route-progress">{completed}/{roadmap.length || 1} lesson সম্পন্ন</span></div><div className="dashboard-cefr-ribbon" aria-label="CEFR study progression">{cefrLevels.map((level) => <span key={level} className={level === (studyPath?.targetLevel ?? "A1") ? "is-current" : level === "Pre-A1" ? "is-complete" : ""}><b>{level}</b><small>{level === (studyPath?.targetLevel ?? "A1") ? "Current focus" : level === "Pre-A1" ? "Foundation" : "Study ahead"}</small></span>)}</div><div className="academy-path-footer"><span>Progress এই device-এই সংরক্ষিত থাকে।</span><button type="button" onClick={() => setLocation("/learn")}>CEFR পাঠক্রম <ArrowRight size={14} /></button></div></section>

          <section className="personal-study-ledger paper-card" aria-label="Personal study path"><div><p className="card-kicker">Personal study signal</p><h2>{studyPath?.status === "ready" ? `${studyPath.targetLevel} · ${studyPath.focusSkill} focus` : "তোমার শুরু করার level নির্ধারণ করো"}</h2><p>{studyPath?.message ?? "Diagnostic signal load হচ্ছে…"}</p></div><Button variant="outline" onClick={() => setLocation(studyPath?.status === "ready" && studyPath.nextLessonId ? `/lesson/${studyPath.nextLessonId}` : "/diagnostic")}>{studyPath?.status === "ready" ? "আজকের path" : "Diagnostic শুরু"}<ArrowRight size={16} /></Button></section>

          <section className="dashboard-skill-signal paper-card" aria-label="Skill lab evidence"><div><p className="card-kicker">Language skills ledger</p><h2>{activeSkillRecords.length ? `${activeSkillRecords.length}টি skill-এ learning evidence আছে` : "ছয় skill-এর প্রথম practice বেছে নাও"}</h2><p>{recommendations[0]?.reason ?? "Listening, pronunciation, speaking, reading, writing অথবা communication-এর activity জমা দিলে এখানে বাস্তব learning signal দেখা যাবে।"}</p></div><div className="dashboard-skill-signal-side"><Target size={18} /><strong>{activeSkillRecords.reduce((sum, record) => sum + record.attemptCount, 0)} attempts</strong><button type="button" onClick={() => setLocation(`/skills/${nextSkill}`)}>{recommendations[0] ? `${skillLabel[nextSkill]} recovery` : "Skill lab শুরু"}<ArrowRight size={14} /></button></div></section>

          <section aria-labelledby="tools-heading"><div className="academy-section-heading"><div><p className="card-kicker">Study actions</p><h2 className="section-title" id="tools-heading">আজকের প্রয়োজনীয় চর্চা</h2></div><button type="button" className="academy-text-action" onClick={() => setLocation("/tools")}>সব study tool <ArrowRight size={15} /></button></div><div className="academy-tool-grid"><button type="button" className="academy-tool-card" onClick={() => setLocation("/practice")}><span className="academy-icon-tile"><BrainCircuit size={18} /></span><strong>Quick Practice</strong><small>একটি focused question session</small></button><button type="button" className="academy-tool-card" onClick={() => setLocation("/vocabulary")}><span className="academy-icon-tile"><BookOpenCheck size={18} /></span><strong>Vocabulary</strong><small>শব্দ খোঁজো ও শুনো</small></button><button type="button" className="academy-tool-card" onClick={() => setLocation("/grammar")}><span className="academy-icon-tile"><LibraryBig size={18} /></span><strong>Grammar</strong><small>পরের ধারণাটি পরিষ্কার করো</small></button></div></section>
        </section>

        <aside className="academy-insight-rail" aria-label="আজকের learning signals"><section className="academy-insight-card paper-card"><div className="academy-insight-title"><CalendarDays size={17} /> আজকের signal</div><strong>{completionRate}%</strong><p>তোমার current course completion</p><div className="mini-meter"><span style={{ width: `${completionRate}%` }} /></div></section><button type="button" className="review-card" onClick={() => setLocation("/review")}><span className="review-icon"><RotateCcw size={16} /></span><span><strong>{dueCount ? `${dueCount}টি review অপেক্ষায়` : "Review queue পরিষ্কার"}</strong><small>{dueCount ? "কয়েকটি প্রশ্নে মনে ঝালিয়ে নাও" : "নতুন lesson শুরু করতে পারো"}</small></span><ArrowRight size={16} /></button><section className="academy-rail-callout"><span className="academy-icon-tile"><Wrench size={17} /></span><div><p>Study tools</p><strong>যে skill দরকার, সেটিই বেছে নাও।</strong><button type="button" onClick={() => setLocation("/tools")}>Tools খুলুন <ArrowRight size={14} /></button></div></section></aside>
      </div>
      <PhaseZeroNotice />
    </AppShell>
  );
}
