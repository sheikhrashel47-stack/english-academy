/** Design reminder — “ভাষার মানচিত্র”: mistakes are revisit pins, never failure cards. */
import { Compass, RotateCcw, TriangleAlert } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { learningUseCases } from "@/application/usecases/LearningUseCases";
import { AppShell } from "@/components/app/AppShell";
import { QuestionCard } from "@/components/learning/QuestionCard";
import type { MistakeRecord, Question } from "@/domain/learning/types";

type MistakeBundle = { record: MistakeRecord; question?: Question };
export default function MistakeBankPage() {
  const [mistakes, setMistakes] = useState<MistakeBundle[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const reload = useCallback(async () => { const next = await learningUseCases.getMistakes(); setMistakes(next); setSelectedId((current) => next.some(({ record }) => record.id === current) ? current : next[0]?.record.id ?? ""); }, []);
  useEffect(() => { void reload(); }, [reload]);
  const active = mistakes.find(({ record }) => record.id === selectedId) ?? mistakes[0];
  return <AppShell eyebrow="Revisit pins" title="Mistake Bank">
    <section className="mistake-intro paper-card map-contour"><div><p className="card-kicker"><TriangleAlert size={15} /> ভুল মানেই ফেরার পথ</p><h2>যে জায়গায় থেমেছিলে,<br /><em>সেখান থেকেই আবার শুরু।</em></h2><p>ভুল উত্তরগুলো এখানে আলাদা pin হিসেবে থাকে। সঠিক হলে pin-টি map থেকে সরে যাবে।</p></div><strong>{mistakes.length}<small>টি active pin</small></strong></section>
    {!mistakes.length ? <section className="mistake-empty paper-card"><Compass size={28} /><h2>এখন কোনো revisit pin নেই</h2><p>Practice বা lesson-এ ভুল হলে সেটি এখানে ফিরে আসবে।</p></section> : <section className="mistake-layout"><aside className="mistake-list" aria-label="mistakes list">{mistakes.map(({ record, question }, index) => <button type="button" className={record.id === active?.record.id ? "mistake-list-active" : ""} key={record.id} onClick={() => setSelectedId(record.id)}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{question?.prompt ?? "Question unavailable"}</strong><small>{record.reason} · আবার চেষ্টা করো</small></div><RotateCcw size={16} /></button>)}</aside><div className="mistake-retry">{active.question ? <QuestionCard question={active.question} onAnswered={() => void reload()} /> : <p>এই প্রশ্নটি আর পাওয়া যাচ্ছে না।</p>}</div></section>}
  </AppShell>;
}
