/** Design reminder — Emerald Study House / Phase 5: a quiet English-first Bangla-supported catalogue where a tactile paper A–Z rail exposes the entire locally stored word library. */
import { BookOpenCheck, ChevronLeft, ChevronRight, ListFilter, Search, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { learningUseCases } from "@/application/usecases/LearningUseCases";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import type { LevelCode, VocabularyMasteryState, VocabularySearchResult } from "@/domain/learning/types";

const levels: Array<LevelCode | "all"> = ["all", "Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"];
const mastery: Array<VocabularyMasteryState | "all"> = ["all", "new", "learning", "familiar", "strong", "mastered"];
const masteryLabel: Record<VocabularyMasteryState | "all", string> = { all: "সব mastery", new: "নতুন", learning: "শেখা চলছে", familiar: "পরিচিত", strong: "ভালো", mastered: "আয়ত্ত" };
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const pageSize = 18;
const formatCount = (count?: number | null) => typeof count === "number" ? count.toLocaleString("en-US") : "…";

export default function VocabularyPage() {
  const [result, setResult] = useState<VocabularySearchResult | null>(null);
  const [letterIndex, setLetterIndex] = useState<Record<string, number> | null>(null);
  const [catalogueTotal, setCatalogueTotal] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [letter, setLetter] = useState<string | undefined>();
  const [level, setLevel] = useState<LevelCode | "all">("all");
  const [topic, setTopic] = useState("all");
  const [state, setState] = useState<VocabularyMasteryState | "all">("all");
  const [page, setPage] = useState(0);

  useEffect(() => {
    let active = true;
    void Promise.all([learningUseCases.getVocabularyLetterIndex(), learningUseCases.getCorpusSnapshot()]).then(([index, snapshot]) => {
      if (!active) return;
      setLetterIndex(index);
      setCatalogueTotal(snapshot.vocabulary);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    const load = () => void learningUseCases.searchVocabulary({
      query,
      letter,
      level: level === "all" ? undefined : level,
      topic: topic === "all" ? undefined : topic,
      masteryState: state === "all" ? undefined : state,
      page,
      pageSize,
    }).then((nextResult) => { if (active) setResult(nextResult); });
    if (!query) { load(); return () => { active = false; }; }
    const timer = window.setTimeout(load, 120);
    return () => { active = false; window.clearTimeout(timer); };
  }, [query, letter, level, topic, state, page]);

  const bootstrapPending = Boolean(result && !query && !letter && level === "all" && topic === "all" && state === "all" && page === 0 && result.total < 20_000);
  useEffect(() => {
    if (!bootstrapPending) return;
    const retry = window.setTimeout(() => {
      void learningUseCases.searchVocabulary({ page: 0, pageSize }).then(setResult);
      void Promise.all([learningUseCases.getVocabularyLetterIndex(), learningUseCases.getCorpusSnapshot()]).then(([index, snapshot]) => {
        setLetterIndex(index);
        setCatalogueTotal(snapshot.vocabulary);
      });
    }, 1500);
    return () => window.clearTimeout(retry);
  }, [bootstrapPending]);

  const resetPage = () => setPage(0);
  const speak = (word: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(word));
  };
  const topics = ["all", "Study", "Daily life", "Communication", "People", "Life skills", "Travel", "Health", "Environment", "Technology", "Description", "Time"];
  const activeCatalogueLabel = letter ? `${letter} দিয়ে শুরু হওয়া শব্দ` : "সব A–Z শব্দ";
  const activeLetterCount = letter ? letterIndex?.[letter] : catalogueTotal;
  const totalPages = result ? Math.max(1, Math.ceil(result.total / pageSize)) : 1;

  return <AppShell eyebrow="Vocabulary" title="Vocabulary study desk">
    <section className="vocabulary-intro paper-card">
      <div>
        <p className="card-kicker"><BookOpenCheck size={14} /> Vocabulary study library</p>
        <h2>Find a word.<br /><em>Use it with confidence.</em></h2>
        <p>বাংলা সহায়তায় শব্দের অর্থ, উচ্চারণ ও ব্যবহার দেখো। A–Z category থেকে সব শব্দ খুলে দেখো, অথবা পুরো library জুড়ে search করো।</p>
        <div className="vocabulary-ledger" aria-label="Vocabulary corpus study ledger">
          <span><b>CEFR</b> Pre-A1–C2</span>
          <span><b>Catalogue</b> {bootstrapPending ? "২০,০০০+ প্রস্তুত হচ্ছে" : `${formatCount(catalogueTotal)} verified words`}</span>
          <span><b>Mode</b> First load-এর পরে offline</span>
        </div>
      </div>
      <div className="vocabulary-count">
        <strong>{bootstrapPending ? "…" : formatCount(catalogueTotal)}</strong>
        <span>{bootstrapPending ? "offline library প্রস্তুত হচ্ছে" : "পূর্ণ শব্দভান্ডার"}</span>
      </div>
    </section>

    <section className="vocabulary-alphabet paper-card" aria-label="A থেকে Z vocabulary category">
      <div className="alphabet-heading">
        <div>
          <p><ListFilter size={13} /> A–Z vocabulary register</p>
          <h2>অক্ষর বেছে পুরো catalogue দেখো</h2>
        </div>
        <span>{letterIndex ? "২৬টি category" : "index তৈরি হচ্ছে"}</span>
      </div>
      <div className="alphabet-ledger" aria-label="CEFR vocabulary learning ledger"><span>CEFR context</span><b>Pre-A1 → C2</b><small>প্রতিটি entry-তে level, Bangla meaning এবং attributed usage sentence-এর study path আছে।</small></div>
      <div className="alphabet-nav" role="group" aria-label="Vocabulary alphabet categories">
        <button type="button" aria-pressed={!letter} className={`alphabet-chip alphabet-chip-all ${!letter ? "alphabet-chip-active" : ""}`} onClick={() => { setLetter(undefined); resetPage(); }}>
          <span>সব</span><small>{formatCount(catalogueTotal)}</small>
        </button>
        {alphabet.map((item) => <button type="button" key={item} aria-pressed={letter === item} className={`alphabet-chip ${letter === item ? "alphabet-chip-active" : ""}`} onClick={() => { setLetter(item); resetPage(); }}>
          <span>{item}</span><small>{formatCount(letterIndex?.[item])}</small>
        </button>)}
      </div>
      <p className="alphabet-context"><strong>{activeCatalogueLabel}</strong> {activeLetterCount === null || activeLetterCount === undefined ? "গণনা করা হচ্ছে…" : `— ${formatCount(activeLetterCount)}টি শব্দ।`} Search এবং নিচের filter একসঙ্গে কাজ করবে।</p>
    </section>

    <section className="vocabulary-controls paper-card" aria-label="Vocabulary filter">
      <label className="vocab-search">
        <Search size={18} />
        <input value={query} onChange={(event) => { setQuery(event.target.value); resetPage(); }} placeholder="শব্দ বা বাংলা অর্থ খুঁজো" />
        <span>{result ? `${formatCount(result.total)} ফল` : "খোঁজা হচ্ছে"}</span>
      </label>
      <div className="vocabulary-filter-row">
        <label>Level<select value={level} onChange={(event) => { setLevel(event.target.value as LevelCode | "all"); resetPage(); }}>{levels.map((item) => <option key={item} value={item}>{item === "all" ? "সব level" : item}</option>)}</select></label>
        <label>Topic<select value={topic} onChange={(event) => { setTopic(event.target.value); resetPage(); }}>{topics.map((item) => <option key={item} value={item}>{item === "all" ? "সব topic" : item}</option>)}</select></label>
        <label>Learning status<select value={state} onChange={(event) => { setState(event.target.value as VocabularyMasteryState | "all"); resetPage(); }}>{mastery.map((item) => <option key={item} value={item}>{masteryLabel[item]}</option>)}</select></label>
      </div>
    </section>

    <section className="vocabulary-library" aria-live="polite" aria-label="Vocabulary study library">
      {result?.entries.length ? <div className="vocabulary-grid">{result.entries.map(({ item, srsCard }, itemIndex) => <article className="vocab-card paper-card" key={item.id}>
        <header><span>{String(page * pageSize + itemIndex + 1).padStart(3, "0")} · CEFR {item.level} · {item.partOfSpeech}</span><button type="button" aria-label={`${item.word} শুনুন`} onClick={() => speak(item.word)}><Volume2 size={16} /></button></header>
        <Link href={`/vocabulary/${encodeURIComponent(item.word)}`}><h2>{item.word}</h2></Link>
        <p className="vocab-meaning">{item.meaning}</p>
        <span className="pronunciation">{item.ipa || item.pronunciation}</span>
        <p className="vocab-definition">{item.definition}</p>
        <Link href={`/vocabulary/${encodeURIComponent(item.word)}`} className="vocab-study-link">অর্থ ও ব্যবহারের বাক্য দেখো</Link>
        <footer><span>{item.level} · {item.topic}</span><span className={`mastery-pill mastery-${srsCard?.masteryState ?? "new"}`}>{masteryLabel[srsCard?.masteryState ?? "new"]}</span></footer>
      </article>)}</div> : <div className="vocabulary-empty"><BookOpenCheck size={20} /><h2>{result ? "এই filter-এ কোনো শব্দ নেই" : "Vocabulary catalogue তৈরি হচ্ছে"}</h2><p>অন্য অক্ষর, level, topic অথবা বাংলা অর্থ দিয়ে আবার খোঁজো।</p></div>}
    </section>

    {result && <nav className="corpus-pagination" aria-label="Vocabulary pages">
      <Button type="button" variant="outline" disabled={page === 0} onClick={() => setPage((value) => Math.max(0, value - 1))}><ChevronLeft size={16} /> আগের</Button>
      <span>পৃষ্ঠা {page + 1} / {totalPages} · প্রতি পৃষ্ঠায় {pageSize} শব্দ</span>
      <Button type="button" variant="outline" disabled={!result.hasMore} onClick={() => setPage((value) => value + 1)}>পরের <ChevronRight size={16} /></Button>
    </nav>}
  </AppShell>;
}
