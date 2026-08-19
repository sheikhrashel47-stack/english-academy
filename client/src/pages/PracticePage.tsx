/**
 * Design reminder — “ভাষার মানচিত্র”: practice is a focused checkpoint on the route,
 * with feedback that becomes a revisit pin rather than a generic quiz score.
 */
import { BookMarked, ChevronRight, RefreshCw, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { learningUseCases } from "@/application/usecases/LearningUseCases";
import { AppShell } from "@/components/app/AppShell";
import { QuestionCard } from "@/components/learning/QuestionCard";
import { Button } from "@/components/ui/button";
import type { Question } from "@/domain/learning/types";
import { cn } from "@/lib/utils";

const difficultyOptions = [{ id: 1, label: "Easy", note: "প্রথম পদক্ষেপ" }, { id: 2, label: "Medium", note: "পথ যাচাই" }, { id: 3, label: "Hard", note: "আরও মনোযোগ" }];
const skillOptions = [{ id: "grammar", label: "Grammar" }, { id: "vocabulary", label: "Vocabulary" }] as const;

export default function PracticePage() {
  const [difficulty, setDifficulty] = useState(1);
  const [skill, setSkill] = useState<"grammar" | "vocabulary">("grammar");
  const [count, setCount] = useState(5);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  useEffect(() => { setCompleted(false); setIndex(0); void learningUseCases.getPracticeQuestions({ skill, difficulty, count }).then(setQuestions); }, [count, difficulty, skill]);
  const question = questions[index];
  const nextQuestion = () => { setCompleted(false); setIndex((current) => (current + 1) % Math.max(1, questions.length)); };
  return <AppShell eyebrow="পুনরাবৃত্তি" title="একটি ছোট check point">
    <div className="practice-layout">
      <section className="practice-intro"><div className="practice-stamp"><RefreshCw size={20} /></div><p className="card-kicker">Review session · {String(index + 1).padStart(2, "0")}</p><h2>পড়েছো, এবার মনে<br /><em>আছে কি না দেখি।</em></h2><p>প্রশ্নের উত্তর এই device-এ সংরক্ষিত হয়। ভুল হলে সেটি Mistake Bank-এ একটি revisit pin হয়ে যাবে।</p><div className="practice-note"><ShieldCheck size={17} /><span>Offline-first · উত্তর network ছাড়া সংরক্ষিত</span></div><div className="practice-filter-label"><span>Skill</span><div className="difficulty-strip" aria-label="practice skill">{skillOptions.map((item) => <button type="button" key={item.id} className={cn(skill === item.id && "difficulty-active")} onClick={() => setSkill(item.id)}><strong>{item.label}</strong></button>)}</div></div><div className="practice-filter-label"><span>Difficulty</span><div className="difficulty-strip" aria-label="practice difficulty">{difficultyOptions.map((item) => <button type="button" key={item.id} className={cn(difficulty === item.id && "difficulty-active")} onClick={() => setDifficulty(item.id)}><strong>{item.label}</strong><small>{item.note}</small></button>)}</div></div><label className="practice-count"><span>Question count</span><select value={count} onChange={(event) => setCount(Number(event.target.value))}><option value={3}>3টি প্রশ্ন</option><option value={5}>5টি প্রশ্ন</option><option value={8}>8টি প্রশ্ন</option></select></label></section>
      <div>{question ? <QuestionCard key={question.id} question={question} onAnswered={() => setCompleted(true)} /> : <div className="loading-sheet">প্রশ্ন প্রস্তুত করা হচ্ছে…</div>}{completed && <section className="practice-complete"><BookMarked size={18} /><span>এই checkpoint সংরক্ষিত হয়েছে।</span><Button variant="ghost" size="sm" onClick={nextQuestion}>পরেরটি <ChevronRight size={16} /></Button></section>}</div>
    </div>
  </AppShell>;
}
