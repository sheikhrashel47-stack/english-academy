/**
 * Design reminder — “ভাষার মানচিত্র”: vocabulary appears as a calm field notebook—
 * language first, metadata second, with restrained terracotta for active intent.
 */
import { MapPin, Route, Search, Volume2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { learningUseCases } from "@/application/usecases/LearningUseCases";
import type { VocabularyItem } from "@/domain/learning/types";

export default function VocabularyPage() {
  const [items, setItems] = useState<VocabularyItem[]>([]);
  const [query, setQuery] = useState("");
  useEffect(() => { void learningUseCases.getVocabulary().then(setItems); }, []);
  const filtered = useMemo(() => items.filter((item) => `${item.word} ${item.meaning} ${item.topic}`.toLowerCase().includes(query.toLowerCase())), [items, query]);
  return (
    <AppShell eyebrow="শব্দভাণ্ডার" title="শব্দের ছোট মাঠ">
      <section className="vocabulary-intro paper-card"><div><p className="card-kicker">Phase 0 sample</p><h2>শব্দ দেখো, বলো,<br /><em>নিজের বাক্যে রাখো।</em></h2><p>এখানে global content রাখা হয়েছে। learner-specific mastery ও review state আলাদা repository-তে সংরক্ষণের জন্য প্রস্তুত।</p></div><div className="vocabulary-count"><strong>{items.length}</strong><span>টি sample word</span></div></section>
      <section className="atlas-route" aria-label="শব্দভাণ্ডারের শেখার route"><div className="atlas-stamp"><Route size={16} /><span>Word atlas · A1 → A2</span></div><div className="atlas-trail" aria-hidden="true"><i /><i className="atlas-current" /><i /><i /></div><div className="atlas-position"><MapPin size={16} /><span><strong>বর্তমান অবস্থান:</strong> greetings ও daily life শব্দ</span></div></section>
      <label className="vocab-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="শব্দ বা বাংলা অর্থ খুঁজো" /><span>{filtered.length} ফল</span></label>
      <section className="vocabulary-grid">
        {filtered.map((item) => <article className="vocab-card paper-card" key={item.id}><header><span>{item.partOfSpeech}</span><button type="button" aria-label={`${item.word} শুনুন`} onClick={() => window.alert("Phase 0 prototype: audio asset reference প্রস্তুত আছে, audio playback পরে যুক্ত হবে।")}><Volume2 size={16} /></button></header><h2>{item.word}</h2><p className="vocab-meaning">{item.meaning}</p><span className="pronunciation">{item.pronunciation}</span><p className="vocab-example">“{item.example}”</p><footer><span>{item.level} · {item.topic}</span><span>{item.collocations[0]}</span></footer></article>)}
      </section>
    </AppShell>
  );
}
