/** Emerald Study House: a calm, evidence-first learning activity surface shared by all six labs. */
import { CheckCircle2, CircleHelp, FileText, Lightbulb, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { learningUseCases } from "@/application/usecases/LearningUseCases";
import { AudioPlayer } from "@/components/learning/AudioPlayer";
import { RecordingPanel } from "@/components/learning/RecordingPanel";
import { Button } from "@/components/ui/button";
import type { SkillActivity, SkillConfidence, VocabularyItem } from "@/domain/learning/types";

const stageLabel: Record<SkillActivity["stage"], string> = { learn: "Learn", "guided-practice": "Guided practice", "independent-practice": "Independent practice", assessment: "Assessment", review: "Review" };
const stageBangla: Record<SkillActivity["stage"], string> = { learn: "শিখো", "guided-practice": "নির্দেশিত অনুশীলন", "independent-practice": "স্বাধীন অনুশীলন", assessment: "মূল্যায়ন", review: "পুনরালোচনা" };

export function SkillActivityRuntime({ activity, onRecorded }: { activity: SkillActivity; onRecorded?: () => void }) {
  const [selectedOptionId, setSelectedOptionId] = useState<string>();
  const [feedback, setFeedback] = useState<{ correct?: boolean; text: string }>();
  const [submitted, setSubmitted] = useState(false);
  const [confidence, setConfidence] = useState<SkillConfidence>("medium");
  const [writing, setWriting] = useState("");
  const [note, setNote] = useState("");
  const [lookup, setLookup] = useState<{ word: string; status: "loading" | "found" | "missing"; item?: VocabularyItem }>();
  const [draftReady, setDraftReady] = useState(activity.skill !== "writing");
  const [saving, setSaving] = useState(false);
  const wordCount = useMemo(() => writing.trim() ? writing.trim().split(/\s+/).length : 0, [writing]);
  const isRecording = activity.skill === "pronunciation" || activity.skill === "speaking" || activity.skill === "communication";
  const hasOptions = Boolean(activity.content.options?.length);

  useEffect(() => { setSelectedOptionId(undefined); setFeedback(undefined); setSubmitted(false); setWriting(""); setNote(""); setLookup(undefined); setDraftReady(activity.skill !== "writing"); if (activity.skill === "writing") void learningUseCases.getWritingDraft(activity.id).then((draft) => { setWriting(draft?.text ?? ""); setDraftReady(true); }); if (activity.skill === "reading") void learningUseCases.getNote(`skill-reading-note-${activity.id}`).then((saved) => setNote(saved?.text ?? "")); }, [activity.id, activity.skill]);
  useEffect(() => { if (activity.skill !== "writing" || !draftReady) return; const timer = window.setTimeout(() => { setSaving(true); void learningUseCases.saveWritingDraft(activity.id, writing).finally(() => setSaving(false)); }, 700); return () => window.clearTimeout(timer); }, [activity.id, activity.skill, draftReady, writing]);

  const record = async (input: { response?: string; selectedOptionId?: string; confidence?: SkillConfidence; timeSpentSeconds?: number }) => {
    const result = await learningUseCases.recordSkillAttempt({ activityId: activity.id, ...input });
    setSubmitted(true); onRecorded?.();
    if (result.attempt.isCorrect === true) setFeedback({ correct: true, text: activity.content.explanation ?? "Correct — এই detail-টি তুমি ঠিক ধরেছো।" });
    else if (result.attempt.isCorrect === false) setFeedback({ correct: false, text: activity.content.explanation ?? "আবার content দেখে ধীরে চেষ্টা করো। ভুলটি তোমার review bank-এ রাখা হয়েছে।" });
    else setFeedback({ text: "Attempt সংরক্ষিত হয়েছে। এই কাজের জন্য automatic score দেওয়া হচ্ছে না; confidence ও next practice দিয়ে এগোও।" });
  };
  const submitChoice = () => { if (!selectedOptionId) return; void record({ selectedOptionId, response: activity.content.options?.find((item) => item.id === selectedOptionId)?.text }); };
  const submitWriting = async () => { if (!writing.trim()) return; await learningUseCases.saveWritingDraft(activity.id, writing, true); await record({ response: writing, confidence }); toast.success("Writing response locally submitted হয়েছে; automatic analysis অনুপলব্ধ থাকলে manual review status থাকবে।"); };
  const resetResponse = () => { setSelectedOptionId(undefined); setFeedback(undefined); setSubmitted(false); };
  const lookupWord = async (visibleToken: string) => { const word = visibleToken.replace(/[^A-Za-z'-]/g, "").toLocaleLowerCase("en-US"); if (!word) return; setLookup({ word, status: "loading" }); const result = await learningUseCases.searchVocabulary({ query: word, page: 1, pageSize: 1 }); setLookup({ word, status: result.entries[0] ? "found" : "missing", item: result.entries[0]?.item }); };
  const renderReadingText = (text: string) => <p className="reading-click-text">{text.split(/(\s+)/).map((token, index) => /[A-Za-z]/.test(token) ? <button type="button" key={`${token}-${index}`} onClick={() => void lookupWord(token)}>{token}</button> : token)}</p>;

  return <section className="skill-activity-runtime paper-card" aria-labelledby={`activity-${activity.id}`}>
    <header className="skill-activity-header"><div><p className="card-kicker">{stageLabel[activity.stage]} · {stageBangla[activity.stage]}</p><h2 id={`activity-${activity.id}`}>{activity.title}</h2><p className="skill-activity-bangla">{activity.banglaTitle} · {activity.level} · {activity.topic}</p></div><span className="skill-time">{activity.estimatedTime} min</span></header>
    <div className="skill-ledger-line"><span>{activity.skill}</span><i /><span>{activity.assessment.required ? "Assessment record enabled" : "Practice record enabled"}</span><i /><span>Original · local-first</span></div>
    {activity.skill === "reading" && activity.content.text && <><article className="skill-source-text reading-source-text"><FileText size={18} />{renderReadingText(activity.content.text)}</article>{lookup && <aside className="reading-lookup" aria-live="polite"><strong>{lookup.word}</strong>{lookup.status === "loading" && <span>Searching local vocabulary…</span>}{lookup.status === "found" && <><span>{lookup.item?.meaning}</span><small>{lookup.item?.partOfSpeech} · {lookup.item?.level}</small></>}{lookup.status === "missing" && <span>এই শব্দটি local vocabulary catalogue-এ মেলেনি।</span>}</aside>}<label className="reading-note"><span>তোমার annotation</span><textarea value={note} onChange={(event) => setNote(event.target.value)} onBlur={() => void learningUseCases.saveNote(`skill-reading-note-${activity.id}`, note)} placeholder="মূল ভাব, নতুন শব্দ বা প্রশ্ন লিখে রাখো…" /><small>Blur করলে note এই device-এ save হয়।</small></label></>}
    {activity.content.text && activity.skill !== "listening" && activity.skill !== "pronunciation" && activity.skill !== "reading" && <article className="skill-source-text"><FileText size={18} /><p>{activity.content.text}</p></article>}
    {(activity.skill === "listening" || activity.skill === "pronunciation") && <AudioPlayer label={activity.title} text={activity.content.text ?? activity.instructions} transcript={activity.content.transcript ?? activity.content.text} transcriptAvailable={activity.assessment.transcriptAllowed !== false || submitted} />}
    <div className="skill-instruction"><CircleHelp size={18} /><div><strong>{activity.instructions}</strong><span>{activity.banglaInstructions}</span></div></div>
    {hasOptions && <div className="skill-option-list">{activity.content.options?.map((option) => <button type="button" key={option.id} className={selectedOptionId === option.id ? "skill-option skill-option-selected" : "skill-option"} onClick={() => { setSelectedOptionId(option.id); setFeedback(undefined); }}>{option.text}</button>)}</div>}
    {hasOptions && <div className="skill-runtime-actions"><Button type="button" disabled={!selectedOptionId || submitted} onClick={submitChoice}><CheckCircle2 size={16} /> Check and save attempt</Button>{submitted && <Button type="button" variant="outline" onClick={resetResponse}><RotateCcw size={16} /> Try another response</Button>}</div>}
    {isRecording && <RecordingPanel title={activity.skill === "pronunciation" ? "Pronunciation practice" : "Local speaking attempt"} prompt={activity.instructions} onSubmit={({ seconds, hasRecording }) => record({ response: hasRecording ? "Local recording created; audio is not uploaded." : "Completed without local audio.", confidence, timeSpentSeconds: seconds })} onSelfReflection={() => record({ response: "Completed through self-reflection because local recording was unavailable.", confidence })} />}
    {activity.skill === "writing" && <div className="runtime-writing"><textarea value={writing} onChange={(event) => setWriting(event.target.value)} disabled={!draftReady} placeholder="Write your answer in English…" aria-label="Writing response" /><div className="writing-toolbar"><span>{wordCount} words · {saving ? "saving…" : "local autosave on"}</span><Button type="button" variant="outline" onClick={() => { if (writing && window.confirm("Clear this local draft?")) setWriting(""); }}>Clear draft</Button><Button type="button" disabled={!writing.trim() || submitted} onClick={() => void submitWriting()}>Submit response</Button></div></div>}
    {!hasOptions && !isRecording && activity.skill !== "writing" && <div className="skill-reflection"><p>নিজের confidence বেছে নিয়ে attempt সংরক্ষণ করো।</p><div>{(["low", "medium", "high"] as SkillConfidence[]).map((item) => <button type="button" key={item} onClick={() => setConfidence(item)} className={confidence === item ? "confidence-choice is-active" : "confidence-choice"}>{item}</button>)}</div><Button type="button" disabled={submitted} onClick={() => void record({ response: activity.instructions, confidence })}>Complete practice</Button></div>}
    {feedback && <aside className={feedback.correct === true ? "skill-runtime-feedback is-correct" : feedback.correct === false ? "skill-runtime-feedback is-warn" : "skill-runtime-feedback"}><Lightbulb size={18} /><p>{feedback.text}</p></aside>}
    <footer className="skill-source-note">Source: {activity.attribution} Licence: {activity.license}. No external audio, automatic pronunciation score, or cloud recording upload is used.</footer>
  </section>;
}
