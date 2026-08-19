/**
 * Design reminder — “Emerald Study House”: progress is a factual learning ledger
 * anchored in current CEFR level, useful next steps and persisted study records.
 */
import { Award, BookOpenCheck, ChartNoAxesCombined, CheckCircle2, Clock3, Sprout, Target } from "lucide-react";
import { useEffect, useState, type CSSProperties } from "react";
import { learningUseCases } from "@/application/usecases/LearningUseCases";
import { AppShell } from "@/components/app/AppShell";
import type { LabSkill, Lesson, SkillMastery, UserLessonProgress } from "@/domain/learning/types";

type RoadmapItem = { lesson: Lesson; progress?: UserLessonProgress; unlocked: boolean; completed: boolean };
type LearningSummary = Awaited<ReturnType<typeof learningUseCases.getLearningSummary>>;
type SkillRecommendation = Awaited<ReturnType<typeof learningUseCases.getSkillRecommendations>>[number];
type CompletionBadge = Awaited<ReturnType<typeof learningUseCases.getCompletionBadges>>[number];
const skillLabel: Record<LabSkill, string> = { listening: "Listening", pronunciation: "Pronunciation", speaking: "Speaking", reading: "Reading", writing: "Writing", communication: "Communication" };

export default function ProgressPage() {
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [summary, setSummary] = useState<LearningSummary>();
  const [skillMastery, setSkillMastery] = useState<SkillMastery[]>([]);
  const [recommendations, setRecommendations] = useState<SkillRecommendation[]>([]);
  const [badges, setBadges] = useState<CompletionBadge[]>([]);
  useEffect(() => { void Promise.all([learningUseCases.getRoadmap(), learningUseCases.getLearningSummary(), learningUseCases.getSkillMastery(), learningUseCases.getSkillRecommendations(), learningUseCases.getCompletionBadges()]).then(([roadmap, nextSummary, mastery, nextRecommendations, nextBadges]) => { setItems(roadmap); setSummary(nextSummary); setSkillMastery(mastery); setRecommendations(nextRecommendations); setBadges(nextBadges); }); }, []);
  const completed = summary?.completedLessons ?? 0;
  const percentage = Math.round((completed / Math.max(1, summary?.totalLessons ?? items.length)) * 100);
  const currentIndex = Math.max(0, items.findIndex((item) => item.lesson.id === summary?.nextLesson?.lesson.id));
  const nextLesson = summary?.nextLesson?.lesson ?? items[currentIndex]?.lesson;
  const studyMinutes = Math.round((summary?.timeSpentSeconds ?? 0) / 60);
  const cefrLevels = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"];
  const currentLevelCode = summary?.currentLevel?.code ?? "Pre-A1";
  const currentLevelIndex = Math.max(0, cefrLevels.indexOf(currentLevelCode));
  const nextLevel = cefrLevels[currentLevelIndex + 1];
  return (
    <AppShell eyebrow="Learning progress" title="তোমার learning ledger">
      <section className="progress-hero progress-ledger-hero paper-card"><div><p className="card-kicker">Next learning task</p><h2>{nextLesson ? nextLesson.banglaTitle : "তোমার শেখা"}<br /><em>পরের প্রয়োজনীয় ধাপ।</em></h2><p>একটি lesson শেষ হলে পরের lesson খুলবে। তোমার completion ও practice record এই device-এ সংরক্ষিত থাকবে।</p><a className="progress-primary-action" href={`${import.meta.env.BASE_URL}${nextLesson ? `lesson/${nextLesson.id}` : "learn"}`}>Continue current study <span>→</span></a></div><div className="progress-cefr-summary" aria-label={`${completed}টি lesson সম্পন্ন, ${(summary?.totalLessons ?? items.length) - completed}টি বাকি`}><span>Current level</span><strong>{summary?.currentLevel?.code ?? "Pre-A1"}</strong><small>{summary?.currentLevel?.title ?? "Foundation"}</small><i style={{ "--progress": `${percentage}%` } as CSSProperties} /><b>{completed}/{summary?.totalLessons ?? items.length} lesson completed</b></div></section>
      <section className="progress-cefr-ribbon paper-card" aria-label={`CEFR learning path; current level ${currentLevelCode}`}><header><div><p className="card-kicker">CEFR learning path</p><h2>তোমার বর্তমান level থেকে পরের লক্ষ্য</h2></div><span>{nextLevel ? `Next · ${nextLevel}` : "Current · C2"}</span></header><div>{cefrLevels.map((level, index) => <article key={level} className={index < currentLevelIndex ? "is-complete" : index === currentLevelIndex ? "is-current" : ""}><b>{level}</b><small>{index < currentLevelIndex ? "Completed path" : index === currentLevelIndex ? "Current focus" : "Study ahead"}</small></article>)}</div></section>
      <section className="ledger-legend"><span><i className="legend-complete" /> সম্পন্ন</span><span><i className="legend-current" /> বর্তমান lesson</span><span><i className="legend-future" /> পরে</span><em>পরের লক্ষ্য: {nextLesson?.objectives[0] ?? "বর্তমান course সম্পন্ন"}</em></section>
      <section className="progress-badge-strip paper-card"><div><span className="card-kicker"><Award size={15} />Completion evidence</span><h2 className="section-title">Earned badges</h2><p>Fully-scored passed level/final assessment থাকলেই badge দেখা যায়; এটি official CEFR certification নয়।</p></div><div className="progress-badge-list">{badges.length ? badges.map((badge) => <span key={badge.id}><Award size={16} /><strong>{badge.level}</strong> Complete</span>) : <span className="progress-badge-empty">প্রথম level completion assessment-এর পর badge এখানে দেখা যাবে।</span>}<a href={`${import.meta.env.BASE_URL}certificates`}>Certificates →</a></div></section>
      <section className="progress-metrics"><article><BookOpenCheck size={20} /><strong>{completed}</strong><span>সম্পন্ন lesson</span></article><article><Clock3 size={20} /><strong>{studyMinutes}</strong><span>চর্চার মিনিট</span></article><article><Sprout size={20} /><strong>{summary?.practicedSkills.length ?? 0}</strong><span>চর্চার skill</span></article><article className="metric-stamp"><span>Assessment</span><strong>{summary?.completedAssessments ?? 0}/{summary?.totalAssessments ?? 0}</strong><small>{summary?.currentLevel?.code ?? "Pre-A1"} progress</small></article></section>
      <section className="skill-ledger-sheet paper-card"><header><div><p className="card-kicker">Six-skill evidence</p><h2 className="section-title">Language skills record</h2></div><Target size={22} /></header><div className="skill-ledger-table">{skillMastery.map((record) => <div className="skill-ledger-row" key={record.skill}><strong>{skillLabel[record.skill]}</strong><span className={`mastery-state state-${record.state}`}>{record.state.replace("-", " ")}</span><span>{record.attemptCount} attempt{record.attemptCount === 1 ? "" : "s"}</span><span>{record.accuracy === undefined ? "No scored evidence" : `${record.accuracy}% accuracy`}</span><small>{record.activitiesCompleted ? `${record.activitiesCompleted} activity completed` : "প্রথম activity শুরু করো"}</small></div>)}</div><aside className="skill-recommendations"><div><p className="card-kicker">Evidence-based next step</p><h3>{recommendations[0]?.banglaTitle ?? "কোনো recovery task নেই"}</h3><p>{recommendations[0]?.reason ?? "Scored attempt জমা হলে এই জায়গায় evidence-based recommendation দেখা যাবে।"}</p></div>{recommendations[0] && <a href={`${import.meta.env.BASE_URL}skills/${recommendations[0].skill}`}>Practice in lab →</a>}</aside></section>
      <section className="progress-journal paper-card"><header><div><p className="card-kicker">Learning record</p><h2 className="section-title">Lesson history</h2></div><ChartNoAxesCombined size={22} /></header>{items.map((item, index) => <div className="journal-row" key={item.lesson.id}><span className={item.completed ? "journal-check complete" : index === currentIndex ? "journal-check current" : "journal-check"}>{item.completed ? <CheckCircle2 size={16} /> : index === currentIndex ? "→" : item.lesson.order}</span><div><strong>{item.lesson.banglaTitle}</strong><small>{item.completed ? "সম্পন্ন ও local progress-এ সংরক্ষিত" : item.unlocked ? "বর্তমান lesson—এখান থেকে শুরু করা যায়" : "আগের lesson শেষ হলে খুলবে"}</small></div><span>{item.lesson.estimatedMinutes} মিনিট</span></div>)}</section>
      <div className="learning-ledger-note"><ChartNoAxesCombined size={16} /><span>এই record attempt ও lesson completion থেকে তৈরি—কোনো সংখ্যা UI-তে hard-code করা নয়।</span></div>
    </AppShell>
  );
}
