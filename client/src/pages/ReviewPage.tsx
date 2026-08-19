/** Design reminder — Emerald Study House: a review queue reports real local due items, not invented urgency. */
import { CheckCircle2, Clock3, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { learningUseCases } from "@/application/usecases/LearningUseCases";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import type { ReviewItem } from "@/domain/learning/types";

export default function ReviewPage() {
  const [items, setItems] = useState<ReviewItem[] | null>(null);
  useEffect(() => { void learningUseCases.getDueReviews().then(setItems); }, []);
  return <AppShell eyebrow="Smart review" title="Review queue"><section className="review-queue paper-card">{items === null ? <p>Review queue তৈরি হচ্ছে…</p> : items.length === 0 ? <div className="empty-study-state"><CheckCircle2 size={28} /><h2>এখন কোনো due item নেই</h2><p>নতুন practice বা flashcard review করলে প্রয়োজনীয় item এখানে আসবে।</p><Link href="/practice"><Button>Quick practice</Button></Link></div> : <><header><Clock3 size={20} /><div><p className="card-kicker">Due now</p><h2>{items.length}টি local review item</h2></div></header><p>Review scheduler তোমার ভুল উত্তর ও vocabulary recall থেকে তৈরি হয়।</p><Link href="/mistakes"><Button><RotateCcw size={16} /> Mistake Bank থেকে শুরু করো</Button></Link></>}</section></AppShell>;
}
