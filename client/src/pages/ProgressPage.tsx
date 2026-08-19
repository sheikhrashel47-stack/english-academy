/**
 * Design reminder — “Emerald Study House”: progress is a factual learning ledger
 * anchored in current CEFR level, useful next steps and persisted study records.
 */
import { BookOpenCheck, ChartNoAxesCombined, CheckCircle2, Clock3, Sprout } from "lucide-react";
import { useEffect, useState, type CSSProperties } from "react";
import { learningUseCases } from "@/application/usecases/LearningUseCases";
import { AppShell } from "@/components/app/AppShell";
import type { Lesson, UserLessonProgress } from "@/domain/learning/types";

type RoadmapItem = { lesson: Lesson; progress?: UserLessonProgress; unlocked: boolean; completed: boolean };
type LearningSummary = Awaited<ReturnType<typeof learningUseCases.getLearningSummary>>;

export default function ProgressPage() {
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [summary, setSummary] = useState<LearningSummary>();
  useEffect(() => { void Promise.all([learningUseCases.getRoadmap(), learningUseCases.getLearningSummary()]).then(([roadmap, nextSummary]) => { setItems(roadmap); setSummary(nextSummary); }); }, []);
  const completed = summary?.completedLessons ?? 0;
  const percentage = Math.round((completed / Math.max(1, summary?.totalLessons ?? items.length)) * 100);
  const currentIndex = Math.max(0, items.findIndex((item) => item.lesson.id === summary?.nextLesson?.lesson.id));
  const nextLesson = summary?.nextLesson?.lesson ?? items[currentIndex]?.lesson;
  const studyMinutes = Math.round((summary?.timeSpentSeconds ?? 0) / 60);
  return (
    <AppShell eyebrow="Learning progress" title="তোমার learning ledger">
      <section className="progress-hero progress-ledger-hero paper-card"><div><p className="card-kicker">Next learning task</p><h2>{nextLesson ? nextLesson.banglaTitle : "তোমার শেখা"}<br /><em>পরের প্রয়োজনীয় ধাপ।</em></h2><p>একটি lesson শেষ হলে পরের lesson খুলবে। তোমার completion ও practice record এই device-এ সংরক্ষিত থাকবে।</p></div><div className="progress-cefr-summary" aria-label={`${completed}টি lesson সম্পন্ন, ${(summary?.totalLessons ?? items.length) - completed}টি বাকি`}><span>Current level</span><strong>{summary?.currentLevel?.code ?? "Pre-A1"}</strong><small>{summary?.currentLevel?.title ?? "Foundation"}</small><i style={{ "--progress": `${percentage}%` } as CSSProperties} /><b>{completed}/{summary?.totalLessons ?? items.length} lesson completed</b></div></section>
      <section className="ledger-legend"><span><i className="legend-complete" /> সম্পন্ন</span><span><i className="legend-current" /> বর্তমান lesson</span><span><i className="legend-future" /> পরে</span><em>পরের লক্ষ্য: {nextLesson?.objectives[0] ?? "বর্তমান course সম্পন্ন"}</em></section>
      <section className="progress-metrics"><article><BookOpenCheck size={20} /><strong>{completed}</strong><span>সম্পন্ন lesson</span></article><article><Clock3 size={20} /><strong>{studyMinutes}</strong><span>চর্চার মিনিট</span></article><article><Sprout size={20} /><strong>{summary?.practicedSkills.length ?? 0}</strong><span>চর্চার skill</span></article><article className="metric-stamp"><span>Assessment</span><strong>{summary?.completedAssessments ?? 0}/{summary?.totalAssessments ?? 0}</strong><small>{summary?.currentLevel?.code ?? "Pre-A1"} progress</small></article></section>
      <section className="progress-journal paper-card"><header><div><p className="card-kicker">Learning record</p><h2 className="section-title">Lesson history</h2></div><ChartNoAxesCombined size={22} /></header>{items.map((item, index) => <div className="journal-row" key={item.lesson.id}><span className={item.completed ? "journal-check complete" : index === currentIndex ? "journal-check current" : "journal-check"}>{item.completed ? <CheckCircle2 size={16} /> : index === currentIndex ? "→" : item.lesson.order}</span><div><strong>{item.lesson.banglaTitle}</strong><small>{item.completed ? "সম্পন্ন ও local progress-এ সংরক্ষিত" : item.unlocked ? "বর্তমান lesson—এখান থেকে শুরু করা যায়" : "আগের lesson শেষ হলে খুলবে"}</small></div><span>{item.lesson.estimatedMinutes} মিনিট</span></div>)}</section>
      <div className="learning-ledger-note"><ChartNoAxesCombined size={16} /><span>এই record attempt ও lesson completion থেকে তৈরি—কোনো সংখ্যা UI-তে hard-code করা নয়।</span></div>
    </AppShell>
  );
}
