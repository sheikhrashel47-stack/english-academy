/**
 * Design reminder — “ভাষার মানচিত্র”: practice is a single focused checkpoint, never a noisy quiz machine;
 * feedback is saved locally and presented as constructive direction.
 */
import { BookMarked, RefreshCw, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { learningUseCases } from "@/application/usecases/LearningUseCases";
import { AppShell } from "@/components/app/AppShell";
import { QuestionCard } from "@/components/learning/QuestionCard";
import type { LessonBundle } from "@/data/repositories/LearningRepository";

export default function PracticePage() {
  const [bundle, setBundle] = useState<LessonBundle>();
  const [completed, setCompleted] = useState(false);
  useEffect(() => { void learningUseCases.getLesson("lesson-a1-greetings").then(setBundle); }, []);
  const question = bundle?.questions.find((item) => item.id === "question-greeting-2") ?? bundle?.questions[0];
  return (
    <AppShell eyebrow="পুনরাবৃত্তি" title="একটি ছোট check point">
      <div className="practice-layout">
        <section className="practice-intro"><div className="practice-stamp"><RefreshCw size={20} /></div><p className="card-kicker">Review session · 01</p><h2>পড়েছো, এবার মনে<br /><em>আছে কি না দেখি।</em></h2><p>প্রশ্নের উত্তর এই device-এ সংরক্ষিত হয়। ভুল হলে Mistake Bank-এর ভিত্তি তৈরি হয়, যাতে পরে আবার অনুশীলন করা যায়।</p><div className="practice-note"><ShieldCheck size={17} /><span>Offline-first · উত্তর network ছাড়া সংরক্ষিত</span></div></section>
        <div>{question ? <QuestionCard question={question} onAnswered={() => setCompleted(true)} /> : <div className="loading-sheet">প্রশ্ন প্রস্তুত করা হচ্ছে…</div>}{completed && <section className="practice-complete"><BookMarked size={18} /><span>এই review point সংরক্ষিত হয়েছে। এখন অন্য lesson-এ এগিয়ে যেতে পারো।</span></section>}</div>
      </div>
    </AppShell>
  );
}
