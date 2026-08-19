/**
 * Design reminder — “Emerald Study House”: the home screen is a calm learning
 * ledger. Live learner data leads; secondary tools are grouped, never noisy.
 */
import { ArrowRight, BookOpenCheck, BrainCircuit, CalendarDays, Check, Clock3, LibraryBig, Play, RotateCcw, Sparkles, Wrench } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { learningUseCases } from "@/application/usecases/LearningUseCases";
import { AppShell, PhaseZeroNotice } from "@/components/app/AppShell";
import { Trail, type TrailStep } from "@/components/app/Trail";
import { Button } from "@/components/ui/button";
import type { Lesson, UserLessonProgress } from "@/domain/learning/types";

type RoadmapItem = { lesson: Lesson; progress?: UserLessonProgress; unlocked: boolean };

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>([]);
  const [dueCount, setDueCount] = useState(0);
  const [resumeLesson, setResumeLesson] = useState<Lesson | undefined>();

  useEffect(() => {
    void Promise.all([learningUseCases.getRoadmap(), learningUseCases.getDueReviews(), learningUseCases.getContinueLearning()]).then(([items, due, resume]) => {
      setRoadmap(items);
      setDueCount(due.length);
      setResumeLesson(resume?.lesson);
    });
  }, []);

  const completed = roadmap.filter((item) => item.progress?.completed).length;
  const current = resumeLesson ?? roadmap.find((item) => !item.progress?.completed && item.unlocked)?.lesson ?? roadmap.find((item) => item.unlocked)?.lesson;
  const trailSteps: TrailStep[] = roadmap.map((item, index) => ({
    id: item.lesson.id,
    title: item.lesson.banglaTitle,
    shortLabel: item.lesson.title,
    status: item.progress?.completed ? "complete" : index === completed ? "current" : "locked",
  }));

  const completionRate = Math.min(100, Math.round((completed / Math.max(1, roadmap.length)) * 100));

  return (
    <AppShell eyebrow="আজকের পরিকল্পনা" title="তোমার English study space">
      <div className="academy-dashboard">
        <section className="academy-dashboard-main">
          <section className="academy-hero paper-card" aria-labelledby="today-heading">
            <div className="academy-hero-copy">
              <p className="card-kicker">Current learning · A1 Foundation</p>
              <h2 id="today-heading">আজকের ছোট পরিকল্পনা,<br /><em>আগামী কথোপকথনের প্রস্তুতি।</em></h2>
              <p>একটি lesson অথবা কয়েকটি review—তোমার পরের ইংরেজি পদক্ষেপ এখান থেকেই শুরু হবে।</p>
              <Button className="hero-cta" onClick={() => current ? setLocation(`/lesson/${current.id}`) : setLocation("/practice")}>
                <Play size={16} fill="currentColor" /> {current ? "Learning চালিয়ে যাও" : "Practice শুরু করো"}
              </Button>
            </div>
            <div className="academy-hero-level" aria-label="বর্তমান CEFR স্তর A1">
              <span>Current level</span><strong>A1</strong><small>Foundation</small>
            </div>
          </section>

          <section className="academy-mission paper-card" aria-labelledby="mission-heading">
            <div className="academy-mission-heading">
              <span className="academy-icon-tile"><Sparkles size={18} /></span>
              <div><p className="card-kicker">আজকের mission</p><h2 id="mission-heading">{current?.banglaTitle ?? "তোমার review queue"}</h2></div>
              <span className="academy-duration"><Clock3 size={14} /> {current?.estimatedMinutes ?? 5} মিনিট</span>
            </div>
            <p>{current?.objectives[0] ?? "আজ একটি ছোট practice session শুরু করো এবং পরের শেখার নির্দেশনা তৈরি করো।"}</p>
            <div className="academy-mission-actions">
              <Button variant="outline" onClick={() => current ? setLocation(`/lesson/${current.id}`) : setLocation("/practice")}>শুরু করো <ArrowRight size={16} /></Button>
              <button type="button" className="academy-text-action" onClick={() => setLocation("/course/course-english-foundations")}>Learning Map দেখো</button>
            </div>
          </section>

          <section className="academy-path paper-card" aria-labelledby="path-heading">
            <div className="section-heading-row"><div><p className="card-kicker">Learning map</p><h2 className="section-title" id="path-heading">A1 Foundation</h2></div><span className="route-progress">{completed}/{roadmap.length || 1} সম্পন্ন</span></div>
            <Trail steps={trailSteps} onCurrentClick={() => current && setLocation(`/lesson/${current.id}`)} />
            <div className="academy-path-footer"><span>অগ্রগতি এই device-এই সংরক্ষিত থাকে।</span><button type="button" onClick={() => setLocation("/course/course-english-foundations")}>পূর্ণ map <ArrowRight size={14} /></button></div>
          </section>

          <section aria-labelledby="tools-heading">
            <div className="academy-section-heading"><div><p className="card-kicker">Quick tools</p><h2 className="section-title" id="tools-heading">আজ যে tool দরকার</h2></div><button type="button" className="academy-text-action" onClick={() => setLocation("/tools")}>সব tools <ArrowRight size={15} /></button></div>
            <div className="academy-tool-grid">
              <button type="button" className="academy-tool-card" onClick={() => setLocation("/practice")}><span className="academy-icon-tile"><BrainCircuit size={18} /></span><strong>Quick Practice</strong><small>একটি focused question session</small></button>
              <button type="button" className="academy-tool-card" onClick={() => setLocation("/vocabulary")}><span className="academy-icon-tile"><BookOpenCheck size={18} /></span><strong>Vocabulary</strong><small>শব্দ খোঁজো ও শুনো</small></button>
              <button type="button" className="academy-tool-card" onClick={() => setLocation("/grammar")}><span className="academy-icon-tile"><LibraryBig size={18} /></span><strong>Grammar</strong><small>পরের ধারণাটি পরিষ্কার করো</small></button>
            </div>
          </section>
        </section>

        <aside className="academy-insight-rail" aria-label="আজকের learning signals">
          <section className="academy-insight-card paper-card"><div className="academy-insight-title"><CalendarDays size={17} /> আজকের signal</div><strong>{completionRate}%</strong><p>তোমার current course completion</p><div className="mini-meter"><span style={{ width: `${completionRate}%` }} /></div></section>
          <button type="button" className="review-card" onClick={() => setLocation("/review")}><span className="review-icon"><RotateCcw size={16} /></span><span><strong>{dueCount ? `${dueCount}টি review অপেক্ষায়` : "Review queue পরিষ্কার"}</strong><small>{dueCount ? "কয়েকটি প্রশ্নে মনে ঝালিয়ে নাও" : "নতুন lesson শুরু করতে পারো"}</small></span><ArrowRight size={16} /></button>
          <section className="academy-rail-callout"><span className="academy-icon-tile"><Wrench size={17} /></span><div><p>Study tools</p><strong>যে skill দরকার, সেটিই বেছে নাও।</strong><button type="button" onClick={() => setLocation("/tools")}>Tools খুলুন <ArrowRight size={14} /></button></div></section>
        </aside>
      </div>
      <PhaseZeroNotice />
    </AppShell>
  );
}
