/** Design reminder — Emerald Study House: flashcards use genuine local review actions rather than cosmetic mastery. */
import { ArrowRight, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { learningUseCases } from "@/application/usecases/LearningUseCases";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import type { VocabularyEntry } from "@/data/repositories/LearningRepository";

const ratings = ["again", "hard", "good", "easy"] as const;
export default function FlashcardsPage() {
  const [entries, setEntries] = useState<VocabularyEntry[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  useEffect(() => { void learningUseCases.getVocabularyEntries().then(setEntries); }, []);
  const entry = entries[index];
  const rate = async (rating: typeof ratings[number]) => { if (!entry) return; await learningUseCases.recordFlashcardReview(entry.item.id, rating); toast.success("Review locally saved হয়েছে।"); setFlipped(false); setIndex((current) => (current + 1) % entries.length); };
  return <AppShell eyebrow="Vocabulary review" title="Flashcards">{entry ? <section className="flashcard-shell"><p className="flashcard-count">{index + 1} / {entries.length} sample words</p><button type="button" className={flipped ? "flashcard flashcard-flipped" : "flashcard"} onClick={() => setFlipped((value) => !value)} aria-label="Flip flashcard"><span className="flashcard-label">{flipped ? "Meaning" : entry.item.partOfSpeech}</span><strong>{flipped ? entry.item.meaning : entry.item.word}</strong><small>{flipped ? entry.item.example : "Tap to reveal meaning"}</small></button><div className="flashcard-actions">{ratings.map((rating) => <Button type="button" key={rating} variant={rating === "good" ? "default" : "outline"} onClick={() => void rate(rating)}>{rating}</Button>)}</div><Button type="button" variant="ghost" onClick={() => { setFlipped(false); setIndex(0); }}><RotateCcw size={15} /> Restart sample deck</Button></section> : <section className="skill-placeholder paper-card"><p>Loading sample vocabulary…</p></section>}</AppShell>;
}
