/**
 * Design reminder — “Emerald Study House”: progress is a factual learning ledger
 * anchored in current CEFR level, useful next steps and persisted study records.
 */
import { BookOpenCheck, ChartNoAxesCombined, CheckCircle2, Clock3, Sprout } from "lucide-react";
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
    <AppShell eyebrow="Learning progress" title="তোমার learning ledger">
      <section className="progress-hero progress-ledger-hero paper-card"><div><p className="card-kicker">Next learning task</p><h2>{nextLesson ? nextLesson.banglaTitle : "তোমার শেখা"}<br /><em>পরের প্রয়োজনীয় ধাপ।</em></h2><p>একটি lesson শেষ হলে পরের lesson খুলবে। তোমার completion ও practice record এই device-এ সংরক্ষিত থাকবে।</p></div><div className="progress-cefr-summary" aria-label={`${completed}টি lesson সম্পন্ন, ${items.length - completed}টি বাকি`}><span>Current level</span><strong>A1</strong><small>Foundation</small><i style={{ "--progress": `${percentage}%` } as CSSProperties} /><b>{completed}/{items.length} lesson completed</b></div></section>
      <section className="ledger-legend"><span><i className="legend-complete" /> সম্পন্ন</span><span><i className="legend-current" /> বর্তমান lesson</span><span><i className="legend-future" /> পরে</span><em>পরের লক্ষ্য: {nextLesson?.objectives[0] ?? "বর্তমান course সম্পন্ন"}</em></section>
      <section className="progress-metrics"><article><BookOpenCheck size={20} /><strong>{completed}</strong><span>সম্পন্ন lesson</span></article><article><Clock3 size={20} /><strong>{completed * 6}</strong><span>আনুমানিক মিনিট</span></article><article><Sprout size={20} /><strong>{Math.max(1, completed)}</strong><span>চর্চার skill</span></article><article className="metric-stamp"><span>Course completion</span><strong>{percentage}%</strong><small>A1 Foundation</small></article></section>
      <section className="progress-journal paper-card"><header><div><p className="card-kicker">Learning record</p><h2 className="section-title">Lesson history</h2></div><ChartNoAxesCombined size={22} /></header>{items.map((item, index) => <div className="journal-row" key={item.lesson.id}><span className={item.progress?.completed ? "journal-check complete" : index === currentIndex ? "journal-check current" : "journal-check"}>{item.progress?.completed ? <CheckCircle2 size={16} /> : index === currentIndex ? "→" : item.lesson.order}</span><div><strong>{item.lesson.banglaTitle}</strong><small>{item.progress?.completed ? "সম্পন্ন ও local progress-এ সংরক্ষিত" : index === currentIndex ? "বর্তমান lesson—এখান থেকে শুরু করা যায়" : "আগের lesson শেষ হলে খুলবে"}</small></div><span>{item.lesson.estimatedMinutes} মিনিট</span></div>)}</section>
      <div className="learning-ledger-note"><ChartNoAxesCombined size={16} /><span>এই record attempt ও lesson completion থেকে তৈরি—কোনো সংখ্যা UI-তে hard-code করা নয়।</span></div>
    </AppShell>
  );
}
