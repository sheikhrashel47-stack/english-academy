/** Design reminder — Emerald Study House: skill labs are practical, calm and explicit about local browser capabilities. */
import { BookOpenCheck, Ear, Mic2, PenLine, Volume2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { learningUseCases } from "@/application/usecases/LearningUseCases";
import { AppShell } from "@/components/app/AppShell";
import { AudioPlayer } from "@/components/learning/AudioPlayer";
import { RecordingPanel } from "@/components/learning/RecordingPanel";
import { Button } from "@/components/ui/button";
import { useLearningPreferences } from "@/contexts/LearningPreferencesContext";
import { skillLabSamples } from "@/data/content/skillLabSamples";

type SkillLab = "listening" | "pronunciation" | "speaking" | "writing" | "reading";
const labels: Record<SkillLab, { title: string; eyebrow: string; icon: typeof Ear }> = { listening: { title: "Listening Lab", eyebrow: "Skill practice", icon: Ear }, pronunciation: { title: "Pronunciation Lab", eyebrow: "Skill practice", icon: Volume2 }, speaking: { title: "Speaking Studio", eyebrow: "Skill practice", icon: Mic2 }, writing: { title: "Writing Desk", eyebrow: "Skill practice", icon: PenLine }, reading: { title: "Reading Room", eyebrow: "Skill practice", icon: BookOpenCheck } };
const taskCopy: Record<SkillLab, { english: string; bangla: string; detailEnglish: string; detailBangla: string }> = {
  listening: { english: "Listen for the speaker’s name", bangla: "শুনে বক্তার নামটি খুঁজে বের করো", detailEnglish: "Play a short voice sample, then answer one listening question.", detailBangla: "ছোট voice sample শোনো, তারপর একটি listening question-এর উত্তর দাও।" },
  pronunciation: { english: "Hear the phrase, then say it clearly", bangla: "বাক্যটি শোনো, তারপর স্পষ্ট করে বলো", detailEnglish: "Use browser audio and an optional local recording to compare your own attempt.", detailBangla: "Browser audio শোনো এবং চাইলে নিজের চেষ্টা locally record করো।" },
  speaking: { english: "Say one clear self-introduction", bangla: "একটি স্পষ্ট self-introduction বলো", detailEnglish: "Record a short spoken answer in this browser. No automatic score is claimed.", detailBangla: "এই browser-এ ছোট spoken answer record করো; কোনো automatic score দেখানো হচ্ছে না।" },
  writing: { english: "Write a short introduction in English", bangla: "ইংরেজিতে ছোট পরিচয় লেখো", detailEnglish: "Draft your response and keep it on this device for later review.", detailBangla: "উত্তরটি draft করে এই device-এ পরের review-এর জন্য রেখে দাও।" },
  reading: { english: "Read one short levelled text", bangla: "একটি ছোট levelled text পড়ো", detailEnglish: "The next reading sample will appear with the next content release.", detailBangla: "পরের content release-এ reading sample যুক্ত হবে।" },
};

function languageCopy(mode: "bangla" | "mixed" | "immersion", bangla: string, english: string) { return mode === "bangla" ? bangla : mode === "immersion" ? english : `${english} · ${bangla}`; }

function WritingDesk() {
  const sample = skillLabSamples.writing;
  const [text, setText] = useState("");
  const [ready, setReady] = useState(false);
  useEffect(() => { void learningUseCases.getWritingDraft(sample.id).then((draft) => { setText(draft?.text ?? ""); setReady(true); }); }, [sample.id]);
  const words = useMemo(() => text.trim() ? text.trim().split(/\s+/).length : 0, [text]);
  const save = async (submitted = false) => { await learningUseCases.saveWritingDraft(sample.id, text, submitted); toast.success(submitted ? "Writing sample locally submitted হয়েছে; এই phase-এ automated feedback নেই।" : "Draft এই device-এ save হয়েছে। "); };
  return <section className="writing-desk paper-card"><p className="card-kicker">Sample writing task</p><h2>{sample.title}</h2><p>{sample.prompt}</p><textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="Write your answer in English…" aria-label="Writing response" disabled={!ready} /><div className="writing-toolbar"><span>{words} words</span><div><Button type="button" variant="outline" onClick={() => setText("")}>Clear</Button><Button type="button" variant="outline" onClick={() => void save(false)}>Save draft</Button><Button type="button" onClick={() => void save(true)} disabled={!text.trim()}>Submit</Button></div></div><small>Draftটি IndexedDB-তে থাকে; cloud sync বা AI feedback এই phase-এ নেই।</small></section>;
}

export default function SkillLabPage({ skill }: { skill: SkillLab }) {
  const meta = labels[skill];
  const Icon = meta.icon;
  const { languageMode } = useLearningPreferences();
  const [answer, setAnswer] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const listening = skillLabSamples.listening;
  const intro = taskCopy[skill];
  return <AppShell eyebrow={meta.eyebrow} title={meta.title}><div className="skill-lab-intro paper-card"><span className="skill-lab-icon"><Icon size={23} /></span><div><p className="card-kicker">Independent practice</p><h2><span>{intro.english}</span>{languageMode !== "immersion" && <small>{intro.bangla}</small>}</h2><p>{languageCopy(languageMode, intro.detailBangla, intro.detailEnglish)}</p></div></div>{skill === "listening" && <section className="skill-lab-grid"><AudioPlayer label={listening.title} text={listening.transcript} transcript={listening.transcript} /><article className="skill-question paper-card"><p className="card-kicker">Check understanding</p><h2>{listening.prompt}</h2><div>{listening.options.map((option) => <button type="button" key={option} className={answer === option ? "skill-option skill-option-selected" : "skill-option"} onClick={() => { setAnswer(option); setChecked(false); }}>{option}</button>)}</div><Button type="button" onClick={() => setChecked(true)} disabled={!answer}>Check answer</Button>{checked && <p className={answer === listening.answer ? "skill-feedback skill-feedback-correct" : "skill-feedback skill-feedback-wrong"}>{answer === listening.answer ? "Correct — Rina is speaking." : "Try again. Listen once more and focus on the name."}</p>}</article></section>}{skill === "pronunciation" && <section className="skill-lab-grid"><AudioPlayer label={skillLabSamples.pronunciation.title} text={skillLabSamples.pronunciation.transcript} transcript={skillLabSamples.pronunciation.transcript} /><RecordingPanel prompt={skillLabSamples.pronunciation.prompt} /></section>}{skill === "speaking" && <RecordingPanel prompt="Say: Hello, my name is ____. Nice to meet you." />}{skill === "writing" && <WritingDesk />}{skill === "reading" && <article className="skill-placeholder paper-card"><BookOpenCheck size={28} /><h2>Reading starter</h2><p>Short, level-tagged reading passages will be added with the next content release. Use the current lessons for the available sample reading practice.</p></article>}</AppShell>;
}
