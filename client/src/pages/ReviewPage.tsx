/** Design reminder — Emerald Study House: queue categories make study urgency legible without anxiety. */
import { ArrowRight, Clock3, GraduationCap, Sprout } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { learningUseCases } from "@/application/usecases/LearningUseCases";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import type { VocabularyReviewQueue } from "@/data/repositories/LearningRepository";

const label = { overdue: "Overdue", dueToday: "Due today", newItems: "New", learning: "Learning", review: "Review", mastered: "Mastered" } as const;
const icon = { overdue: Clock3, dueToday: Clock3, newItems: Sprout, learning: Sprout, review: GraduationCap, mastered: GraduationCap } as const;

export default function ReviewPage() {
  const [queue, setQueue] = useState<VocabularyReviewQueue | null>(null); useEffect(() => { void learningUseCases.getVocabularyReviewQueue().then(setQueue); }, []);
  const sections = queue ? Object.entries(queue) as Array<[keyof VocabularyReviewQueue, VocabularyReviewQueue[keyof VocabularyReviewQueue]]> : [];
  return <AppShell eyebrow="Review queue" title="আজকের পুনরালোচনা"><section className="review-queue-heading paper-card"><div><p className="card-kicker"><Clock3 size={15} /> Offline SRS queue</p><h2>সময়মতো ছোট review,<br /><em>দীর্ঘদিনের মনে রাখা।</em></h2><span className="academy-focus-line">Study ledger: {queue ? `${queue.overdue.length + queue.dueToday.length}টি due · ${queue.newItems.length}টি new` : "local queue প্রস্তুত হচ্ছে"}</span></div><Link href="/flashcards"><Button>Start flashcards <ArrowRight size={16} /></Button></Link></section>{queue ? <section className="review-category-grid">{sections.map(([key, entries]) => { const Icon = icon[key]; return <article className="review-category paper-card" key={key}><header><span><Icon size={16} /> {label[key]}</span><strong>{entries.length}</strong></header>{entries.length ? <div>{entries.slice(0, 4).map(({ item, srsCard }) => <Link href={`/vocabulary/${encodeURIComponent(item.word)}`} key={item.id}><span>{item.word}</span><small>{item.meaning} · {srsCard?.intervalDays ?? 0}d</small></Link>)}</div> : <p>এখন কোনো item নেই। নতুন শব্দ শিখলে এখানে আসবে।</p>}</article>; })}</section> : <section className="review-preparing paper-card"><Clock3 size={20} /><div><strong>তোমার local review ledger তৈরি হচ্ছে</strong><p>Vocabulary library-তে গিয়ে একটি শব্দ খুললে review state প্রস্তুত হবে।</p></div><Link href="/vocabulary">Vocabulary library <ArrowRight size={15} /></Link></section>}</AppShell>;
}
