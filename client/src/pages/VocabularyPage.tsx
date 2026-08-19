/**
 * Design reminder — “Emerald Study House”: vocabulary is a searchable study
 * library where language content leads and progress metadata stays secondary.
 */
import { BookOpenCheck, BookText, Search, Volume2 } from "lucide-react";
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
    <AppShell eyebrow="Vocabulary" title="শব্দের study desk">
      <section className="vocabulary-intro paper-card"><div><p className="card-kicker"><BookOpenCheck size={14} /> Vocabulary library · A1 → A2</p><h2>শব্দ দেখো, বলো,<br /><em>নিজের বাক্যে রাখো।</em></h2><p>Topic ধরে শব্দগুলো দেখো, উচ্চারণ শোনো, তারপর নিজের বাক্যে ব্যবহার করে দেখো।</p></div><div className="vocabulary-count"><strong>{items.length}</strong><span>টি শেখার শব্দ</span></div></section>
      <section className="vocabulary-level-band" aria-label="বর্তমান vocabulary focus"><div><BookText size={18} /><span><strong>Current focus</strong> greetings ও daily life</span></div><div className="vocabulary-cefr-mini"><span className="vocabulary-cefr-current">A1</span><span>A2</span><span>B1</span><span>B2</span><span>C1</span><span>C2</span></div></section>
      <label className="vocab-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="শব্দ বা বাংলা অর্থ খুঁজো" /><span>{filtered.length} ফল</span></label>
      <section className="vocabulary-library" aria-label="Vocabulary study library">{groups.length ? groups.map(([topic, group], groupIndex) => <section className="vocabulary-topic" key={topic}><header className="vocabulary-topic-heading"><span>{String(groupIndex + 1).padStart(2, "0")}</span><div><p>Study set</p><h2>{topic}</h2></div><small>{group.length}টি শব্দ</small></header><div className="vocabulary-grid">{group.map((item, itemIndex) => <article className="vocab-card paper-card" key={item.id}><header><span>{String(itemIndex + 1).padStart(2, "0")} · {item.partOfSpeech}</span><button type="button" aria-label={`${item.word} শুনুন`} onClick={() => speak(item.word)}><Volume2 size={16} /></button></header><h2>{item.word}</h2><p className="vocab-meaning">{item.meaning}</p><span className="pronunciation">{item.pronunciation}</span><p className="vocab-example">“{item.example}”</p><footer><span>{item.level} level</span><span>{item.collocations[0]}</span></footer></article>)}</div></section>) : <div className="vocabulary-empty"><BookText size={20} /><h2>এই নামে কোনো শব্দ নেই</h2><p>অন্য শব্দ বা বাংলা অর্থ দিয়ে আবার খোঁজো।</p></div>}</section>
    </AppShell>
  );
}
