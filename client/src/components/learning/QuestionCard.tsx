/**
 * Design reminder — “ভাষার মানচিত্র”: one question at a time, clear feedback in a margin note,
 * and terracotta only for the learner’s active decision.
 */
import { CheckCircle2, Circle, RotateCcw, Sparkles, XCircle } from "lucide-react";
import { useState } from "react";
import { learningUseCases } from "@/application/usecases/LearningUseCases";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Question } from "@/domain/learning/types";

export function QuestionCard({ question, onAnswered }: { question: Question; onAnswered?: (correct: boolean) => void }) {
  const [selected, setSelected] = useState<string>();
  const [result, setResult] = useState<{ isCorrect: boolean; explanation: string; correctOptionId: string }>();
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!selected || result) return;
    setSaving(true);
    try {
      const next = await learningUseCases.submitAnswer(question.id, selected);
      setResult(next);
      onAnswered?.(next.isCorrect);
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setSelected(undefined);
    setResult(undefined);
  };

  return (
    <section className="question-card" aria-labelledby={`question-${question.id}`}>
      <div className="question-meta"><span>Check point</span><span>{question.skill} · Level {question.difficulty}</span></div>
      <h3 id={`question-${question.id}`}>{question.prompt}</h3>
      {question.banglaPrompt && <p className="question-translation">{question.banglaPrompt}</p>}

      <div className="answer-options" role="radiogroup" aria-label={question.banglaPrompt || question.prompt}>
        {question.options.map((option, index) => {
          const isSelected = selected === option.id;
          const isCorrect = result && option.id === result.correctOptionId;
          const isWrong = result && isSelected && !result.isCorrect;
          return (
            <button
              type="button"
              key={option.id}
              role="radio"
              aria-checked={isSelected}
              disabled={Boolean(result)}
              onClick={() => setSelected(option.id)}
              className={cn("answer-option", isSelected && "answer-selected", isCorrect && "answer-correct", isWrong && "answer-wrong")}
            >
              <span className="answer-index">{String.fromCharCode(65 + index)}</span>
              <span>{option.text}</span>
              {isCorrect ? <CheckCircle2 size={18} /> : isWrong ? <XCircle size={18} /> : isSelected ? <Circle size={17} fill="currentColor" /> : null}
            </button>
          );
        })}
      </div>

      {!result ? (
        <Button className="answer-submit" disabled={!selected || saving} onClick={() => void submit()}>
          {saving ? "সংরক্ষণ হচ্ছে…" : "উত্তর যাচাই করো"}
        </Button>
      ) : (
        <div className={cn("answer-feedback", result.isCorrect ? "feedback-correct" : "feedback-wrong")} role="status">
          <div className="feedback-icon">{result.isCorrect ? <Sparkles size={18} /> : <RotateCcw size={18} />}</div>
          <div>
            <strong>{result.isCorrect ? "ঠিক পথেই আছো" : "আবার চেষ্টা করা যায়"}</strong>
            <p>{result.explanation}</p>
          </div>
          {!result.isCorrect && <Button variant="ghost" size="sm" onClick={reset}>আবার দাও</Button>}
        </div>
      )}
    </section>
  );
}
