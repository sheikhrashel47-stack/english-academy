/** Design reminder — Emerald Study House: flashcards feel like a calm desk ritual, with transparent local SRS feedback. */
import { ArrowRight, RotateCcw, Sprout } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { learningUseCases } from "@/application/usecases/LearningUseCases";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import type { VocabularyReviewQueue } from "@/data/repositories/LearningRepository";

const ratings = ["again", "hard", "good", "easy"] as const;
const ratingCopy = { again: "আবার", hard: "কঠিন", good: "ভালো", easy: "সহজ" };

export default function FlashcardsPage() {
  const [queue, setQueue] = useState<VocabularyReviewQueue | null>(null); const [index, setIndex] = useState(0); const [flipped, setFlipped] = useState(false);
  const load = () => void learningUseCases.getVocabularyReviewQueue().then(setQueue);
  useEffect(load, []);
  const entries = queue ? [...queue.overdue, ...queue.dueToday, ...queue.newItems] : []; const entry = entries[index];
  const rate = async (rating: typeof ratings[number]) => {
    if (!entry) return;
    await learningUseCases.recordFlashcardReview(entry.item.id, rating);
    const occurredAt = new Date().toISOString(); const studyDate = occurredAt.slice(0, 10);
    await learningUseCases.applyPersonalLearningEvent({ eventKey: `vocabulary-reviewed:${entry.item.id}:${studyDate}`, type: "vocabulary-reviewed", occurredAt, relatedContentId: entry.item.id, skill: "vocabulary", minutes: 1, metadata: { rating } }).catch(() => undefined);
    toast.success("Review locally saved হয়েছে।"); setFlipped(false); setIndex((current) => current + 1 >= entries.length ? 0 : current + 1); load();
  };
  return <AppShell eyebrow="Vocabulary review" title="Flashcards">{entry ? <section className="flashcard-shell"><div className="flashcard-queue-strip"><span>Overdue <strong>{queue?.overdue.length ?? 0}</strong></span><span>Due today <strong>{queue?.dueToday.length ?? 0}</strong></span><span>New <strong>{queue?.newItems.length ?? 0}</strong></span></div><p className="flashcard-count">{index + 1} / {entries.length} review cards · {entry.srsCard?.masteryState ?? "new"}</p><button type="button" className={flipped ? "flashcard flashcard-flipped" : "flashcard"} onClick={() => setFlipped((value) => !value)} aria-label="Flip flashcard"><span className="flashcard-label">{flipped ? "Meaning" : entry.item.partOfSpeech}</span><strong>{flipped ? entry.item.meaning : entry.item.word}</strong><small>{flipped ? entry.item.example : "Tap to reveal meaning"}</small></button><div className="srs-state-line"><span>Interval {entry.srsCard?.intervalDays ?? 0} day</span><span>Streak {entry.srsCard?.streak ?? 0}</span><span>Lapses {entry.srsCard?.lapses ?? 0}</span></div><div className="flashcard-actions">{ratings.map((rating) => <Button type="button" key={rating} variant={rating === "good" ? "default" : "outline"} onClick={() => void rate(rating)}>{ratingCopy[rating]}</Button>)}</div><div className="flashcard-secondary-actions"><Button type="button" variant="ghost" onClick={() => { setFlipped(false); setIndex(0); }}><RotateCcw size={15} /> Restart deck</Button><Link href="/review"><Button variant="outline">Review queue <ArrowRight size={15} /></Button></Link></div></section> : <section className="flashcard-empty paper-card"><Sprout /><div><p className="card-kicker">Study ledger</p><h2>{queue ? "এখন কোনো due flashcard নেই" : "Review cards প্রস্তুত হচ্ছে"}</h2><p>{queue ? "আজকের due queue শূন্য। নতুন একটি শব্দ খুলে তার অর্থ ও example দেখলে পরের study set তৈরি হবে।" : "Offline SRS queue তৈরি হচ্ছে।"}</p><span>Next action: একটি vocabulary note পড়ো, তারপর flashcard review দাও।</span></div><Link href="/vocabulary"><Button variant="outline">Vocabulary library <ArrowRight size={15} /></Button></Link></section>}</AppShell>;
}
