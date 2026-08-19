/**
 * Design reminder — “Emerald Study House”: a lesson is an uncluttered study sequence.
 * Each block reveals one useful learning action and reports its outcome through the application layer.
 */
import { BookOpenCheck, CheckCircle2, ImageOff, Lightbulb, MessageCircleMore, PenLine, Quote, Save, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { learningUseCases } from "@/application/usecases/LearningUseCases";
import { AudioPlayer } from "@/components/learning/AudioPlayer";
import { RecordingPanel } from "@/components/learning/RecordingPanel";
import { QuestionCard } from "@/components/learning/QuestionCard";
import { Button } from "@/components/ui/button";
import type { LessonBlock, Question, UserActivityProgress, VocabularyItem } from "@/domain/learning/types";

type Props = { block: LessonBlock; vocabulary: VocabularyItem[]; questions: Question[]; activityProgress?: UserActivityProgress[]; onQuestionAnswered: (blockId: string, isCorrect: boolean) => void; onActivity: (blockId: string, response?: string, score?: number, confidence?: UserActivityProgress["confidence"]) => void };

function WritingBlock({ block, onActivity }: { block: Extract<LessonBlock, { type: "writing" }>; onActivity: Props["onActivity"] }) {
  const [text, setText] = useState(""); const [saved, setSaved] = useState(false);
  useEffect(() => { void learningUseCases.getWritingDraft(block.promptId).then((draft) => setText(draft?.text ?? "")); }, [block.promptId]);
  const save = async (submitted = false) => { await learningUseCases.saveWritingDraft(block.promptId, text, submitted); setSaved(true); if (submitted || text.trim()) onActivity(block.id, text, text.trim().split(/\s+/).filter(Boolean).length); };
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  return <section className="lesson-writing-block"><div className="lesson-block-label"><PenLine size={17} /><span>Writing practice</span></div><h3>{block.prompt}</h3>{block.hint && <p className="lesson-muted">Hint: {block.hint}</p>}<textarea value={text} onChange={(event) => { setText(event.target.value); setSaved(false); }} placeholder="Write your answer in English…" rows={7} /><div className="writing-block-footer"><span>{wordCount} word{wordCount === 1 ? "" : "s"}{block.minWords ? ` · target ${block.minWords}+` : ""}</span><div><Button type="button" variant="outline" size="sm" onClick={() => void save(false)}><Save size={15} /> Draft save</Button><Button type="button" size="sm" disabled={!text.trim()} onClick={() => void save(true)}><CheckCircle2 size={15} /> Self-check</Button></div></div>{saved && <p className="lesson-save-confirmation" role="status">তোমার draft এই ডিভাইসে সংরক্ষিত হয়েছে।</p>}</section>;
}

function SelfCheckBlock({ block, onActivity, previous }: { block: Extract<LessonBlock, { type: "self-check" }>; onActivity: Props["onActivity"]; previous?: UserActivityProgress }) {
  const [choice, setChoice] = useState(previous?.response ?? "");
  return <section className="lesson-self-check"><div className="lesson-block-label"><BookOpenCheck size={17} /><span>Reflection</span></div><h3>{block.prompt}</h3><div className="self-check-options">{block.options.map((option) => <button type="button" key={option} className={choice === option ? "self-check-active" : ""} onClick={() => { setChoice(option); onActivity(block.id, option, undefined, option === block.options[0] ? "easy" : option === block.options[1] ? "okay" : "difficult"); }}>{choice === option && <CheckCircle2 size={16} />}{option}</button>)}</div></section>;
}

export function LessonBlockRenderer({ block, vocabulary, questions, activityProgress = [], onQuestionAnswered, onActivity }: Props) {
  const previous = activityProgress.find((item) => item.blockId === block.id);
  if (block.type === "heading") return <h2 className="lesson-section-heading">{block.text}</h2>;
  if (block.type === "explanation") return <section className="lesson-explanation">{block.title && <p className="card-kicker">{block.title}</p>}<p>{block.text}</p>{block.tip && <div className="lesson-tip"><Lightbulb size={17} /><span>{block.tip}</span></div>}</section>;
  if (block.type === "example") return <blockquote className="lesson-example"><Quote size={22} /><div><strong>{block.english}</strong><span>{block.bangla}</span>{block.note && <em>{block.note}</em>}</div></blockquote>;
  if (block.type === "dialogue") return <section className="lesson-dialogue"><div className="lesson-block-label"><MessageCircleMore size={17} /><span>{block.title ?? "Useful dialogue"}</span></div>{block.turns.map((turn, index) => <article key={`${turn.speaker}-${index}`}><strong>{turn.speaker}</strong><p>{turn.english}</p>{turn.bangla && <small>{turn.bangla}</small>}</article>)}</section>;
  if (block.type === "reading") return <section className="lesson-reading"><div className="lesson-block-label"><BookOpenCheck size={17} /><span>{block.title ?? "Reading"}</span></div><p>{block.text}</p>{block.banglaSummary && <aside>{block.banglaSummary}</aside>}</section>;
  if (block.type === "vocabulary") return <section className="lesson-vocabulary-grid">{vocabulary.filter((item) => block.vocabularyIds.includes(item.id)).map((item) => <article className="lesson-vocabulary" key={item.id}><span>{item.partOfSpeech}</span><strong>{item.word}</strong><p>{item.meaning}</p><small>{item.pronunciation}</small></article>)}</section>;
  if (block.type === "image") return block.src ? <figure className="lesson-image"><img src={block.src} alt={block.alt} /><figcaption>{block.caption}</figcaption></figure> : <figure className="lesson-image-placeholder"><ImageOff size={22} /><figcaption>{block.caption ?? block.alt}</figcaption></figure>;
  if (block.type === "audio") return <div onClick={() => onActivity(block.id, "audio-opened")}><AudioPlayer label={block.label} text={block.transcript ?? "Audio sample is unavailable for this lesson."} transcript={block.transcript} /></div>;
  if (block.type === "speaking") return <section onClick={() => onActivity(block.id, "speaking-opened")}><div className="lesson-block-label"><Volume2 size={17} /><span>Speaking practice</span></div><RecordingPanel prompt={block.prompt} /></section>;
  if (block.type === "writing") return <WritingBlock block={block} onActivity={onActivity} />;
  if (block.type === "self-check") return <SelfCheckBlock block={block} onActivity={onActivity} previous={previous} />;
  if (block.type === "question") { const question = questions.find((item) => item.id === block.questionId); return question ? <QuestionCard question={question} onAnswered={(isCorrect) => onQuestionAnswered(block.id, isCorrect)} /> : null; }
  if (block.type === "mini-test" || block.type === "assessment") return <section className="lesson-mini-test"><div className="lesson-block-label"><BookOpenCheck size={17} /><span>{block.type === "assessment" ? block.title ?? "Checkpoint assessment" : "Quick review"}</span></div>{questions.filter((question) => block.questionIds.includes(question.id)).map((question) => <QuestionCard key={question.id} question={question} onAnswered={(isCorrect) => onQuestionAnswered(block.id, isCorrect)} />)}</section>;
  if (block.type === "review") return <aside className="lesson-review"><span>Study note</span><p>{block.text}</p></aside>;
  return null;
}
