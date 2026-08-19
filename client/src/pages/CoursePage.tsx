/**
 * Design reminder — “Emerald Study House”: the CEFR ribbon is the course’s
 * primary mastery motif; units and lessons read as a clear academic sequence.
 */
import { ArrowRight, Check, ChartNoAxesCombined, LockKeyhole } from "lucide-react";
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
  return <AppShell eyebrow="Learning map" title="English Foundations">
    <section className="academy-course-banner paper-card"><div><p className="card-kicker">CEFR-aligned learning path</p><h2>শুনে, বলে ও গড়ে<br /><em>প্রতিদিনের ইংরেজি।</em></h2><p>এই initial curriculum-এ {items.length}টি interactive lesson, grammar practice এবং vocabulary review রয়েছে।</p></div><div className="cefr-ribbon" aria-label="Pre-A1 থেকে C2 CEFR mastery ribbon"><span className="cefr-ribbon-label">Your CEFR journey</span>{courseMap.map(({ level }) => <div className={`cefr-segment ${level.code === "A1" ? "cefr-segment-current" : level.availability === "coming-soon" ? "cefr-segment-future" : ""}`} key={level.id}><strong>{level.code}</strong><small>{level.code === "A1" ? "Current" : level.availability === "coming-soon" ? "Next" : "Open"}</small></div>)}</div></section>
    <section className="course-progress-strip"><ChartNoAxesCombined size={19} /><span>Current course progress</span><div><i style={{ width: `${Math.round((completed / Math.max(1, items.length)) * 100)}%` }} /></div><strong>{completed}/{items.length} lesson</strong></section>
    <section className="level-atlas" aria-label="CEFR course levels">{courseMap.map(({ level, units }) => <article className={`level-landmark level-${level.availability ?? "available"}`} key={level.id}><div className="level-code">{level.code}</div><div><p>{level.availability === "coming-soon" ? "পরে খুলবে" : `${units.length}টি unit`}</p><h2>{level.title}</h2><span>{level.summary}</span></div>{level.availability === "coming-soon" ? <span className="coming-soon">পরবর্তী স্তর</span> : <div className="level-unit-links">{units.map(({ unit }) => <Link key={unit.id} href={`/unit/${unit.id}`}>{unit.title} <ArrowRight size={13} /></Link>)}</div>}</article>)}</section>
    <section className="section-heading-row course-roadmap-heading"><div><p className="card-kicker">Current learning sequence</p><h2 className="section-title">আজকের lesson sequence</h2></div><ChartNoAxesCombined size={19} /></section>
    <section className="course-sequence-list">{items.map((item, index) => { const isAvailable = index <= completed; return <article className={`course-sequence-item ${item.progress?.completed ? "course-sequence-complete" : isAvailable ? "course-sequence-current" : "course-sequence-locked"}`} key={item.lesson.id}><span className="course-number">{item.progress?.completed ? <Check size={16} /> : isAvailable ? "→" : <LockKeyhole size={15} />}</span><div><p>Lesson {item.lesson.order.toString().padStart(2, "0")} · {item.lesson.estimatedMinutes} মিনিট</p><h2>{item.lesson.banglaTitle}</h2><span>{item.lesson.objectives[0]}</span></div>{isAvailable ? <Link href={`/lesson/${item.lesson.id}`} className="lesson-link">{item.progress?.completed ? "আবার দেখো" : "শুরু করো"} <ArrowRight size={16} /></Link> : <span className="locked-note">আগের lesson শেষ হলে খুলবে</span>}</article>; })}</section>
  </AppShell>;
}
