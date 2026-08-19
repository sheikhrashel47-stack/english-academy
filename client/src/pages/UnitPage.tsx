/** Design reminder — “ভাষার মানচিত্র”: a unit is a short route segment, not a generic card grid. */
import { ArrowRight, Compass, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { learningUseCases } from "@/application/usecases/LearningUseCases";
import { AppShell } from "@/components/app/AppShell";
import type { Lesson, Level, Unit } from "@/domain/learning/types";

export default function UnitPage() {
  const [, params] = useRoute("/unit/:unitId");
  const [bundle, setBundle] = useState<{ unit: Unit; level: Level; lessons: Lesson[] }>();
  useEffect(() => { if (params?.unitId) void learningUseCases.getUnit(params.unitId).then(setBundle); }, [params?.unitId]);
  if (!bundle) return <AppShell eyebrow="Unit" title="পথটি খোলা হচ্ছে…"><div className="route-loading">Learning trail সাজানো হচ্ছে…</div></AppShell>;
  return <AppShell eyebrow={`${bundle.level.code} · Unit ${bundle.unit.order}`} title={bundle.unit.title}>
    <section className="unit-hero paper-card map-contour"><div><p className="card-kicker"><Compass size={15} /> শেখার segment</p><h2>{bundle.unit.summary}</h2><p>এই unit-এ {bundle.lessons.length}টি landmark আছে। প্রতিটি lesson শেষ হলে পরের চিহ্নটি আরও পরিষ্কার হবে।</p></div><span className="unit-hero-stamp">{bundle.level.code}</span></section>
    <section className="unit-route" aria-label="unit lessons">{bundle.lessons.map((lesson, index) => <article className="unit-route-item" key={lesson.id}><span className="route-pin"><MapPin size={17} /></span><div><p>Landmark {String(index + 1).padStart(2, "0")} · {lesson.estimatedMinutes} মিনিট</p><h2>{lesson.banglaTitle}</h2><span>{lesson.objectives[0]}</span></div><Link href={`/lesson/${lesson.id}`} className="lesson-link">খুলো <ArrowRight size={16} /></Link></article>)}</section>
  </AppShell>;
}
