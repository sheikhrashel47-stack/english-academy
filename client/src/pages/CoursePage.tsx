/**
 * Design reminder — “ভাষার মানচিত্র”: course content is a navigable route with clear
 * unlocked and future landmarks, never an undifferentiated content dump.
 */
import { ArrowRight, Check, LockKeyhole, MapPinned } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { learningUseCases } from "@/application/usecases/LearningUseCases";
import { AppShell } from "@/components/app/AppShell";
import type { Lesson, UserLessonProgress } from "@/domain/learning/types";

type RoadmapItem = { lesson: Lesson; progress?: UserLessonProgress };

export default function CoursePage() {
  const [items, setItems] = useState<RoadmapItem[]>([]);
  useEffect(() => { void learningUseCases.getRoadmap().then(setItems); }, []);
  const completed = items.filter((item) => item.progress?.completed).length;

  return (
    <AppShell eyebrow="পাঠ্যপথ" title="English Foundations">
      <section className="course-banner paper-card map-contour"><div><p className="card-kicker">A1 থেকে A2</p><h2>শুনে, বলে ও গড়ে<br /><em>প্রতিদিনের ইংরেজি।</em></h2><p>এই Phase 0 prototype-এ content system যাচাইয়ের জন্য মাত্র ৫টি lesson রাখা হয়েছে।</p></div><img src="/manus-storage/english-academy-lesson-trail_873b2945.jpg" alt="lesson-এর একটি চিত্রিত learning trail" /></section>
      <section className="course-progress-strip"><MapPinned size={19} /><span>তোমার পথ</span><div><i style={{ width: `${Math.round((completed / Math.max(1, items.length)) * 100)}%` }} /></div><strong>{completed}/{items.length} lesson</strong></section>
      <section className="course-map-list">
        {items.map((item, index) => {
          const isAvailable = index <= completed;
          return <article className={`course-lesson ${item.progress?.completed ? "course-lesson-complete" : isAvailable ? "course-lesson-current" : "course-lesson-locked"}`} key={item.lesson.id}>
            <span className="course-number">{item.progress?.completed ? <Check size={16} /> : isAvailable ? "→" : <LockKeyhole size={15} />}</span>
            <div><p>Lesson {item.lesson.order.toString().padStart(2, "0")} · {item.lesson.estimatedMinutes} মিনিট</p><h2>{item.lesson.banglaTitle}</h2><span>{item.lesson.objectives[0]}</span></div>
            {isAvailable ? <Link href={`/lesson/${item.lesson.id}`} className="lesson-link">{item.progress?.completed ? "আবার দেখো" : "শুরু করো"} <ArrowRight size={16} /></Link> : <span className="locked-note">আগের lesson শেষ হলে খুলবে</span>}
          </article>;
        })}
      </section>
    </AppShell>
  );
}
