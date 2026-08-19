/** Design reminder — “ভাষার মানচিত্র”: grammar concepts are navigable field notes, never a wall of rules. */
import { ArrowUpRight, BookOpenCheck, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { learningUseCases } from "@/application/usecases/LearningUseCases";
import { AppShell } from "@/components/app/AppShell";
import type { GrammarConcept, LevelCode } from "@/domain/learning/types";

const levelOptions: Array<LevelCode | "all"> = ["all", "Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"];
const categories = ["all", "Foundation", "Tense & form", "Expression"];

export default function GrammarPage() {
  const [concepts, setConcepts] = useState<GrammarConcept[]>([]); const [level, setLevel] = useState<LevelCode | "all">("all"); const [category, setCategory] = useState("all");
  useEffect(() => { void learningUseCases.getGrammarConcepts({ level: level === "all" ? undefined : level, category: category === "all" ? undefined : category, pageSize: 48 }).then((result) => setConcepts(result.items)); }, [level, category]);
  return <AppShell eyebrow="Grammar study" title="নিয়মের study room">
    <section className="grammar-intro paper-card map-contour"><div><p className="card-kicker"><BookOpenCheck size={15} /> Grammar concept library</p><h2>নিয়ম মুখস্থ নয়—<em>বাক্যে বুঝে ব্যবহার করো।</em></h2><p>প্রতিটি concept-এ আছে দ্রুত ধারণা, Bangla ব্যাখ্যা, উদাহরণ, সাধারণ ভুল এবং practice path।</p><span className="academy-focus-line">Study ledger: concept → example → common mistake → practice</span></div><span className="grammar-compass">Aa</span></section>
    <section className="grammar-filter-bar paper-card" aria-label="Grammar filters"><label>Level<select value={level} onChange={(event) => setLevel(event.target.value as LevelCode | "all")}>{levelOptions.map((item) => <option key={item} value={item}>{item === "all" ? "সব level" : item}</option>)}</select></label><label>Category<select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item} value={item}>{item === "all" ? "সব category" : item}</option>)}</select></label><span>{concepts.length}টি concept</span></section>
    <section className="grammar-guide">{concepts.map((concept, index) => <article id={concept.id} className="grammar-entry" key={concept.id}><span className="grammar-index">{String(index + 1).padStart(2, "0")}</span><div><p><MapPin size={14} /> {concept.level} · {concept.category}</p><h2>{concept.banglaTitle}</h2><h3>{concept.title}</h3><span>{concept.summary}</span><small>{concept.commonMistakes.length}টি common mistake · {concept.examples.length}টি example</small></div><Link href={`/grammar/${concept.id}`} aria-label={`${concept.title} খুলুন`}><ArrowUpRight size={18} /></Link></article>)}</section>
  </AppShell>;
}
