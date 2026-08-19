/**
 * Design reminder — “ভাষার মানচিত্র”: a quiet editorial reading lane; lesson blocks stay
 * content-driven, with the learner’s position shown as a subtle trail landmark.
 */
import { ArrowLeft, CheckCircle2, Clock3, Flag, ListTree, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { learningUseCases } from "@/application/usecases/LearningUseCases";
import { AppShell } from "@/components/app/AppShell";
import { LessonBlockRenderer } from "@/components/learning/LessonBlockRenderer";
import { Button } from "@/components/ui/button";
import type { LessonBundle } from "@/data/repositories/LearningRepository";

export default function LessonPage() {
  const [, params] = useRoute("/lesson/:lessonId");
  const [, setLocation] = useLocation();
  const [bundle, setBundle] = useState<LessonBundle>();
  const [answered, setAnswered] = useState(0);

  useEffect(() => {
    if (!params?.lessonId) return;
    void learningUseCases.getLesson(params.lessonId).then(setBundle);
  }, [params?.lessonId]);

  if (!bundle) return <AppShell eyebrow="পাঠ লোড হচ্ছে" title="একটু অপেক্ষা করো"><div className="loading-sheet">তোমার পাঠ প্রস্তুত করা হচ্ছে…</div></AppShell>;
  const { lesson, questions, vocabulary } = bundle;
  const answeredPercent = Math.min(100, Math.round((answered / Math.max(1, questions.length)) * 100));

  return (
    <AppShell eyebrow="A1 · Hello, English" title={lesson.banglaTitle}>
      <div className="lesson-layout">
        <article className="lesson-reader paper-card">
          <button className="back-link" onClick={() => setLocation("/dashboard")}><ArrowLeft size={17} /> তোমার পথে ফিরে যাও</button>
          <header className="lesson-header">
            <div><p className="card-kicker">Lesson {lesson.order.toString().padStart(2, "0")}</p><h2>{lesson.title}</h2><p>{lesson.objectives[0]}</p></div>
            <div className="lesson-time"><Clock3 size={16} /><span>{lesson.estimatedMinutes} মিনিট</span></div>
          </header>
          <div className="lesson-blocks">
            {lesson.blocks.map((block) => <LessonBlockRenderer key={block.id} block={block} vocabulary={vocabulary} questions={questions} onAnswered={() => setAnswered((value) => value + 1)} />)}
          </div>
          <footer className="lesson-footer"><div><CheckCircle2 size={17} /><span>{answered ? `${answered}টি উত্তর সংরক্ষিত` : "প্রস্তুত হলে প্রশ্নটির উত্তর দাও"}</span></div><Button onClick={() => setLocation("/dashboard")}>পথে ফিরে যাও</Button></footer>
        </article>
        <aside className="lesson-margin">
          <section className="lesson-landmark"><div className="landmark-number">{lesson.order.toString().padStart(2, "0")}</div><span>বর্তমান lesson</span><div className="landmark-line"><i style={{ height: `${answeredPercent}%` }} /></div><small>{answeredPercent}% check point সম্পন্ন</small></section>
          <section className="objectives-note"><Target size={18} /><div><span>এই পাঠে</span>{lesson.objectives.map((item) => <p key={item}>{item}</p>)}</div></section>
          <section className="objectives-note"><ListTree size={18} /><div><span>Skill focus</span><p>{lesson.skillFocus.join(" · ")}</p></div></section>
          <button type="button" className="flag-link" onClick={() => window.alert("Phase 0 prototype: bookmark feature পরের ধাপে যুক্ত হবে।")}><Flag size={16} /> পরে পড়ব</button>
        </aside>
      </div>
    </AppShell>
  );
}
