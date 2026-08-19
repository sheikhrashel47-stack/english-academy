/** Emerald Study House — a concise, low-pressure level signal with bilingual study guidance. */
import { ArrowRight, CheckCircle2, ClipboardCheck } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { learningUseCases } from "@/application/usecases/LearningUseCases";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { diagnosticQuestions, scoreDiagnostic } from "@/domain/learning/diagnosticEngine";
import type { PersonalStudyPath } from "@/domain/learning/types";

export default function DiagnosticPage() {
  const [, setLocation] = useLocation(); const [answers, setAnswers] = useState<Record<string, string>>({}); const [result, setResult] = useState<PersonalStudyPath>(); const [submitting, setSubmitting] = useState(false);
  const unanswered = diagnosticQuestions.length - Object.keys(answers).length;
  const submit = async () => { if (unanswered) return; setSubmitting(true); setResult(await learningUseCases.saveDiagnosticResult(scoreDiagnostic(answers))); setSubmitting(false); };
  if (result) return <AppShell eyebrow="Placement complete" title="তোমার study path"><section className="diagnostic-result paper-card"><CheckCircle2 size={34} /><p className="card-kicker">{result.targetLevel} placement · {result.diagnostic?.score}%</p><h2>{result.message}</h2><p>প্রতিদিন {result.dailyGoalMinutes} মিনিট দিয়ে শুরু করো। আজ প্রথমে <strong>{result.focusSkill}</strong> skill-এ কাজ করবে।</p><div className="diagnostic-result-grid">{Object.entries(result.diagnostic?.skillScores ?? {}).map(([skill, value]) => <span key={skill}><b>{skill}</b>{value.correct}/{value.total} correct</span>)}</div><Button onClick={() => setLocation(result.nextLessonId ? `/lesson/${result.nextLessonId}` : "/learn")}>Personal plan শুরু করো <ArrowRight size={16} /></Button></section></AppShell>;
  return <AppShell eyebrow="Personal study path" title="Start with a calm diagnostic"><section className="diagnostic-intro paper-card"><ClipboardCheck size={31} /><div><p className="card-kicker">12 questions · about 5 minutes</p><h2>তোমার জন্য কোথা থেকে শুরু করা ভালো?</h2><p>এটি কোনো পরীক্ষা নয়। Vocabulary, grammar, reading এবং listening-এর ছোট signal দিয়ে আজকের learning focus তৈরি হবে।</p></div></section><section className="diagnostic-list">{diagnosticQuestions.map((question, index) => <article className="diagnostic-question paper-card" key={question.id}><span>{String(index + 1).padStart(2, "0")}</span><div><small>{question.skill} · {question.level}</small><h2>{question.prompt}</h2><p>{question.banglaPrompt}</p><div className="diagnostic-options">{question.options.map((option) => <button className={answers[question.id] === option.id ? "selected" : ""} type="button" key={option.id} onClick={() => setAnswers((value) => ({ ...value, [question.id]: option.id }))}>{option.text}</button>)}</div></div></article>)}</section><div className="diagnostic-submit paper-card"><span>{unanswered ? `${unanswered} question বাকি` : "সব উত্তর দেওয়া হয়েছে"}</span><Button disabled={Boolean(unanswered) || submitting} onClick={() => void submit()}>{submitting ? "Path তৈরি হচ্ছে…" : "আমার study path দেখাও"}<ArrowRight size={16} /></Button></div></AppShell>;
}
