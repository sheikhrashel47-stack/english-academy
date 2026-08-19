/** Emerald Study House assessment runner: calm, local-first, evidence-only exam workspace. */
import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowLeft, ArrowRight, BookmarkCheck, CheckCircle2, Clock3, Flag, Loader2, Send, ShieldCheck, TimerReset } from "lucide-react";
import { learningUseCases } from "@/application/usecases/LearningUseCases";
import { scoreAssessment, selectAssessmentQuestions, type SelectedAssessmentQuestion } from "@/domain/learning/assessmentEngine";
import type { AssessmentAnswer, AssessmentBlueprint, AssessmentQuestion, AssessmentResult, AssessmentSession } from "@/domain/learning/types";
import { Button } from "@/components/ui/button";

type RunnerState = "loading" | "ready" | "submitting" | "error";
type Props = { blueprint: AssessmentBlueprint; onFinished?: (result: AssessmentResult) => void };

const durationLabel = (seconds?: number) => {
  if (seconds === undefined) return "সময় সীমা নেই";
  const safe = Math.max(0, seconds);
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
};

const answerText = (answer?: AssessmentAnswer) => answer?.selectedOptionId ?? answer?.response ?? "";

export function AssessmentRunner({ blueprint, onFinished }: Props) {
  const [state, setState] = useState<RunnerState>("loading");
  const [message, setMessage] = useState<string>();
  const [session, setSession] = useState<AssessmentSession>();
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [selections, setSelections] = useState<SelectedAssessmentQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, AssessmentAnswer>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number>();
  const [result, setResult] = useState<AssessmentResult>();

  const orderedQuestionIds = useMemo(() => selections.map((item) => item.questionId), [selections]);
  const currentQuestion = questions[currentIndex];
  const currentSelection = selections[currentIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const submitted = Boolean(result) || session?.sessionStatus === "submitted" || session?.sessionStatus === "expired";

  useEffect(() => {
    let active = true;
    const load = async () => {
      setState("loading"); setMessage(undefined); setResult(undefined);
      try {
        const [available, resumable, history] = await Promise.all([
          learningUseCases.getAssessmentQuestions({ assessmentType: blueprint.assessmentType, approvedOnly: true }),
          learningUseCases.getResumableAssessmentSession(blueprint.id),
          learningUseCases.getAssessmentResults(),
        ]);
        if (!active) return;
        const selection = selectAssessmentQuestions(blueprint, available, blueprint.id);
        const selectedIds = resumable?.questionIds ?? selection.selections.map((item) => item.questionId);
        const selected = resumable
          ? selectedIds.map((questionId, order) => ({ questionId, sectionId: selection.selections.find((item) => item.questionId === questionId)?.sectionId ?? blueprint.sections[0]?.id ?? "section", order }))
          : selection.selections;
        const selectedQuestions = selected.map((item) => available.find((question) => question.id === item.questionId)).filter(Boolean) as AssessmentQuestion[];
        if (!selectedQuestions.length) throw new Error("এই assessment-এর জন্য এখনো approved প্রশ্ন পাওয়া যায়নি।");
        const nextSession = resumable
          ? await learningUseCases.saveAssessmentSession(resumable, { resumedCount: resumable.resumedCount + 1 })
          : await learningUseCases.createAssessmentSession({ blueprint, questionIds: selected.map((item) => item.questionId), sectionOrder: blueprint.sections.map((section) => section.id), remainingSeconds: blueprint.durationMinutes ? blueprint.durationMinutes * 60 : undefined });
        const savedAnswers = await learningUseCases.getAssessmentAnswers(nextSession.id);
        if (!active) return;
        setQuestions(selectedQuestions); setSelections(selected); setSession(nextSession); setCurrentIndex(Math.min(nextSession.currentQuestionIndex, Math.max(0, selectedQuestions.length - 1))); setRemainingSeconds(nextSession.remainingSeconds); setAnswers(Object.fromEntries(savedAnswers.map((answer) => [answer.questionId, answer])));
        const previousResult = history.find((item) => item.sessionId === nextSession.id);
        if (previousResult) setResult(previousResult);
        if (selection.warnings.length) setMessage("Starter catalogue-এর কারণে কিছু section-এ প্রশ্ন কম পাওয়া গেছে; unavailable item ফলাফলে ধরা হবে না।");
        setState("ready");
      } catch (error) { if (active) { setState("error"); setMessage(error instanceof Error ? error.message : "Assessment শুরু করা যায়নি।"); } }
    };
    void load();
    return () => { active = false; };
  }, [blueprint]);

  useEffect(() => {
    if (!session || submitted || remainingSeconds === undefined) return;
    if (remainingSeconds <= 0) return;
    const timer = window.setInterval(() => setRemainingSeconds((current) => current === undefined ? current : Math.max(0, current - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [remainingSeconds, session, submitted]);

  const persistSession = useCallback(async (patch: Partial<Pick<AssessmentSession, "currentQuestionIndex" | "remainingSeconds" | "sessionStatus" | "submittedAt">> = {}) => {
    if (!session) return;
    const saved = await learningUseCases.saveAssessmentSession(session, { currentQuestionIndex: currentIndex, remainingSeconds, ...patch });
    setSession(saved);
  }, [currentIndex, remainingSeconds, session]);

  useEffect(() => {
    if (!session || submitted) return;
    const autosave = window.setTimeout(() => { void persistSession(); }, 850);
    return () => window.clearTimeout(autosave);
  }, [currentIndex, persistSession, remainingSeconds, session, submitted]);

  const saveResponse = async (patch: Pick<AssessmentAnswer, "response" | "selectedOptionId" | "matchingResponse">) => {
    if (!session || !currentQuestion || !currentSelection || submitted) return;
    const next = await learningUseCases.saveAssessmentAnswer({ sessionId: session.id, questionId: currentQuestion.id, sectionId: currentSelection.sectionId, response: patch.response ?? currentAnswer?.response, selectedOptionId: patch.selectedOptionId ?? currentAnswer?.selectedOptionId, matchingResponse: patch.matchingResponse ?? currentAnswer?.matchingResponse, markedForReview: currentAnswer?.markedForReview ?? false, answeredAt: Object.values(patch).some(Boolean) ? new Date().toISOString() : currentAnswer?.answeredAt, reviewStatus: "not-applicable" });
    setAnswers((current) => ({ ...current, [currentQuestion.id]: next }));
  };

  const toggleReview = async () => {
    if (!session || !currentQuestion || !currentSelection || submitted) return;
    const next = await learningUseCases.saveAssessmentAnswer({ sessionId: session.id, questionId: currentQuestion.id, sectionId: currentSelection.sectionId, response: currentAnswer?.response, selectedOptionId: currentAnswer?.selectedOptionId, matchingResponse: currentAnswer?.matchingResponse, markedForReview: !currentAnswer?.markedForReview, answeredAt: currentAnswer?.answeredAt, reviewStatus: "not-applicable" });
    setAnswers((current) => ({ ...current, [currentQuestion.id]: next }));
  };

  const finish = useCallback(async (expired = false) => {
    if (!session || !questions.length || submitted || state === "submitting") return;
    setState("submitting");
    try {
      const score = scoreAssessment(blueprint, selections, questions, selections.map((selection) => ({ ...answers[selection.questionId], questionId: selection.questionId, sectionId: selection.sectionId, answered: Boolean(answerText(answers[selection.questionId])) })));
      await Promise.all(score.answers.map((scored) => learningUseCases.saveAssessmentAnswer({ sessionId: session.id, questionId: scored.questionId, sectionId: scored.sectionId, response: answers[scored.questionId]?.response, selectedOptionId: answers[scored.questionId]?.selectedOptionId, matchingResponse: answers[scored.questionId]?.matchingResponse, markedForReview: answers[scored.questionId]?.markedForReview ?? false, answeredAt: answers[scored.questionId]?.answeredAt, score: scored.earnedPoints, isCorrect: scored.isCorrect, reviewStatus: scored.reviewStatus })));
      const resultRecord = await learningUseCases.saveAssessmentResult({ sessionId: session.id, blueprintId: blueprint.id, assessmentType: blueprint.assessmentType, level: blueprint.level, completedAt: new Date().toISOString(), score: score.score, earnedPoints: score.earnedPoints, totalPoints: score.totalPoints, passed: score.passed, estimatedLevel: blueprint.assessmentType === "diagnostic" ? (score.score >= 80 ? "A2" : score.score >= 60 ? "A1" : "Pre-A1") : undefined, sectionScores: score.sectionScores.map((section) => ({ ...section, skill: blueprint.sections.find((item) => item.id === section.sectionId)?.skill ?? "grammar" })), reviewStatus: score.reviewStatus, manualReviewQuestionIds: score.manualReviewQuestionIds, wrongQuestionIds: score.wrongQuestionIds, correctQuestionIds: score.correctQuestionIds });
      if (resultRecord.passed) await learningUseCases.applyPersonalLearningEvent({ eventKey: `assessment-passed:${resultRecord.id}`, type: "assessment-passed", occurredAt: resultRecord.completedAt, relatedContentId: resultRecord.id, minutes: blueprint.durationMinutes, metadata: { blueprintId: blueprint.id, assessmentType: blueprint.assessmentType, score: resultRecord.score } }).catch(() => undefined);
      setResult(resultRecord); setRemainingSeconds(0); await persistSession({ sessionStatus: expired ? "expired" : "submitted", submittedAt: resultRecord.completedAt, remainingSeconds: 0 }); setState("ready"); onFinished?.(resultRecord);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Result তৈরি করা যায়নি।"); setState("ready"); }
  }, [answers, blueprint, onFinished, persistSession, questions, selections, session, state, submitted]);

  useEffect(() => { if (session && remainingSeconds === 0 && !submitted) void finish(true); }, [finish, remainingSeconds, session, submitted]);

  if (state === "loading") return <div className="assessment-state"><Loader2 className="animate-spin" /> স্থানীয় assessment প্রস্তুত হচ্ছে…</div>;
  if (state === "error" || !session || !currentQuestion) return <div className="assessment-state assessment-state-error"><AlertCircle /> {message ?? "Assessment পাওয়া যায়নি।"}</div>;
  if (result) return <AssessmentResultPanel blueprint={blueprint} result={result} />;

  const section = blueprint.sections.find((item) => item.id === currentSelection?.sectionId);
  const answeredCount = orderedQuestionIds.filter((id) => Boolean(answerText(answers[id]))).length;
  return <section className="assessment-runner">
    <header className="assessment-runner-head"><div><span className="eyebrow">Offline assessment desk</span><h2>{blueprint.banglaTitle}</h2><p>{blueprint.title} · উত্তরটি এই ডিভাইসেই স্বয়ংক্রিয়ভাবে সংরক্ষিত হয়।</p></div><div className="assessment-timer"><Clock3 size={17} /><strong>{durationLabel(remainingSeconds)}</strong><span>{blueprint.durationMinutes ? "অবশিষ্ট সময়" : "নিজের গতিতে"}</span></div></header>
    {message && <p className="assessment-note"><ShieldCheck size={16} />{message}</p>}
    <div className="assessment-progress-line"><span>{answeredCount}/{questions.length} answered</span><span>{section?.banglaTitle ?? section?.title}</span></div>
    <div className="assessment-question-shell"><aside className="assessment-navigator" aria-label="Question navigator">{questions.map((question, index) => <button key={question.id} type="button" onClick={() => setCurrentIndex(index)} className={`${index === currentIndex ? "active" : ""} ${answerText(answers[question.id]) ? "answered" : ""} ${answers[question.id]?.markedForReview ? "review" : ""}`}>{index + 1}</button>)}</aside>
      <main className="assessment-question"><span className="question-kicker">Question {currentIndex + 1} of {questions.length} · {currentQuestion.skill}</span><h3>{currentQuestion.prompt}</h3>{currentQuestion.banglaPrompt && <p className="bangla-instruction">{currentQuestion.banglaPrompt}</p>}{currentQuestion.instructions && <p className="assessment-instructions">{currentQuestion.instructions}</p>}
        {currentQuestion.options && <div className="assessment-options">{currentQuestion.options.map((option, optionIndex) => <button type="button" key={option.id} onClick={() => void saveResponse({ selectedOptionId: option.id })} className={currentAnswer?.selectedOptionId === option.id ? "selected" : ""}><span>{String.fromCharCode(65 + optionIndex)}</span>{option.text}</button>)}</div>}
        {currentQuestion.type === "fill-blank" && <input aria-label="Answer" className="assessment-text-input" value={currentAnswer?.response ?? ""} onChange={(event) => void saveResponse({ response: event.target.value })} placeholder="Write your answer" />}
        {["short-writing", "spoken-response"].includes(currentQuestion.type) && <div className="assessment-subjective"><textarea value={currentAnswer?.response ?? ""} onChange={(event) => void saveResponse({ response: event.target.value })} placeholder={currentQuestion.type === "spoken-response" ? "নিজের recording/self-review note এখানে লিখতে পারো" : "তোমার উত্তর লেখো"} rows={6} /><p><AlertCircle size={15} />এই উত্তরটি স্থানীয়ভাবে সংরক্ষিত থাকবে এবং manual review হিসেবে চিহ্নিত হবে; কোনো কাল্পনিক score দেওয়া হবে না।</p></div>}
        <div className="assessment-actions"><Button type="button" variant="outline" onClick={() => void toggleReview()}><Flag size={16} />{currentAnswer?.markedForReview ? "Review চিহ্ন সরাও" : "Review-তে রাখো"}</Button><div><Button type="button" variant="outline" disabled={currentIndex === 0} onClick={() => setCurrentIndex((index) => index - 1)}><ArrowLeft size={16} />আগেরটি</Button>{currentIndex < questions.length - 1 ? <Button type="button" onClick={() => setCurrentIndex((index) => index + 1)}>পরেরটি<ArrowRight size={16} /></Button> : <Button type="button" onClick={() => void finish()} disabled={state === "submitting"}><Send size={16} />{state === "submitting" ? "Submit হচ্ছে…" : "Submit assessment"}</Button>}</div></div>
      </main></div>
  </section>;
}

export function AssessmentResultPanel({ blueprint, result }: { blueprint: AssessmentBlueprint; result: AssessmentResult }) {
  return <section className="assessment-result"><div className={result.passed ? "result-medallion passed" : "result-medallion"}>{result.passed ? <CheckCircle2 /> : <TimerReset />}<span>{result.score}%</span></div><div><span className="eyebrow">Assessment result</span><h2>{result.passed ? "ভিত্তি শক্ত হয়েছে" : "এখান থেকেই recovery শুরু"}</h2><p>{result.passed ? "এই educational result স্থানীয় learning record-এ রাখা হয়েছে।" : "এটি official certification নয়; ভুলগুলো দেখে আবার অনুশীলন করো।"}</p><div className="result-stat-row"><span>{result.earnedPoints}/{result.totalPoints} points</span><span>{result.manualReviewQuestionIds.length} manual review</span><span>{result.wrongQuestionIds.length} review items</span></div></div><div className="result-sections">{result.sectionScores.map((section) => <div key={section.sectionId}><strong>{section.skill}</strong><span>{section.score}%</span></div>)}</div></section>;
}
