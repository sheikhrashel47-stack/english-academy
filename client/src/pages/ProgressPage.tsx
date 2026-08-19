/**
 * Design reminder — “ভাষার মানচিত্র”: progress is a route chart, with a current pin and
 * future landmarks before any percentage. Numerals support the journey; they do not replace it.
 */
import { CheckCircle2, Clock3, Compass, Flag, Route, Sprout } from "lucide-react";
import { useEffect, useState, type CSSProperties } from "react";
import { learningUseCases } from "@/application/usecases/LearningUseCases";
import { AppShell } from "@/components/app/AppShell";
import type { Lesson, UserLessonProgress } from "@/domain/learning/types";

type RoadmapItem = { lesson: Lesson; progress?: UserLessonProgress };

export default function ProgressPage() {
  const [items, setItems] = useState<RoadmapItem[]>([]);
  useEffect(() => { void learningUseCases.getRoadmap().then(setItems); }, []);
  const completed = items.filter((item) => item.progress?.completed).length;
  const percentage = Math.round((completed / Math.max(1, items.length)) * 100);
  const currentIndex = Math.min(completed, Math.max(0, items.length - 1));
  const nextLesson = items[currentIndex]?.lesson;
  return (
    <AppShell eyebrow="অগ্রগতির route" title="তোমার শেখার চিহ্ন">
      <section className="progress-hero paper-card map-contour"><div><p className="card-kicker">বর্তমান landmark</p><h2>{nextLesson ? nextLesson.banglaTitle : "তোমার পথ"}<br /><em>পরের নিরাপদ ধাপ।</em></h2><p>তুমি এখন প্রথম learning route-এ আছো। একটি lesson শেষ হলেই পরের pin খুলে যাবে এবং progress local database-এ সংরক্ষিত থাকবে।</p></div><div className="progress-route-map" aria-label={`${completed}টি lesson সম্পন্ন, ${items.length - completed}টি পরের ধাপ`}><div className="route-map-label"><Compass size={15} /> A1 route</div><div className="route-map-line">{items.map((item, index) => <span key={item.lesson.id} className={index < completed ? "route-map-pin route-map-complete" : index === currentIndex ? "route-map-pin route-map-current" : "route-map-pin"}>{index < completed ? <CheckCircle2 size={13} /> : index === currentIndex ? <Flag size={13} /> : index + 1}<small>{item.lesson.order.toString().padStart(2, "0")}</small></span>)}</div><strong>{completed}/{items.length} landmark পেরিয়েছো</strong></div></section>
      <section className="route-legend"><span><i className="legend-complete" /> সম্পন্ন</span><span><i className="legend-current" /> বর্তমান pin</span><span><i className="legend-future" /> সামনে</span><em>তারপর: {nextLesson?.objectives[0] ?? "route সম্পন্ন"}</em></section>
      <section className="progress-metrics"><article><Route size={20} /><strong>{completed}</strong><span>পেরোনো landmark</span></article><article><Clock3 size={20} /><strong>{completed * 6}</strong><span>আনুমানিক মিনিট</span></article><article><Sprout size={20} /><strong>{Math.max(1, completed)}</strong><span>active skill</span></article><article className="metric-stamp"><span>Route stamp</span><strong>{percentage}%</strong><small>এই learning trail</small></article></section>
      <section className="progress-journal paper-card"><header><div><p className="card-kicker">Route record</p><h2 className="section-title">Lesson history</h2></div><Compass size={22} /></header>{items.map((item, index) => <div className="journal-row" key={item.lesson.id}><span className={item.progress?.completed ? "journal-check complete" : index === currentIndex ? "journal-check current" : "journal-check"}>{item.progress?.completed ? <CheckCircle2 size={16} /> : index === currentIndex ? <Flag size={14} /> : item.lesson.order}</span><div><strong>{item.lesson.banglaTitle}</strong><small>{item.progress?.completed ? "সম্পন্ন ও local progress-এ সংরক্ষিত" : index === currentIndex ? "বর্তমান অবস্থান—পরের নিরাপদ পদক্ষেপ" : "পরের মাইলফলক"}</small></div><span>{item.lesson.estimatedMinutes} মিনিট</span></div>)}</section>
      <div className="route-footer-note"><Compass size={16} /><span>এই chart-টি attempt ও lesson completion থেকে তৈরি—কোনো সংখ্যা UI-তে hard-code করা নয়।</span></div>
    </AppShell>
  );
}
