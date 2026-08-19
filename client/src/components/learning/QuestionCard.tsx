/**
 * Design reminder — “ভাষার মানচিত্র”: one question at a time, clear feedback in a margin note,
 * and terracotta only for the learner’s active decision.
 */
import { CheckCircle2, Circle, RotateCcw, Sparkles, XCircle } from "lucide-react";
import { useState } from "react";
import { learningUseCases } from "@/application/usecases/LearningUseCases";
import { Button } from "@/components/ui/button";
import type { ExerciseResult } from "@/domain/practice/exerciseEngine";
import type { Question } from "@/domain/learning/types";
import { cn } from "@/lib/utils";

export function QuestionCard({ question, onAnswered }: { question: Question; onAnswered?: (correct: boolean) => void }) {
  const [selected, setSelected] = useState("");
  const [textAnswer, setTextAnswer] = useState("");
  const [tokens, setTokens] = useState<{ token: string; index: number }[]>([]);
  const [result, setResult] = useState<ExerciseResult>();
  const [saving, setSaving] = useState(false);
  const answer = question.type === "sentence-builder" ? tokens.map(({ token }) => token).join(" ") : question.type === "mcq" ? selected : textAnswer;
  const canSubmit = Boolean(answer.trim()) && !result;

  const submit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    try {
      const next = await learningUseCases.submitAnswer(question.id, answer);
      setResult(next);
      onAnswered?.(next.isCorrect);
    } finally {
      setSaving(false);
    }
  };

  const reset = () => { setSelected(""); setTextAnswer(""); setTokens([]); setResult(undefined); };
  const isMcq = question.type === "mcq";

  return (
    <section className="question-card" aria-labelledby={`question-${question.id}`}>
      <div className="question-meta"><span>Check point</span><span>{question.skill} · Level {question.difficulty}</span></div>
      <h3 id={`question-${question.id}`}>{question.prompt}</h3>
      {question.banglaPrompt && <p className="question-translation">{question.banglaPrompt}</p>}

      {isMcq && <div className="answer-options" role="radiogroup" aria-label={question.banglaPrompt || question.prompt}>
        {question.options.map((option, index) => {
          const isSelected = selected === option.id;
          const isCorrect = result && option.id === result.correctOptionId;
          const isWrong = result && isSelected && !result.isCorrect;
          return <button type="button" key={option.id} role="radio" aria-checked={isSelected} disabled={Boolean(result)} onClick={() => setSelected(option.id)} className={cn("answer-option", isSelected && "answer-selected", isCorrect && "answer-correct", isWrong && "answer-wrong")}>
            <span className="answer-index">{String.fromCharCode(65 + index)}</span><span>{option.text}</span>
            {isCorrect ? <CheckCircle2 size={18} /> : isWrong ? <XCircle size={18} /> : isSelected ? <Circle size={17} fill="currentColor" /> : null}
          </button>;
        })}
      </div>}

      {(question.type === "fill-blank" || question.type === "vocabulary-recall") && <label className="answer-text-field">
        <span>{question.type === "vocabulary-recall" ? `Word atlas · ${question.word}` : "তোমার উত্তর"}</span>
        <input value={textAnswer} disabled={Boolean(result)} placeholder={question.type === "vocabulary-recall" ? "বাংলা অর্থ লিখো" : question.placeholder ?? "সঠিক শব্দটি লেখো"} onChange={(event) => setTextAnswer(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void submit(); }} />
      </label>}

      {question.type === "sentence-builder" && <div className="sentence-builder" aria-label="sentence builder">
        <div className="sentence-answer" aria-live="polite">{tokens.length ? tokens.map(({ token, index }) => <button type="button" key={`${token}-${index}`} disabled={Boolean(result)} onClick={() => setTokens((current) => current.filter((item) => item.index !== index))}>{token}</button>) : <span>এখানে বাক্যটি তৈরি হবে</span>}</div>
        <div className="sentence-token-bank">{question.tokens.map((token, index) => tokens.some((item) => item.index === index) ? null : <button type="button" key={`${token}-${index}`} disabled={Boolean(result)} onClick={() => setTokens((current) => [...current, { token, index }])}>{token}</button>)}</div>
      </div>}

      {!result ? <Button className="answer-submit" disabled={!canSubmit || saving} onClick={() => void submit()}>{saving ? "সংরক্ষণ হচ্ছে…" : "উত্তর যাচাই করো"}</Button> : <div className={cn("answer-feedback", result.isCorrect ? "feedback-correct" : "feedback-wrong")} role="status">
        <div className="feedback-icon">{result.isCorrect ? <Sparkles size={18} /> : <RotateCcw size={18} />}</div>
        <div><strong>{result.isCorrect ? "ঠিক পথেই আছো" : "আবার চেষ্টা করা যায়"}</strong><p>{result.explanation}{!result.isCorrect && <><br />সঠিক উত্তর: <b>{result.correctAnswer}</b></>}</p></div>
        {!result.isCorrect && <Button variant="ghost" size="sm" onClick={reset}>আবার দাও</Button>}
      </div>}
    </section>
  );
}
