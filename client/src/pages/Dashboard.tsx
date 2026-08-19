/**
 * Design reminder — “ভাষার মানচিত্র”: the dashboard is an asymmetric learning trail,
 * not a generic card grid. Today’s next step is visually stronger than aggregate numbers.
 */
import { ArrowRight, BookOpenCheck, CalendarDays, Check, Clock3, Compass, Play, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { learningUseCases } from "@/application/usecases/LearningUseCases";
import { AppShell, PhaseZeroNotice } from "@/components/app/AppShell";
import { Trail, type TrailStep } from "@/components/app/Trail";
import { Button } from "@/components/ui/button";
import type { Lesson, UserLessonProgress } from "@/domain/learning/types";

type RoadmapItem = { lesson: Lesson; progress?: UserLessonProgress };

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>([]);
  const [dueCount, setDueCount] = useState(0);

  useEffect(() => {
    void Promise.all([learningUseCases.getRoadmap(), learningUseCases.getDueReviews()]).then(([items, due]) => {
      setRoadmap(items);
      setDueCount(due.length);
    });
  }, []);

  const completed = roadmap.filter((item) => item.progress?.completed).length;
  const current = roadmap.find((item) => !item.progress?.completed)?.lesson ?? roadmap[0]?.lesson;
  const trailSteps: TrailStep[] = roadmap.map((item, index) => ({
    id: item.lesson.id,
    title: item.lesson.banglaTitle,
    shortLabel: item.lesson.title,
    status: item.progress?.completed ? "complete" : index === completed ? "current" : "locked",
  }));

  return (
    <AppShell eyebrow="তোমার learning trail" title="আজ কোথা থেকে শুরু করবে?">
      <div className="dashboard-layout">
        <section className="dashboard-main">
          <div className="welcome-hero paper-card map-contour">
            <div className="hero-copy">
              <p className="card-kicker">তোমার বর্তমান অবস্থান</p>
              <h2>ছোট পদক্ষেপও<br /><em>একটি ভাষার পথ।</em></h2>
              <p>তুমি ঠিক এখানেই থেমেছিলে। আজ একটি ছোট পাঠ শেষ করলে তোমার পথ আরও স্পষ্ট হবে।</p>
              <Button className="hero-cta" onClick={() => current && setLocation(`/lesson/${current.id}`)}>
                <Play size={16} fill="currentColor" /> {current ? "পাঠে ফিরে যাও" : "পথ প্রস্তুত হচ্ছে"}
              </Button>
            </div>
            <img className="hero-map" src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663892230510/kRctOjkIblDGTRRF.jpg" alt="ইংরেজি শেখার একটি চিত্রিত পথ" />
          </div>

          <section className="trail-panel paper-card">
            <div className="section-heading-row">
              <div><p className="card-kicker">A1 · First steps</p><h2 className="section-title">তোমার প্রথম পথ</h2></div>
              <span className="route-progress">{completed}/{roadmap.length || 5} সম্পন্ন</span>
            </div>
            <Trail steps={trailSteps} onCurrentClick={() => current && setLocation(`/lesson/${current.id}`)} />
            <div className="trail-caption"><Compass size={15} /> প্রতিটি pin একটি lesson। তোমার অগ্রগতি এই device-এই সংরক্ষিত থাকে।</div>
          </section>

          <section className="continue-panel">
            <div className="continue-title"><span className="small-compass"><Sparkles size={17} /></span><div><p className="card-kicker">আজকের পরের পদক্ষেপ</p><h2>{current?.banglaTitle ?? "পাঠগুলো সম্পন্ন"}</h2></div></div>
            <div className="continue-meta"><span><Clock3 size={15} /> {current?.estimatedMinutes ?? 0} মিনিট</span><span><BookOpenCheck size={15} /> {current?.objectives[0] ?? "আবার রিভিউ করো"}</span></div>
            <Button variant="outline" onClick={() => current && setLocation(`/lesson/${current.id}`)}>শুরু করো <ArrowRight size={16} /></Button>
          </section>
        </section>

        <aside className="today-rail">
          <section className="today-card paper-card">
            <div className="today-card-title"><CalendarDays size={18} /><span>আজ</span></div>
            <div className="today-stat"><strong>{completed}</strong><span>টি lesson<br />সম্পন্ন</span></div>
            <div className="mini-meter"><span style={{ width: `${Math.min(100, Math.round((completed / Math.max(1, roadmap.length)) * 100))}%` }} /></div>
            <p>প্রতিদিন অল্প করলে শেখাটা ধরে রাখা সহজ হয়।</p>
          </section>
          <button type="button" className="review-card" onClick={() => setLocation("/practice")}>
            <span className="review-icon"><Check size={16} /></span>
            <span><strong>{dueCount ? `${dueCount}টি review অপেক্ষায়` : "পুনরাবৃত্তির জন্য প্রস্তুত"}</strong><small>একটি দ্রুত প্রশ্ন দিয়ে মনে ঝালিয়ে নাও</small></span>
            <ArrowRight size={16} />
          </button>
          <section className="study-visual" aria-label="মনোযোগী শেখার পরিবেশ">
            <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663892230510/BixeMKhCdFfWHJid.jpg" alt="নোটবুক, হেডফোন ও পড়ার সরঞ্জামের চিত্র" />
            <div><p>আজকের ছোট প্রস্তুতি</p><strong>শুনো, বলো, মনে রাখো।</strong></div>
          </section>
        </aside>
      </div>
      <PhaseZeroNotice />
    </AppShell>
  );
}
