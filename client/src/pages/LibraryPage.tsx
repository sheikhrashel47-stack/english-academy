/** Design reminder — “Emerald Study House”: this is a quiet, indexed reference desk. Scan a category, verify a rule, and return to study without reward-dashboard noise. */
import { ArrowUpRight, Bookmark, BookOpenCheck, Clock3, Search, ShieldCheck } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useRoute } from "wouter";
import { learningUseCases } from "@/application/usecases/LearningUseCases";
import { AppShell } from "@/components/app/AppShell";
import type { LibraryActivity, LibraryCategory, LibraryResource, LibrarySearchHit, LibrarySearchHistory, LibraryResourceType, LevelCode } from "@/domain/learning/types";

const levels: Array<LevelCode | "all"> = ["all", "Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"];
const typeLabel = (value: string) => value.replace(/-/g, " ");

function ResourceCard({ item, saved, onToggle }: { item: LibraryResource | LibrarySearchHit; saved: boolean; onToggle: (id: string) => void }) {
  const route = "route" in item ? item.route : `/library/${item.id}`;
  return <article className="library-resource-card">
    <div className="library-card-topline"><span>{typeLabel(item.type)}</span><button type="button" onClick={() => onToggle(item.id)} className={saved ? "library-save-button is-saved" : "library-save-button"} aria-label={saved ? `${item.title} saved list থেকে সরান` : `${item.title} saved list-এ যোগ করুন`}><Bookmark size={16} fill={saved ? "currentColor" : "none"} /></button></div>
    <Link href={route} className="library-card-link"><h3>{item.title}</h3><p className="library-card-bangla-title">{item.banglaTitle}</p><p>{item.summary}</p><div className="library-card-evidence"><small>CEFR {item.level}</small>{"estimatedMinutes" in item && <small><Clock3 size={13} /> {item.estimatedMinutes} min</small>}<ArrowUpRight size={17} /></div></Link><footer className="library-card-provenance"><ShieldCheck size={12}/> Original · local reference</footer>
  </article>;
}

export default function LibraryPage() {
  const [savedRoute] = useRoute("/library/saved"); const isSavedView = Boolean(savedRoute);
  const [categories, setCategories] = useState<LibraryCategory[]>([]); const [resources, setResources] = useState<LibraryResource[]>([]); const [savedIds, setSavedIds] = useState<Set<string>>(new Set()); const [history, setHistory] = useState<LibrarySearchHistory[]>([]); const [recent, setRecent] = useState<Array<{ resource: LibraryResource; activity: LibraryActivity }>>([]);
  const [categoryId, setCategoryId] = useState("all"); const [level, setLevel] = useState<LevelCode | "all">("all"); const [query, setQuery] = useState(""); const [submittedQuery, setSubmittedQuery] = useState(""); const [searchHits, setSearchHits] = useState<LibrarySearchHit[] | null>(null); const [loading, setLoading] = useState(true);
  const visibleItems = useMemo(() => searchHits ?? resources, [resources, searchHits]);
  const refresh = async () => {
    setLoading(true);
    const [nextCategories, library, saved, recentSearches, recentResources] = await Promise.all([
      learningUseCases.getLibraryCategories(),
      isSavedView ? Promise.resolve(undefined) : learningUseCases.getLibraryResources({ categoryId: categoryId === "all" ? undefined : categoryId, level: level === "all" ? undefined : level, pageSize: 48 }),
      learningUseCases.getLibrarySavedResources(), learningUseCases.getLibrarySearchHistory(), learningUseCases.getRecentLibraryResources(),
    ]);
    const savedFiltered = saved.filter((item) => (categoryId === "all" || item.categoryId === categoryId) && (level === "all" || item.level === level));
    setCategories(nextCategories); setResources(isSavedView ? savedFiltered : library?.items ?? []); setSavedIds(new Set(saved.map((item) => item.id))); setHistory(recentSearches); setRecent(recentResources); setLoading(false);
  };
  useEffect(() => { void refresh(); }, [categoryId, isSavedView, level]);
  const submitSearch = async (event?: FormEvent) => {
    event?.preventDefault(); const value = query.trim(); setSubmittedQuery(value);
    if (!value) { setSearchHits(null); return; }
    setLoading(true); const result = await learningUseCases.searchLibrary({ query: value, level: level === "all" ? undefined : level, pageSize: 36 }); setSearchHits(result.hits); setHistory(await learningUseCases.getLibrarySearchHistory()); setLoading(false);
  };
  const toggleSaved = async (id: string) => { const saved = await learningUseCases.toggleBookmark(id, "library"); setSavedIds((current) => { const next = new Set(current); saved ? next.add(id) : next.delete(id); return next; }); };
  return <AppShell eyebrow="English Library" title={isSavedView ? "Saved reference desk" : "English reference desk"}>
    <section className="library-hero paper-card">
      <div className="library-hero-copy"><p className="card-kicker"><BookOpenCheck size={15} /> Offline reference center</p><h2>English reference <em>desk</em></h2><p className="library-hero-bangla">একটি ইংরেজি প্রশ্ন বাছুন, তারপর নিয়ম, উদাহরণ ও নিজের ব্যবহার মিলিয়ে দেখুন।</p><p>Short, rights-labelled and Bangla-supported notes for grammar, word use, pronunciation and practical communication.</p><div className="library-hero-ledger"><span>CEFR {level === "all" ? "A1–C2 path" : `${level} focus`}</span><span>17 reference paths</span><span><ShieldCheck size={14} /> Original · local</span></div></div>
      <aside className="library-hero-aside"><strong>Start with one question</strong><p>প্রথমে search box-এ একটি word, rule বা phrase লিখুন।</p><ol><li>নিয়ম দেখুন</li><li>উদাহরণ মিলিয়ে নিন</li><li>নিজের বাক্যে ব্যবহার করুন</li></ol></aside>
    </section>
    <section className="library-search-panel paper-card" aria-label="Library search and filters">
      <p className="library-search-prompt">Search one English question</p><form onSubmit={submitSearch}><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search: present simple, at on in, look after…" aria-label="Search the English Library"/><button type="submit">খুঁজুন</button></form>
      <div className="library-filter-row"><label>স্তর<select value={level} onChange={(event) => { setLevel(event.target.value as LevelCode | "all"); setSearchHits(null); }} >{levels.map((item) => <option value={item} key={item}>{item === "all" ? "সব level" : item}</option>)}</select></label><button type="button" className={searchHits ? "library-clear-search" : "library-clear-search is-hidden"} onClick={() => { setQuery(""); setSubmittedQuery(""); setSearchHits(null); }}>Browse mode</button><span>{loading ? "Local index পড়া হচ্ছে…" : `${visibleItems.length}টি reference`}</span></div>
      {history.length > 0 && <div className="library-history" aria-label="Recent local searches"><small>Recent local searches</small>{history.map((item) => <button key={item.id} type="button" onClick={() => { setQuery(item.query); void (async () => { const result = await learningUseCases.searchLibrary({ query: item.query, level: level === "all" ? undefined : level }); setSubmittedQuery(item.query); setSearchHits(result.hits); })(); }}>{item.query}</button>)}</div>}
    </section>
    <section className="library-category-rail" aria-label="Library categories"><button type="button" onClick={() => { setCategoryId("all"); setSearchHits(null); }} className={categoryId === "all" ? "library-category-chip active" : "library-category-chip"}>সব বিষয়</button>{categories.map((category) => <button key={category.id} type="button" onClick={() => { setCategoryId(category.id); setSearchHits(null); }} className={categoryId === category.id ? "library-category-chip active" : "library-category-chip"}><b>{category.banglaTitle}</b><small>{category.title}</small></button>)}</section>
    {!isSavedView && !submittedQuery && recent.length > 0 && <section className="library-continue-strip" aria-label="Continue reading"><div><p className="section-kicker">Local reading record</p><h2>যেখান থেকে পড়েছিলেন</h2></div><div>{recent.map(({ resource }) => <Link key={resource.id} href={`/library/${resource.id}`}><span>{resource.banglaTitle}</span><small>{resource.title} · Continue reading</small><ArrowUpRight size={15}/></Link>)}</div></section>}
    <section className="library-catalogue" aria-live="polite"><div className="library-section-heading"><div><p className="section-kicker">{isSavedView ? "Local saved list · reference ledger" : submittedQuery ? `Search result · ${submittedQuery}` : categoryId === "all" ? "Reference catalogue · original local notes" : categories.find((item) => item.id === categoryId)?.title}</p><h2>{isSavedView ? <>Saved reference notes <span>— সংরক্ষিত নোট</span></> : submittedQuery ? <>Matching references <span>— মিল পাওয়া নোট</span></> : <>Reference notes by topic <span>— বিষয় ধরে পড়ুন</span></>}</h2></div>{isSavedView ? <Link href="/library" className="library-saved-link">Catalogue-তে ফিরুন <ArrowUpRight size={15} /></Link> : savedIds.size > 0 && <Link href="/library/saved" className="library-saved-link"><Bookmark size={15} /> Saved {savedIds.size}</Link>}</div>{!loading && visibleItems.length === 0 ? <div className="library-empty"><BookOpenCheck size={24}/><h3>{isSavedView ? "No saved references yet" : "এই খোঁজে কোনো note নেই"}</h3><p>{isSavedView ? "প্রথমে একটি reference খুলুন, তারপর bookmark থেকে নিজের local saved list তৈরি করুন।" : "English বা Bangla keyword বদলে দেখুন, অথবা category থেকে browse করুন।"}</p>{isSavedView && <Link href="/library" className="library-empty-action">Reference খুঁজুন <ArrowUpRight size={15}/></Link>}</div> : <div className="library-resource-grid">{visibleItems.map((item) => <ResourceCard key={`${"source" in item ? item.source : "library"}-${item.id}`} item={item} saved={savedIds.has(item.id)} onToggle={(id) => void toggleSaved(id)} />)}</div>}</section>
    <p className="library-source-note">এই Library-র বর্তমান content হলো rights-labelled original reference samples। এটি পূর্ণ dictionary, textbook, corpus বা audio library দাবি করে না।</p>
  </AppShell>;
}
