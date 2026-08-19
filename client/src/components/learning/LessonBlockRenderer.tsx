/**
 * Design reminder — “ভাষার মানচিত্র”: lessons read like a focused editorial page;
 * use gentle margin notes rather than dense component chrome.
 */
import { Lightbulb, Quote } from "lucide-react";
import { QuestionCard } from "@/components/learning/QuestionCard";
import type { LessonBlock, Question, VocabularyItem } from "@/domain/learning/types";

export function LessonBlockRenderer({ block, vocabulary, questions, onAnswered }: { block: LessonBlock; vocabulary: VocabularyItem[]; questions: Question[]; onAnswered: (isCorrect: boolean) => void }) {
  if (block.type === "heading") return <h2 className="lesson-section-heading">{block.text}</h2>;
  if (block.type === "explanation") {
    return <section className="lesson-explanation">
      {block.title && <p className="card-kicker">{block.title}</p>}
      <p>{block.text}</p>
      {block.tip && <div className="lesson-tip"><Lightbulb size={17} /><span>{block.tip}</span></div>}
    </section>;
  }
  if (block.type === "example") return <blockquote className="lesson-example"><Quote size={22} /><div><strong>{block.english}</strong><span>{block.bangla}</span>{block.note && <em>{block.note}</em>}</div></blockquote>;
  if (block.type === "vocabulary") return <section className="lesson-vocabulary-grid">{vocabulary.filter((item) => block.vocabularyIds.includes(item.id)).map((item) => <article className="lesson-vocabulary" key={item.id}><span>{item.partOfSpeech}</span><strong>{item.word}</strong><p>{item.meaning}</p><small>{item.pronunciation}</small></article>)}</section>;
  if (block.type === "question") {
    const question = questions.find((item) => item.id === block.questionId);
    return question ? <QuestionCard question={question} onAnswered={onAnswered} /> : null;
  }
  if (block.type === "review") return <aside className="lesson-review"><span>পথের নোট</span><p>{block.text}</p></aside>;
  return null;
}
