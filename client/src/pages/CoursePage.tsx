/**
 * Design reminder — “ভাষার মানচিত্র”: the course is a clear hierarchy of levels,
 * units and lesson landmarks; upcoming territory is explicitly marked, never faked.
 */
import { ArrowRight, Check, LockKeyhole, MapPinned, Navigation } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { learningUseCases } from "@/application/usecases/LearningUseCases";
import { AppShell } from "@/components/app/AppShell";
import type { Lesson, UserLessonProgress } from "@/domain/learning/types";

type RoadmapItem = { lesson: Lesson; progress?: UserLessonProgress };
type CourseMap = Awaited<ReturnType<typeof learningUseCases.getCourseMap>>;

export default function CoursePage() {
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [courseMap, setCourseMap] = useState<CourseMap>([]);
  useEffect(() => { void Promise.all([learningUseCases.getRoadmap(), learningUseCases.getCourseMap("course-english-foundations")]).then(([roadmap, map]) => { setItems(roadmap); setCourseMap(map); }); }, []);
  const completed = items.filter((item) => item.progress?.completed).length;
  return <AppShell eyebrow="পাঠ্যপথ" title="English Foundations">
    <section className="course-banner paper-card map-contour"><div><p className="card-kicker">Pre-A1 থেকে C2</p><h2>শুনে, বলে ও গড়ে<br /><em>প্রতিদিনের ইংরেজি।</em></h2><p>এই Phase 1 learning map-এ ৮টি interactive lesson, grammar landmark এবং multiple practice format রয়েছে।</p></div><img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663892230510/wfNUGHsLrOqaIEXj.jpg" alt="lesson-এর একটি চিত্রিত learning trail" /></section>
    <section className="course-progress-strip"><MapPinned size={19} /><span>তোমার পথ</span><div><i style={{ width: `${Math.round((completed / Math.max(1, items.length)) * 100)}%` }} /></div><strong>{completed}/{items.length} lesson</strong></section>
    <section className="level-atlas" aria-label="English course level map">{courseMap.map(({ level, units }) => <article className={`level-landmark level-${level.availability ?? "available"}`} key={level.id}><div className="level-code">{level.code}</div><div><p>{level.availability === "coming-soon" ? "পথ প্রস্তুত হচ্ছে" : `${units.length}টি unit`}</p><h2>{level.title}</h2><span>{level.summary}</span></div>{level.availability === "coming-soon" ? <span className="coming-soon">Coming soon</span> : <div className="level-unit-links">{units.map(({ unit }) => <Link key={unit.id} href={`/unit/${unit.id}`}>{unit.title} <ArrowRight size={13} /></Link>)}</div>}</article>)}</section>
    <section className="section-heading-row course-roadmap-heading"><div><p className="card-kicker">বর্তমান detail route</p><h2 className="section-title">আজকের lesson landmarks</h2></div><Navigation size={19} /></section>
    <section className="course-map-list">{items.map((item, index) => { const isAvailable = index <= completed; return <article className={`course-lesson ${item.progress?.completed ? "course-lesson-complete" : isAvailable ? "course-lesson-current" : "course-lesson-locked"}`} key={item.lesson.id}><span className="course-number">{item.progress?.completed ? <Check size={16} /> : isAvailable ? "→" : <LockKeyhole size={15} />}</span><div><p>Lesson {item.lesson.order.toString().padStart(2, "0")} · {item.lesson.estimatedMinutes} মিনিট</p><h2>{item.lesson.banglaTitle}</h2><span>{item.lesson.objectives[0]}</span></div>{isAvailable ? <Link href={`/lesson/${item.lesson.id}`} className="lesson-link">{item.progress?.completed ? "আবার দেখো" : "শুরু করো"} <ArrowRight size={16} /></Link> : <span className="locked-note">আগের lesson শেষ হলে খুলবে</span>}</article>; })}</section>
  </AppShell>;
}
