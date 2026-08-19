/** Design reminder — “Emerald Study House”: optional chapters form readable study chapters within a unit. */
import { ArrowLeft, ArrowRight, BookOpenCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { learningUseCases } from "@/application/usecases/LearningUseCases";
import { AppShell } from "@/components/app/AppShell";

type CourseMap = Awaited<ReturnType<typeof learningUseCases.getCourseMap>>;

export default function ChapterPage() {
  const [location, setLocation] = useLocation(); const chapterId = location.match(/\/(?:learn\/)?chapter\/([^/?#]+)/)?.[1]; const [courseMap, setCourseMap] = useState<CourseMap>([]);
  useEffect(() => { void learningUseCases.getCourseMap("course-english-foundations").then(setCourseMap); }, []);
  const match = courseMap.flatMap((level) => level.units.map((unit) => ({ level, unit, chapter: unit.chapters.find((chapter) => chapter.id === chapterId) }))).find((item) => item.chapter);
  if (!match?.chapter) return <AppShell eyebrow="Study chapter" title="Chapter খুঁজে পাওয়া যায়নি"><button className="back-link" onClick={() => setLocation("/learn")}><ArrowLeft size={17} /> Learning path-এ ফিরি</button></AppShell>;
  const lessons = match.unit.lessons.filter((lesson) => match.chapter?.lessonIds.includes(lesson.id));
  const nextLesson = lessons[0];
  return <AppShell eyebrow={`${match.level.level.code} · Chapter ${match.chapter.order}`} title={match.chapter.banglaTitle ?? match.chapter.title}><section className="chapter-hero paper-card"><BookOpenCheck size={28} /><div><p className="card-kicker">Study chapter</p><h2>{match.chapter.title}</h2><p>{match.chapter.summary}</p></div></section>{nextLesson && <section className="study-next-action"><div><p className="card-kicker">Next study action</p><h2>{nextLesson.banglaTitle}</h2><p>{nextLesson.estimatedMinutes} min · {nextLesson.skillFocus.join(" / ")} · {nextLesson.objectives[0]}</p></div><Link href={`/lesson/${nextLesson.id}`} className="lesson-link">Lesson শুরু করি <ArrowRight size={16} /></Link></section>}<section className="learning-ledger-heading"><div><p className="card-kicker">Chapter ledger</p><h2>এই chapter-এর lesson sequence</h2></div><span>{lessons.length}টি lesson</span></section><section className="chapter-lesson-list">{lessons.map((lesson, index) => <article key={lesson.id}><span>{String(index + 1).padStart(2, "0")}</span><div><p>{lesson.estimatedMinutes} min · {lesson.skillFocus.join(" / ")}</p><h2>{lesson.banglaTitle}</h2><small>{lesson.objectives[0]}</small></div><Link href={`/lesson/${lesson.id}`} className="lesson-link">Open <ArrowRight size={16} /></Link></article>)}</section></AppShell>;
}
