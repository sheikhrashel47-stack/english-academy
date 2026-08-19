/** Design reminder — Emerald Study House: layered grammar explanation moves from a quiet clue to confident practice. */
import { ArrowLeft, BookMarked, CheckCircle2, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { learningUseCases } from "@/application/usecases/LearningUseCases";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import type { GrammarConcept } from "@/domain/learning/types";

export default function GrammarConceptPage() {
  const { conceptId } = useParams<{ conceptId: string }>(); const [concept, setConcept] = useState<GrammarConcept | null>(null);
  useEffect(() => { if (conceptId) void learningUseCases.getGrammarConcept(conceptId).then(setConcept).catch(() => setConcept(null)); }, [conceptId]);
  if (!concept) return <AppShell eyebrow="Grammar" title="Concept note"><section className="skill-placeholder paper-card"><h2>Grammar concept খোলা হচ্ছে</h2><p>Offline study note খোঁজা হচ্ছে।</p><Link href="/grammar"><Button variant="outline"><ArrowLeft size={16} /> Grammar guide</Button></Link></section></AppShell>;
  return <AppShell eyebrow={`${concept.level} · ${concept.category}`} title={concept.banglaTitle}><article className="grammar-concept paper-card"><header><div><p className="card-kicker"><BookMarked size={14} /> {concept.title}</p><h2>{concept.summary}</h2></div><span className="grammar-concept-level">{concept.level}</span></header><section className="layered-explanations">{concept.layeredExplanations.map((layer) => <article key={layer.audience}><small>{layer.audience === "quick" ? "দ্রুত ধারণা" : layer.audience === "foundation" ? "ভিত তৈরি" : "আরও গভীরে"}</small><h3>{layer.title}</h3><p>{layer.banglaExplanation}</p></article>)}</section><section><h3>মূল নিয়ম</h3>{concept.rules.map((rule) => <div className="grammar-rule" key={rule.rule}><strong>{rule.rule}</strong><p>{rule.banglaExplanation}</p></div>)}</section><section><h3>উদাহরণ</h3>{concept.examples.map((example) => <blockquote key={example.english}>“{example.english}”<small>{example.bangla}</small>{example.note ? <em>{example.note}</em> : null}</blockquote>)}</section><section className="grammar-mistakes"><h3>সাধারণ ভুল</h3>{concept.commonMistakes.map((mistake) => <article key={mistake.incorrect}><span>ভুল: {mistake.incorrect}</span><strong><CheckCircle2 size={16} /> সঠিক: {mistake.corrected}</strong><p>{mistake.banglaExplanation}</p></article>)}</section><footer className="source-attribution"><div><small>Source & licence</small><p>{concept.attribution}</p><span>{concept.license} · commercial use permitted</span></div>{concept.licenseUrl ? <a href={concept.licenseUrl} target="_blank" rel="noreferrer">Licence <ExternalLink size={14} /></a> : null}</footer><Link href="/grammar"><Button variant="outline"><ArrowLeft size={16} /> Back to grammar guide</Button></Link></article></AppShell>;
}
