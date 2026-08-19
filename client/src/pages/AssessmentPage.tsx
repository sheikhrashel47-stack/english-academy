/** Emerald Study House assessment hub: choose one calm evidence-based task, then work offline. */
/** Design reminder — Emerald Study House: assessment choices are factual, local-first study decisions with a visible next action. */
import { useEffect, useMemo, useState } from "react";
import { Award, ClipboardCheck, Clock3, FileQuestion, Loader2, MapPinned, Play, ShieldCheck } from "lucide-react";
import { useLocation } from "wouter";
import { AppShell } from "@/components/app/AppShell";
import { AssessmentRunner } from "@/components/learning/AssessmentRunner";
import { Button } from "@/components/ui/button";
import { learningUseCases } from "@/application/usecases/LearningUseCases";
import type { AssessmentBlueprint } from "@/domain/learning/types";

const labels: Record<AssessmentBlueprint["assessmentType"], { title: string; bangla: string; icon: typeof ClipboardCheck }> = {
  diagnostic: { title: "Diagnostic", bangla: "শুরুর অবস্থান", icon: MapPinned }, placement: { title: "Placement", bangla: "সঠিক starting point", icon: MapPinned }, lesson: { title: "Lesson check", bangla: "পাঠ যাচাই", icon: FileQuestion }, unit: { title: "Unit assessment", bangla: "ইউনিট মূল্যায়ন", icon: ClipboardCheck }, skill: { title: "Skill check", bangla: "skill যাচাই", icon: ClipboardCheck }, level: { title: "Level check", bangla: "level যাচাই", icon: Award }, mock: { title: "Mock test", bangla: "পরীক্ষার rehearsal", icon: Clock3 }, final: { title: "Completion assessment", bangla: "completion assessment", icon: ShieldCheck },
};

export default function AssessmentPage() {
  const [location, navigate] = useLocation();
  const [blueprints, setBlueprints] = useState<AssessmentBlueprint[]>([]);
  const [loading, setLoading] = useState(true);
  const blueprintId = location === "/diagnostic" ? "assessment-diagnostic" : location.startsWith("/exams/") ? decodeURIComponent(location.replace("/exams/", "").split("/")[0]) : undefined;
  const active = useMemo(() => blueprints.find((item) => item.id === blueprintId), [blueprintId, blueprints]);
  useEffect(() => { let alive = true; void learningUseCases.getAssessmentBlueprints().then((items) => { if (alive) setBlueprints(items); }).finally(() => { if (alive) setLoading(false); }); return () => { alive = false; }; }, []);

  if (active) return <AppShell eyebrow="Assessment desk" title={active.title}><div className="assessment-page-top"><Button variant="outline" onClick={() => navigate("/exams")}>Assessment hub-এ ফিরে যাও</Button><span><ShieldCheck size={15} />Local-first · {active.feedbackPolicy === "after-submit" ? "feedback after submission" : "guided feedback"}</span></div><AssessmentRunner blueprint={active} onFinished={(result) => navigate(`/exams/result/${result.id}`)} /></AppShell>;

  return <AppShell eyebrow="Assessment hub" title="তোমার শেখার প্রমাণ"><section className="assessment-hub-hero"><div><span className="eyebrow">Choose the next useful check</span><h2>পরীক্ষা নয় শুধু—পরের শেখার সিদ্ধান্ত</h2><p>প্রতিটি assessment এই ডিভাইসে সংরক্ষিত থাকে। ফলাফল official certificate বা official CEFR determination নয়; এটি তোমার পরের অধ্যয়নের জন্য evidence।</p></div><div className="assessment-hub-ledger"><strong>{blueprints.length}</strong><span>approved starter blueprints</span><small>Original · source-tagged · offline-first</small></div></section>
    {loading ? <div className="assessment-state"><Loader2 className="animate-spin" />Assessment catalogue প্রস্তুত হচ্ছে…</div> : <section className="assessment-hub-grid">{blueprints.map((blueprint) => { const meta = labels[blueprint.assessmentType]; const Icon = meta.icon; const total = blueprint.sections.reduce((sum, section) => sum + section.questionCount, 0); return <article className="assessment-launch-card" key={blueprint.id}><div className="assessment-card-icon"><Icon size={20} /></div><div><span className="card-kicker">{meta.title} {blueprint.level ? `· ${blueprint.level}` : ""}</span><h3>{blueprint.banglaTitle}</h3><p>{meta.bangla} · {blueprint.description}</p></div><div className="assessment-card-facts"><span><FileQuestion size={14} />up to {total} items</span><span><Clock3 size={14} />{blueprint.durationMinutes ? `${blueprint.durationMinutes} min` : "self-paced"}</span></div><Button onClick={() => navigate(`/exams/${blueprint.id}`)}><Play size={16} />{blueprint.assessmentType === "diagnostic" ? "Diagnostic শুরু" : "Assessment শুরু"}</Button></article>; })}</section>}
  </AppShell>;
}
