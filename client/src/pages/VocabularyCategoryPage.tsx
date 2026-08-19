import { ArrowRight, BookOpenCheck, Check, ChevronRight, CircleDashed, Compass, Filter, Layers3, Search, Sparkles, Target, Volume2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useRoute } from "wouter";
import { learningUseCases } from "@/application/usecases/LearningUseCases";
import { AppShell } from "@/components/app/AppShell";
import type { VocabularySearchResult } from "@/domain/learning/types";
import { phase9ActiveCategories, phase9Categories, phase9Families, type Phase9Category } from "@/data/content/phase9CategorySeed";
import { loadPhase9CategoryShard, type Phase9CorpusWord } from "@/data/content/phase9Corpus";

const formatCount = (value: number) => value.toLocaleString("en-US");

function CategoryCard({ category, active, onSelect }: { category: Phase9Category; active: boolean; onSelect: () => void }) {
  const ready = Boolean(category.existingTopic);
  return <button type="button" onClick={onSelect} className={`phase9-category-card ${active ? "phase9-category-card-active" : ""}`} aria-pressed={active}>
    <span className="phase9-category-number">{category.id.split("-").slice(-2).join("/")}</span>
    <span className="phase9-category-card-title">{category.title}</span>
    <span className="phase9-category-card-bangla">{category.banglaTitle}</span>
    <span className={`phase9-category-status ${ready ? "phase9-status-ready" : "phase9-status-planned"}`}>{ready ? "শব্দ আছে" : "পরের content pass"}</span>
  </button>;
}

function WordPreview({ result, onMark }: { result: VocabularySearchResult | null; onMark: (id: string) => void }) {
  const speak = (word: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(word));
  };
  if (!result) return <div className="phase9-word-empty"><CircleDashed size={18} /> Local vocabulary desk প্রস্তুত হচ্ছে…</div>;
  if (!result.entries.length) return <div className="phase9-word-empty"><Layers3 size={18} /> এই category-র curated word pack এখনো প্রকাশিত হয়নি।</div>;
  return <div className="phase9-word-grid">{result.entries.map(({ item, srsCard }) => <article className="phase9-word-card" key={item.id}>
    <header><span>{item.level} · {item.partOfSpeech}</span><button type="button" onClick={() => speak(item.word)} aria-label={`${item.word} শুনুন`}><Volume2 size={15} /></button></header>
    <Link href={`/vocabulary/${encodeURIComponent(item.word)}`}><h3>{item.word}</h3></Link>
    <p>{item.meaning}</p>
    <small>{item.example}</small>
    <footer><span className={`phase9-mastery phase9-mastery-${srsCard?.masteryState ?? "new"}`}>{srsCard?.masteryState ?? "new"}</span><button type="button" onClick={() => onMark(item.id)}><Check size={13} /> Familiar</button></footer>
  </article>)}</div>;
}

function PublishedPhase9WordPreview({ words, onMark }: { words: Phase9CorpusWord[]; onMark: (id: string) => void }) {
  const speak = (word: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(word));
  };
  return <div className="phase9-word-grid">{words.slice(0, 12).map((item) => <article className="phase9-word-card phase9-published-word-card" key={item.id}>
    <header><span>{item.level} · {item.partOfSpeech}</span><button type="button" onClick={() => speak(item.word)} aria-label={`${item.word} শুনুন`}><Volume2 size={15} /></button></header>
    <h3>{item.word}</h3>
    <p>{item.meaning || "বাংলা meaning enrichment এখনো প্রকাশিত হয়নি।"}</p>
    <div className="phase9-relation-row"><span><b>Syn:</b> {item.synonyms.slice(0, 3).join(", ") || "—"}</span><span><b>Ant:</b> {item.antonyms.slice(0, 3).join(", ") || "—"}</span></div>
    {item.sentences.length ? <div className="phase9-example-stack">{item.sentences.slice(0, 3).map((sentence) => <p key={sentence.id}><strong>{sentence.text}</strong><small>{sentence.banglaTranslation}</small></p>)}</div> : <p className="phase9-saved-note">English example ও বাংলা translation পরের enrichment pass-এ যোগ হবে।</p>}
    <footer><span className="phase9-mastery phase9-mastery-new">new</span><button type="button" onClick={() => onMark(item.id)}><Check size={13} /> Familiar</button></footer>
  </article>)}</div>;
}

export default function VocabularyCategoryPage() {
  const [, params] = useRoute("/vocabulary/categories/:slug");
  const routeCategory = params?.slug ? phase9Categories.find((category) => category.slug === params.slug) : undefined;
  const [selectedId, setSelectedId] = useState(routeCategory?.id ?? phase9ActiveCategories[0]?.id ?? phase9Categories[0].id);
  const [family, setFamily] = useState("সব domain");
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<VocabularySearchResult | null>(null);
  const [phase9Words, setPhase9Words] = useState<Phase9CorpusWord[]>([]);
  const [marked, setMarked] = useState<string[]>([]);
  const selected = phase9Categories.find((category) => category.id === selectedId) ?? phase9Categories[0];
  const filtered = useMemo(() => phase9Categories.filter((category) => (family === "সব domain" || category.family === family) && `${category.title} ${category.banglaTitle} ${category.family}`.toLocaleLowerCase().includes(query.toLocaleLowerCase())), [family, query]);

  useEffect(() => {
    if (routeCategory) setSelectedId(routeCategory.id);
  }, [routeCategory?.id]);

  useEffect(() => {
    let active = true;
    setResult(null);
    setPhase9Words([]);
    void loadPhase9CategoryShard(selected.slug).then((shard) => {
      if (active && shard?.vocabulary?.length) setPhase9Words(shard.vocabulary);
    });
    if (!selected.existingTopic) return () => { active = false; };
    void learningUseCases.searchVocabulary({ topic: selected.existingTopic, page: 0, pageSize: 8 }).then((next) => { if (active) setResult(next); });
    return () => { active = false; };
  }, [selected.id, selected.existingTopic, selected.slug]);

  const selectCategory = (category: Phase9Category) => {
    setSelectedId(category.id);
    window.history.replaceState(null, "", `${import.meta.env.BASE_URL}vocabulary/categories/${category.slug}`);
  };
  const markFamiliar = async (id: string) => {
    await learningUseCases.updateVocabularyMastery(id, "familiar");
    setMarked((current) => current.includes(id) ? current : [...current, id]);
  };

  return <AppShell eyebrow="Vocabulary · Phase 9" title="Category learning desk">
    <div className="phase9-page">
      <section className="phase9-hero paper-card">
        <div className="phase9-hero-copy"><p className="card-kicker"><Compass size={14} /> Category hub · 200 routes</p><h2>একটি topic বেছে নাও।<br /><em>শব্দকে ব্যবহারে নাও।</em></h2><p>২০০টি everyday ও academic category-কে ছোট, repeatable learning desk-এ ভাঙা হয়েছে। এখানে ৫০,০০০টি শব্দের library, ৩০,০০০টি bilingual sentence এবং local review path রয়েছে।</p><div className="phase9-ledger"><span><b>{formatCount(phase9Categories.length)}</b> category map</span><span><b>{formatCount(phase9ActiveCategories.length)}</b> active preview</span><span><b>offline</b> local mastery</span></div></div>
        <div className="phase9-hero-aside"><span className="phase9-ring"><strong>9</strong><small>PHASE</small></span><p><Target size={15} /> লক্ষ্য: শব্দ জানার পর বাক্যে ব্যবহার</p></div>
      </section>

      <section className="phase9-workspace">
        <aside className="phase9-hub paper-card"><div className="phase9-panel-heading"><div><p className="card-kicker"><Layers3 size={13} /> Category register</p><h2>Hub map</h2></div><span>{filtered.length}/{phase9Categories.length}</span></div><label className="phase9-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="category খুঁজুন" /></label><label className="phase9-filter"><Filter size={14} /><select value={family} onChange={(event) => setFamily(event.target.value)}><option>সব domain</option>{phase9Families.map((item) => <option key={item}>{item}</option>)}</select></label><div className="phase9-family-pills">{["সব domain", ...phase9Families.slice(0, 5)].map((item) => <button type="button" key={item} onClick={() => setFamily(item)} className={family === item ? "is-active" : ""}>{item}</button>)}</div><div className="phase9-category-list">{filtered.map((category) => <CategoryCard key={category.id} category={category} active={category.id === selected.id} onSelect={() => selectCategory(category)} />)}</div></aside>

        <main className="phase9-desk"><section className="phase9-desk-header paper-card"><div><Link href="/vocabulary/categories" className="phase9-back-link"><ChevronRight size={14} /> Category hub</Link><p className="card-kicker">{selected.family} · CEFR {selected.level}</p><h2>{selected.title}</h2><h3>{selected.banglaTitle}</h3><p>{selected.description}</p></div><div className="phase9-desk-stamp">{selected.existingTopic ? <><Sparkles size={18} /><strong>Preview ready</strong><span>curated topic pack</span></> : <><CircleDashed size={18} /><strong>Mapped</strong><span>content pass next</span></>}</div></section><section className="phase9-path paper-card"><div><p className="card-kicker"><BookOpenCheck size={13} /> Desk sequence</p><h3>এই category-তে কীভাবে পড়বে</h3></div><div className="phase9-path-steps"><span><b>01</b><strong>See</strong><small>শব্দের অর্থ ও level</small></span><ArrowRight size={15} /><span><b>02</b><strong>Use</strong><small>একটি ছোট বাক্য</small></span><ArrowRight size={15} /><span><b>03</b><strong>Recall</strong><small>local mastery mark</small></span></div></section><section className="phase9-words paper-card"><div className="phase9-section-heading"><div><p className="card-kicker">{phase9Words.length ? `Published Phase 9 pack · ${selected.title}` : selected.existingTopic ? `Existing topic · ${selected.existingTopic}` : "Curated word pack"}</p><h3>Word desk preview</h3></div><span>{phase9Words.length ? `${phase9Words.length.toLocaleString("en-US")} base words · ${phase9Words.reduce((total, word) => total + word.sentences.length, 0).toLocaleString("en-US")} bilingual examples` : result ? `${result.total.toLocaleString("en-US")} topic words` : "Loading pack…"}</span></div>{phase9Words.length ? <PublishedPhase9WordPreview words={phase9Words} onMark={(id) => void markFamiliar(id)} /> : <WordPreview result={result} onMark={(id) => void markFamiliar(id)} />}
{marked.length > 0 && <p className="phase9-saved-note"><Check size={14} /> {marked.length}টি word local mastery-তে রাখা হয়েছে।</p>}</section></main>
      </section>
    </div>
  </AppShell>;
}
