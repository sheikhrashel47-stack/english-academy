/**
 * Design reminder — “ভাষার মানচিত্র”: vocabulary appears as a calm field notebook—
 * language first, metadata second, with restrained terracotta for active intent.
 */
import { BookOpenCheck, MapPin, Route, Search, Volume2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { learningUseCases } from "@/application/usecases/LearningUseCases";
import type { VocabularyItem } from "@/domain/learning/types";

export default function VocabularyPage() {
  const [items, setItems] = useState<VocabularyItem[]>([]);
  const [query, setQuery] = useState("");
  useEffect(() => { void learningUseCases.getVocabulary().then(setItems); }, []);
  const filtered = useMemo(() => items.filter((item) => `${item.word} ${item.meaning} ${item.topic}`.toLowerCase().includes(query.toLowerCase())), [items, query]);
  const groups = useMemo(() => Object.entries(filtered.reduce<Record<string, VocabularyItem[]>>((all, item) => { (all[item.topic] ??= []).push(item); return all; }, {})), [filtered]);
  const speak = (word: string) => { if ("speechSynthesis" in window) { window.speechSynthesis.cancel(); window.speechSynthesis.speak(new SpeechSynthesisUtterance(word)); } };
  return (
    <AppShell eyebrow="শব্দভাণ্ডার" title="শব্দের ছোট মাঠ">
      <section className="vocabulary-intro paper-card"><div><p className="card-kicker"><BookOpenCheck size={14} /> Word atlas · A1 → A2</p><h2>শব্দ দেখো, বলো,<br /><em>নিজের বাক্যে রাখো।</em></h2><p>প্রতিটি শব্দ একটি pin। Topic ধরে এগোও, তারপর নিজের বাক্যে শব্দটিকে ব্যবহার করে দেখো।</p></div><div className="vocabulary-count"><strong>{items.length}</strong><span>টি word pin</span></div></section>
      <section className="atlas-route" aria-label="শব্দভাণ্ডারের শেখার route"><div className="atlas-stamp"><Route size={16} /><span>Word atlas · A1 → A2</span></div><div className="atlas-trail" aria-hidden="true"><i /><i className="atlas-current" /><i /><i /></div><div className="atlas-position"><MapPin size={16} /><span><strong>বর্তমান অবস্থান:</strong> greetings ও daily life শব্দ</span></div></section>
      <label className="vocab-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="শব্দ বা বাংলা অর্থ খুঁজো" /><span>{filtered.length} ফল</span></label>
      <section className="word-atlas" aria-label="Word Atlas index">{groups.length ? groups.map(([topic, group], groupIndex) => <section className="word-atlas-chapter" key={topic}><header className="word-atlas-heading"><span>{String(groupIndex + 1).padStart(2, "0")}</span><div><p>Atlas chapter</p><h2>{topic}</h2></div><small>{group.length} pin</small></header><div className="vocabulary-grid">{group.map((item, itemIndex) => <article className="vocab-card paper-card" key={item.id}><header><span>{String(itemIndex + 1).padStart(2, "0")} · {item.partOfSpeech}</span><button type="button" aria-label={`${item.word} শুনুন`} onClick={() => speak(item.word)}><Volume2 size={16} /></button></header><h2>{item.word}</h2><p className="vocab-meaning">{item.meaning}</p><span className="pronunciation">{item.pronunciation}</span><p className="vocab-example">“{item.example}”</p><footer><span>{item.level} route</span><span>{item.collocations[0]}</span></footer></article>)}</div></section>) : <div className="atlas-empty"><MapPin size={20} /><h2>এই নামে কোনো pin নেই</h2><p>অন্য শব্দ বা বাংলা অর্থ দিয়ে আবার খোঁজো।</p></div>}</section>
    </AppShell>
  );
}
