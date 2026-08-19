/** Design reminder — Emerald Study House: a word detail is a compact study note, grounded in existing data. */
import { ArrowLeft, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { learningUseCases } from "@/application/usecases/LearningUseCases";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import type { VocabularyItem } from "@/domain/learning/types";

export default function VocabularyDetailPage() {
  const { word } = useParams<{ word: string }>();
  const [item, setItem] = useState<VocabularyItem | null>(null);
  useEffect(() => { void learningUseCases.getVocabulary().then((items) => setItem(items.find((entry) => entry.word.toLowerCase() === decodeURIComponent(word ?? "").toLowerCase()) ?? null)); }, [word]);
  const say = () => { if (item && "speechSynthesis" in window) { window.speechSynthesis.cancel(); window.speechSynthesis.speak(new SpeechSynthesisUtterance(item.word)); } };
  if (!item) return <AppShell eyebrow="Vocabulary" title="Word note"><section className="skill-placeholder paper-card"><h2>Word পাওয়া যায়নি</h2><p>Sample vocabulary library-তে এই wordটি নেই।</p><Link href="/vocabulary"><Button variant="outline"><ArrowLeft size={16} /> Vocabulary library</Button></Link></section></AppShell>;
  return <AppShell eyebrow={`${item.level} · ${item.partOfSpeech}`} title={item.word}><article className="word-detail paper-card"><div className="word-detail-heading"><div><span>{item.pronunciation}</span><h2>{item.meaning}</h2></div><Button type="button" variant="outline" onClick={say}><Volume2 size={16} /> Listen</Button></div><p className="word-definition">{item.definition}</p><blockquote>“{item.example}”</blockquote><div className="word-detail-grid"><div><small>Synonyms</small><p>{item.synonyms.join(", ") || "—"}</p></div><div><small>Antonyms</small><p>{item.antonyms.join(", ") || "—"}</p></div><div><small>Collocations</small><p>{item.collocations.join(", ") || "—"}</p></div></div><Link href="/vocabulary"><Button variant="outline"><ArrowLeft size={16} /> Back to library</Button></Link></article></AppShell>;
}
