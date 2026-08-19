/** Design reminder — “Emerald Study House”: a level page explains academic purpose before asking for effort. */
import { ArrowLeft, ArrowRight, CheckCircle2, LockKeyhole } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { learningUseCases } from "@/application/usecases/LearningUseCases";
import { AppShell } from "@/components/app/AppShell";

type CourseMap = Awaited<ReturnType<typeof learningUseCases.getCourseMap>>;

export default function LevelPage() {
  const [location, setLocation] = useLocation(); const code = decodeURIComponent(location.match(/\/(?:learn\/)?levels?\/([^/?#]+)/)?.[1] ?? "A1"); const [courseMap, setCourseMap] = useState<CourseMap>([]);
  useEffect(() => { void learningUseCases.getCourseMap("course-english-foundations").then(setCourseMap); }, []);
  const entry = courseMap.find((item) => item.level.code === code || item.level.id === code);
  if (!entry) return <AppShell eyebrow="CEFR level" title="Level খুঁজে পাওয়া যায়নি"><button className="back-link" onClick={() => setLocation("/learn")}><ArrowLeft size={17} /> Learning path-এ ফিরি</button></AppShell>;
  const nextUnit = entry.units.find((unit) => unit.unlocked && !unit.completed) ?? entry.units.find((unit) => unit.unlocked);
  return <AppShell eyebrow={`CEFR ${entry.level.code}`} title={entry.level.title}><section className="level-study-hero paper-card"><p className="card-kicker">{entry.completed ? "Level complete" : entry.unlocked ? "Your current study level" : "Prerequisite required"}</p><h2>{entry.level.objective ?? entry.level.summary}</h2><p>{entry.level.summary}</p></section>{nextUnit && <section className="study-next-action level-next-action"><div><p className="card-kicker">Next study action</p><h2>{nextUnit.unit.title}</h2><p>{nextUnit.unit.objective ?? nextUnit.unit.summary}</p></div><Link href={`/unit/${nextUnit.unit.id}`} className="lesson-link">{nextUnit.completed ? "Review unit" : "Continue"}<ArrowRight size={16} /></Link></section>}<section className="learning-ledger-heading"><div><p className="card-kicker">Level ledger</p><h2>Unit, lesson ও skill focus</h2></div><span>{entry.units.length}টি unit</span></section><section className="level-unit-list">{entry.units.map(({ unit, lessons, chapters, unlocked, completed }) => <article className={`level-unit-card ${unlocked ? "is-open" : "is-locked"}`} key={unit.id}><div className="unit-index">{completed ? <CheckCircle2 size={20} /> : String(unit.order).padStart(2, "0")}</div><div><p>{chapters.length ? `${chapters.length} chapter · ` : ""}{lessons.length} lesson</p><h2>{unit.title}</h2><span>{unit.objective ?? unit.summary}</span></div>{unlocked ? <Link href={`/unit/${unit.id}`} className="lesson-link">{completed ? "Review" : "Continue"}<ArrowRight size={16} /></Link> : <span className="locked-note"><LockKeyhole size={14} />আগে প্রয়োজনীয় unit শেষ করো</span>}</article>)}</section></AppShell>;
}
