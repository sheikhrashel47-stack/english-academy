/** Emerald Study House: a three-zone academic skill desk where every action leaves honest local evidence. */
import { BookOpenCheck, Ear, LoaderCircle, MessageCircle, Mic2, PenLine, Volume2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { learningUseCases } from "@/application/usecases/LearningUseCases";
import { AppShell } from "@/components/app/AppShell";
import { SkillActivityRuntime } from "@/components/learning/SkillActivityRuntime";
import { Button } from "@/components/ui/button";
import type { LabSkill, Phrase, SkillActivity, SkillMastery } from "@/domain/learning/types";

type SkillLab = LabSkill;
const stages: SkillActivity["stage"][] = ["learn", "guided-practice", "independent-practice", "assessment", "review"];
const stageCopy: Record<SkillActivity["stage"], { english: string; bangla: string }> = { learn: { english: "Learn", bangla: "শিখো" }, "guided-practice": { english: "Guided", bangla: "নির্দেশিত" }, "independent-practice": { english: "Independent", bangla: "স্বাধীন" }, assessment: { english: "Assess", bangla: "মূল্যায়ন" }, review: { english: "Review", bangla: "পুনরালোচনা" } };
const labels: Record<SkillLab, { title: string; bangla: string; eyebrow: string; icon: typeof Ear; note: string }> = {
  listening: { title: "Listening Lab", bangla: "শোনার ল্যাব", eyebrow: "Six-skill study desk", icon: Ear, note: "শুনো, detail ধরো, তারপর attempt record করো।" },
  pronunciation: { title: "Pronunciation Lab", bangla: "উচ্চারণ ল্যাব", eyebrow: "Six-skill study desk", icon: Volume2, note: "Model শুনে local recording-এ নিজের চেষ্টা করো।" },
  speaking: { title: "Speaking Studio", bangla: "কথা বলার স্টুডিও", eyebrow: "Six-skill study desk", icon: Mic2, note: "Structured prompt-এ বলো; কোনো কৃত্রিম score দাবি করা হয় না।" },
  reading: { title: "Reading Room", bangla: "পাঠের ঘর", eyebrow: "Six-skill study desk", icon: BookOpenCheck, note: "Levelled text পড়ো, evidence দিয়ে meaning ও detail যাচাই করো।" },
  writing: { title: "Writing Desk", bangla: "লেখার ডেস্ক", eyebrow: "Six-skill study desk", icon: PenLine, note: "Draft local device-এ autosave হয়; submit করলে attempt ledger-এ থাকে।" },
  communication: { title: "Communication Studio", bangla: "যোগাযোগ স্টুডিও", eyebrow: "Six-skill study desk", icon: MessageCircle, note: "বাস্তব পরিস্থিতির phrase ও polite response ধাপে ধাপে অনুশীলন করো।" },
};
const labMethod: Record<SkillLab, string> = {
  listening: "শুনো → clue নাও → উত্তর যাচাই",
  pronunciation: "মডেল শোনো → record করো → নিজে তুলনা করো",
  speaking: "Prompt পড়ো → বলো → confidence record করো",
  reading: "পড়ো → শব্দ দেখো → evidence দাও",
  writing: "পরিকল্পনা করো → লেখো → local draft জমা দাও",
  communication: "পরিস্থিতি বোঝো → register বেছে নাও → response বলো",
};

function initialMastery(skill: SkillLab): SkillMastery { return { id: `pending-${skill}`, schemaVersion: 6, updatedAt: "", userId: "local-learner", skill, state: "not-started", activitiesCompleted: 0, attemptCount: 0, correctCount: 0, totalTimeSeconds: 0 }; }

export default function SkillLabPage({ skill }: { skill: SkillLab }) {
  const meta = labels[skill];
  const Icon = meta.icon;
  const [activities, setActivities] = useState<SkillActivity[]>([]);
  const [activeId, setActiveId] = useState<string>();
  const [mastery, setMastery] = useState<SkillMastery>(() => initialMastery(skill));
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [phraseQuery, setPhraseQuery] = useState("");
  const [phraseFormality, setPhraseFormality] = useState<"all" | Phrase["formality"]>("all");
  const [loading, setLoading] = useState(true);
  const activeActivity = useMemo(() => activities.find((item) => item.id === activeId) ?? activities[0], [activities, activeId]);
  const grouped = useMemo(() => stages.map((stage) => ({ stage, activities: activities.filter((item) => item.stage === stage) })), [activities]);
  const filteredPhrases = useMemo(() => phrases.filter((phrase) => (phraseFormality === "all" || phrase.formality === phraseFormality) && `${phrase.phrase} ${phrase.meaning} ${phrase.meaning_bn} ${phrase.context}`.toLocaleLowerCase("en-US").includes(phraseQuery.toLocaleLowerCase("en-US"))), [phraseFormality, phraseQuery, phrases]);
  const refreshMastery = async () => { const records = await learningUseCases.getSkillMastery(); setMastery(records.find((item) => item.skill === skill) ?? initialMastery(skill)); };

  useEffect(() => {
    let mounted = true;
    setLoading(true); setActivities([]); setActiveId(undefined); setMastery(initialMastery(skill));
    void Promise.all([learningUseCases.getSkillActivities({ skill, page: 1, pageSize: 24 }), learningUseCases.getSkillMastery(), skill === "communication" ? learningUseCases.getPhrases() : Promise.resolve([])]).then(([catalogue, records, phraseRecords]) => {
      if (!mounted) return;
      setActivities(catalogue.activities); setPhrases(phraseRecords); setActiveId(catalogue.activities[0]?.id); setMastery(records.find((item) => item.skill === skill) ?? initialMastery(skill)); setLoading(false);
    }).catch(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [skill]);

  return <AppShell eyebrow={meta.eyebrow} title={meta.title}>
    <section className="skill-lab-hero paper-card"><span className="skill-lab-icon"><Icon size={23} /></span><div><p className="card-kicker">{meta.bangla} · {activities.length || "…"} original activities</p><h2>{meta.note}</h2><p>একটি activity শেষ হলে local attempt, ভুলের pattern ও skill mastery ledger হালনাগাদ হয়।</p><div className="skill-hero-action"><Button type="button" disabled={loading || !activeActivity} onClick={() => document.getElementById(`skill-workspace-${skill}`)?.scrollIntoView({ behavior: "smooth", block: "start" })}>{activeActivity ? `${stageCopy[activeActivity.stage].bangla} activity শুরু` : "Catalogue প্রস্তুত হচ্ছে"}</Button><span>{labMethod[skill]}</span></div></div><aside><strong>{mastery.state.replace("-", " ")}</strong><span>{mastery.activitiesCompleted} completed · {mastery.accuracy ?? "—"}% recorded accuracy</span></aside></section>
    <section className="skill-progress-ledger" aria-label={`${meta.title} progress ledger`}><span>LEARNING LEDGER</span><b>{mastery.attemptCount} attempts</b><b>{mastery.correctCount} scored correct</b><b>{mastery.totalTimeSeconds ? `${Math.ceil(mastery.totalTimeSeconds / 60)} min` : "0 min"} evidence</b><small>{mastery.latestConfidence ? `Latest confidence: ${mastery.latestConfidence}` : "প্রথম activity সম্পন্ন করলে তোমার practice record এখানে দেখা যাবে।"}</small></section>
    {skill === "communication" && <section className="phrase-library paper-card"><div className="phrase-library-heading"><div><p className="card-kicker">Communication phrase shelf</p><h2>Situation অনুযায়ী phrase বেছে নাও</h2><p>Phrase library-টি original, local এবং topic/formality দিয়ে filter করা যায়।</p></div><span>{filteredPhrases.length} phrases</span></div><div className="phrase-controls"><input value={phraseQuery} onChange={(event) => setPhraseQuery(event.target.value)} placeholder="Search phrase or Bangla meaning" aria-label="Search communication phrases" /><select value={phraseFormality} onChange={(event) => setPhraseFormality(event.target.value as "all" | Phrase["formality"])} aria-label="Filter phrase formality"><option value="all">All registers</option><option value="neutral">Neutral</option><option value="formal">Formal</option><option value="informal">Informal</option></select></div><div className="phrase-grid">{filteredPhrases.map((phrase) => <article key={phrase.id}><div><strong>{phrase.phrase}</strong><span>{phrase.formality}</span></div><p>{phrase.meaning_bn}</p><small>{phrase.context} · {phrase.level}</small><em>{phrase.example}</em></article>)}</div></section>}
    {loading && <div className="skill-lab-loading"><LoaderCircle size={20} /> Catalogue খুলছে…</div>}
    {!loading && activities.length === 0 && <section className="skill-lab-empty paper-card"><h2>এই skill-এর catalogue এখনো পাওয়া যাচ্ছে না</h2><p>Offline data preparation শেষ হলে আবার চেষ্টা করো।</p><Button type="button" variant="outline" onClick={() => window.location.reload()}>Reload catalogue</Button></section>}
    {!loading && activities.length > 0 && <div className={`skill-lab-workspace workspace-${skill}`} id={`skill-workspace-${skill}`}><nav className="skill-stage-rail" aria-label="Activity stages">{grouped.map(({ stage, activities: entries }) => <section key={stage}><p>{stageCopy[stage].english}<small>{stageCopy[stage].bangla}</small></p><div>{entries.map((entry) => <button type="button" key={entry.id} className={activeActivity?.id === entry.id ? "skill-stage-card is-active" : "skill-stage-card"} onClick={() => setActiveId(entry.id)}><strong>{entry.title}</strong><span>{entry.level} · {entry.estimatedTime} min</span></button>)}</div></section>)}</nav><main>{activeActivity && <SkillActivityRuntime activity={activeActivity} onRecorded={() => void refreshMastery()} />}</main></div>}
  </AppShell>;
}
