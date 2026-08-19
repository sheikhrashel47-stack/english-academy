/** Design reminder — “ভাষার মানচিত্র”: grammar is a field guide of navigable patterns. */
import { ArrowUpRight, BookOpenCheck, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { learningUseCases } from "@/application/usecases/LearningUseCases";
import { AppShell } from "@/components/app/AppShell";
import type { GrammarTopic } from "@/domain/learning/types";

export default function GrammarPage() {
  const [topics, setTopics] = useState<GrammarTopic[]>([]);
  useEffect(() => { void learningUseCases.getGrammarTopics().then(setTopics); }, []);
  return <AppShell eyebrow="Grammar field guide" title="নিয়মের মানচিত্র">
    <section className="grammar-intro paper-card map-contour"><div><p className="card-kicker"><BookOpenCheck size={15} /> পাঁচটি পথচিহ্ন</p><h2>নিয়ম মুখস্থ নয়—<em>বাক্যের ভিতর খুঁজে নাও।</em></h2><p>প্রতিটি topic একটি lesson-এর সঙ্গে যুক্ত। ছোট ব্যাখ্যা পড়ে সরাসরি সেই lesson-এ ফিরে যাও।</p></div><span className="grammar-compass">G</span></section>
    <section className="grammar-route-index" aria-label="Grammar route index"><span>Route index</span><div>{topics.map((topic, index) => <a key={topic.id} href={`#${topic.id}`}><i>{String(index + 1).padStart(2, "0")}</i>{topic.banglaTitle}</a>)}</div></section>
    <section className="grammar-guide">{topics.map((topic, index) => <article id={topic.id} className="grammar-entry" key={topic.id}><span className="grammar-index">{String(index + 1).padStart(2, "0")}</span><div><p><MapPin size={14} /> {topic.level} landmark</p><h2>{topic.banglaTitle}</h2><h3>{topic.title}</h3><span>{topic.description}</span></div><Link href={`/lesson/${topic.lessonId}`} aria-label={`${topic.title} lesson খুলুন`}><ArrowUpRight size={18} /></Link></article>)}</section>
  </AppShell>;
}
