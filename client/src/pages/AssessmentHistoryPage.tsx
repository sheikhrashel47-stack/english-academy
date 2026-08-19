/** Design reminder — Emerald Study House: a calm ledger of real evidence, with comparison only where records genuinely exist. */
import { useEffect, useMemo, useState } from "react";
import { BarChart3, CalendarDays, ClipboardList, History, Loader2, TrendingDown, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { learningUseCases } from "@/application/usecases/LearningUseCases";
import type { AssessmentBlueprint, AssessmentResult } from "@/domain/learning/types";

export default function AssessmentHistoryPage() {
  const [, navigate] = useLocation();
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [blueprints, setBlueprints] = useState<AssessmentBlueprint[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { let live = true; void Promise.all([learningUseCases.getAssessmentResults(), learningUseCases.getAssessmentBlueprints()]).then(([items, catalogue]) => { if (live) { setResults(items); setBlueprints(catalogue); } }).finally(() => { if (live) setLoading(false); }); return () => { live = false; }; }, []);
  const blueprintById = useMemo(() => new Map(blueprints.map((item) => [item.id, item])), [blueprints]);
  const best = useMemo(() => results.reduce<AssessmentResult | undefined>((current, item) => !current || item.score > current.score ? item : current, undefined), [results]);
  const comparable = useMemo(() => results.find((item, index) => results.slice(index + 1).some((older) => older.blueprintId === item.blueprintId)), [results]);
  if (loading) return <AppShell eyebrow="Assessment history" title="চেষ্টা ও ফলাফল"><div className="assessment-state"><Loader2 className="animate-spin" />Local history পড়া হচ্ছে…</div></AppShell>;
  return <AppShell eyebrow="Assessment history" title="চেষ্টা ও ফলাফল">
    <section className="assessment-history-hero"><div><span className="eyebrow">Evidence, not estimates</span><h2>তোমার assessment ledger</h2><p>এখানে শুধু এই browser-এ সম্পন্ন হওয়া assessment দেখা যায়। একই assessment দ্বিতীয়বার দিলে তখনই score comparison দেখানো হবে।</p><Button onClick={() => navigate("/exams")}><ClipboardList size={16} />Assessment Hub খোলো</Button></div><div className="history-metric-strip"><span><strong>{results.length}</strong>completed</span><span><strong>{best ? `${best.score}%` : "—"}</strong>best score</span><span><strong>{results.filter((item) => item.passed).length}</strong>passed</span></div></section>
    {!results.length ? <section className="assessment-empty paper-card"><History size={30} /><h2>এখনও কোনো completed assessment নেই</h2><p>Diagnostic, placement বা একটি short assessment শুরু করলে তার সত্যিকারের record এখানে জমা হবে।</p><Button onClick={() => navigate("/exams")}>প্রথম assessment শুরু</Button></section> : <section className="history-layout"><div className="paper-card history-table"><header><div><span className="card-kicker"><CalendarDays size={15} />Attempt ledger</span><h2>সম্পন্ন assessment</h2></div><BarChart3 size={21} /></header>{results.map((result) => { const blueprint = blueprintById.get(result.blueprintId); const prior = results.find((item) => item.blueprintId === result.blueprintId && item.completedAt < result.completedAt); const delta = prior ? result.score - prior.score : undefined; return <button type="button" key={result.id} onClick={() => navigate(`/exams/result/${result.id}`)}><div><strong>{blueprint?.banglaTitle ?? result.assessmentType}</strong><small>{new Date(result.completedAt).toLocaleDateString("en-GB")} · {result.assessmentType}</small></div><span className={result.passed ? "history-status-pass" : "history-status-review"}>{result.score}%</span><i>{delta === undefined ? "first record" : <>{delta >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}{delta > 0 ? "+" : ""}{delta} pts</>}</i></button>; })}</div><aside className="paper-card history-insight"><span className="card-kicker">Comparison note</span><h2>{comparable ? "তুলনা দেখা যাচ্ছে" : "তুলনার জন্য আরেকটি চেষ্টা দরকার"}</h2><p>{comparable ? "একই assessment-এর একাধিক local attempt আছে। Ledger-এর score delta একই blueprint-এর আগের completed result-এর সঙ্গে তুলনা করে।" : "একই blueprint আবার সম্পন্ন করলে এখানে score change দেখা যাবে। ভিন্ন assessment-এর score সরাসরি তুলনা করা হয় না।"}</p></aside></section>}
  </AppShell>;
}
