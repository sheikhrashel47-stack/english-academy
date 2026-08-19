/**
 * Design reminder — “Emerald Study House”: certificates are restrained local learning
 * records, designed as a calm printable ledger rather than an official credential.
 */
import { useEffect, useMemo, useState } from "react";
import { Award, BadgeCheck, CircleAlert, Copy, FileCheck2, FileText, Loader2, Printer, QrCode, ShieldCheck } from "lucide-react";
import { useLocation } from "wouter";
import { learningUseCases } from "@/application/usecases/LearningUseCases";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AssessmentBlueprint, AssessmentResult, EducationalCertificate } from "@/domain/learning/types";

type CertificateEligibility = Awaited<ReturnType<typeof learningUseCases.getCertificateEligibility>>[number];
type CompletionBadge = Awaited<ReturnType<typeof learningUseCases.getCompletionBadges>>[number];

const formatDate = (date: string) => new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });

export default function CertificatesPage() {
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<EducationalCertificate[]>([]);
  const [eligible, setEligible] = useState<CertificateEligibility[]>([]);
  const [badges, setBadges] = useState<CompletionBadge[]>([]);
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [blueprints, setBlueprints] = useState<AssessmentBlueprint[]>([]);
  const [learnerName, setLearnerName] = useState("");
  const [selectedNumber, setSelectedNumber] = useState<string>();
  const [savingResultId, setSavingResultId] = useState<string>();
  const [error, setError] = useState<string>();

  const refresh = async () => {
    const [nextCertificates, nextEligible, nextBadges, nextResults, nextBlueprints] = await Promise.all([
      learningUseCases.getEducationalCertificates(), learningUseCases.getCertificateEligibility(), learningUseCases.getCompletionBadges(), learningUseCases.getAssessmentResults(), learningUseCases.getAssessmentBlueprints(),
    ]);
    setCertificates(nextCertificates); setEligible(nextEligible); setBadges(nextBadges); setResults(nextResults); setBlueprints(nextBlueprints);
    setSelectedNumber((current) => current ?? nextCertificates[0]?.certificateNumber);
  };

  useEffect(() => {
    let live = true;
    void refresh().catch((reason: unknown) => { if (live) setError(reason instanceof Error ? reason.message : "Local certificate record প্রস্তুত করা যায়নি।"); }).finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, []);

  const blueprintById = useMemo(() => new Map(blueprints.map((blueprint) => [blueprint.id, blueprint])), [blueprints]);
  const certificateByResult = useMemo(() => new Map(certificates.filter((certificate) => certificate.assessmentResultId).map((certificate) => [certificate.assessmentResultId!, certificate])), [certificates]);
  const selectedCertificate = certificates.find((certificate) => certificate.certificateNumber === selectedNumber) ?? certificates[0];
  const pendingManualReview = results.filter((result) => result.passed && (result.assessmentType === "level" || result.assessmentType === "final") && (result.reviewStatus !== "scored" || result.manualReviewQuestionIds.length > 0));

  const generateCertificate = async (resultId: string) => {
    if (!learnerName.trim()) { setError("Certificate-এ দেখানোর জন্য তোমার নাম লিখো। নামটি শুধু এই device-এ থাকবে।"); return; }
    setError(undefined); setSavingResultId(resultId);
    try {
      const certificate = await learningUseCases.createEducationalCertificate({ assessmentResultId: resultId, learnerName: learnerName.trim() });
      await learningUseCases.applyPersonalLearningEvent({ eventKey: `certificate-issued:${certificate.certificateNumber}`, type: "certificate-issued", occurredAt: certificate.issuedAt, relatedContentId: certificate.assessmentResultId, metadata: { certificateNumber: certificate.certificateNumber, level: certificate.level ?? "unspecified" } }).catch(() => undefined);
      await refresh(); setSelectedNumber(certificate.certificateNumber);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Certificate তৈরি করা যায়নি। আবার চেষ্টা করো।");
    } finally { setSavingResultId(undefined); }
  };

  const copyPayload = async () => {
    if (!selectedCertificate) return;
    try { await navigator.clipboard.writeText(selectedCertificate.verificationPayload); } catch { setError("এই browser-এ payload copy করা যায়নি। নিচের textটি নিজে copy করতে পারো।"); }
  };

  if (loading) return <AppShell eyebrow="Local completion records" title="Certificate desk"><div className="assessment-state"><Loader2 className="animate-spin" />Local completion evidence পড়া হচ্ছে…</div></AppShell>;

  return <AppShell eyebrow="Local completion records" title="Certificates & badges">
    <section className="certificate-hero paper-card"><div><span className="eyebrow">Offline-first · local educational record</span><h2>তোমার সম্পন্ন শেখার <em>সংরক্ষিত প্রমাণ</em></h2><p>এখানে কেবল fully-scored, passed level বা final assessment থেকে completion badge ও offline certificate তৈরি হয়। এটি official CEFR, সরকারী বা accredited certification নয়।</p></div><div className="certificate-hero-stamp"><Award size={22} /><strong>{certificates.length}</strong><span>offline certificate</span><small>{badges.length} completion badge</small></div></section>

    {error && <section className="certificate-alert certificate-alert-error" role="alert"><CircleAlert size={18} /><span>{error}</span></section>}

    <section className="certificate-page-grid">
      <div className="certificate-main-column">
        <article className="paper-card certificate-eligibility"><header><div><span className="card-kicker"><FileCheck2 size={15} />Certificate eligibility</span><h2>Ready completion records</h2></div><BadgeCheck size={22} /></header><p className="certificate-section-note">নামটি certificate-এ বসবে এবং browser-এর local database-এ থাকবে। QR-ready payload-এ নাম, user ID বা assessment result ID রাখা হয় না।</p><label className="certificate-name-field"><span>Certificate-এ তোমার নাম</span><Input value={learnerName} onChange={(event) => setLearnerName(event.target.value)} placeholder="তোমার নাম লিখো" maxLength={80} autoComplete="name" /></label>
          {eligible.length ? <div className="certificate-eligibility-list">{eligible.map((item) => { const existing = certificateByResult.get(item.result.id); const blueprint = blueprintById.get(item.result.blueprintId); return <article key={item.result.id} className="certificate-eligibility-row"><div><strong>{item.level} · {blueprint?.banglaTitle ?? "Completion assessment"}</strong><small>{item.result.score}% · {formatDate(item.result.completedAt)} · fully scored</small></div>{existing ? <Button variant="outline" onClick={() => setSelectedNumber(existing.certificateNumber)}>Certificate দেখো</Button> : <Button onClick={() => void generateCertificate(item.result.id)} disabled={savingResultId === item.result.id}>{savingResultId === item.result.id ? <Loader2 className="animate-spin" /> : <Award size={16} />}{savingResultId === item.result.id ? "তৈরি হচ্ছে" : "Offline certificate তৈরি"}</Button>}</article>; })}</div> : <div className="certificate-empty"><FileText size={22} /><div><strong>এখনো certificate-এর জন্য fully-scored completion result নেই</strong><p>Level বা final assessment-এ pass করার পর, manual-review item না থাকলে এখানে certificate তৈরি করা যাবে।</p><small>Local status · no eligible completion record yet</small></div><Button variant="outline" onClick={() => navigate("/exams")}>Assessment hub</Button></div>}</article>

        {pendingManualReview.length > 0 && <aside className="certificate-alert"><CircleAlert size={18} /><span>{pendingManualReview.length}টি passed assessment-এ manual review বাকি আছে। ভুলভাবে completion certificate দাবি না করতে সেগুলোতে certificate এখনও তৈরি হবে না।</span></aside>}

        <article className="paper-card completion-badges"><header><div><span className="card-kicker"><BadgeCheck size={15} />Evidence-based badges</span><h2>Completion badges</h2></div><span>{badges.length} earned</span></header>{badges.length ? <div className="badge-shelf">{badges.map((badge) => <article key={badge.id} className="completion-badge"><BadgeCheck size={22} /><div><strong>{badge.title}</strong><small>{badge.banglaTitle} · {formatDate(badge.earnedAt)}</small></div></article>)}</div> : <p className="certificate-section-note">Badge hard-code করা নয়—fully-scored, passed level/final result তৈরি হলে এটি নিজে থেকেই দেখা যাবে।</p>}</article>
      </div>

      <aside className="certificate-side-column">
        <article className="paper-card certificate-library"><header><div><span className="card-kicker"><Award size={15} />Local certificate library</span><h2>Stored artifacts</h2></div><span>{certificates.length}</span></header>{certificates.length ? <div>{certificates.map((certificate) => <button type="button" className={selectedCertificate?.certificateNumber === certificate.certificateNumber ? "certificate-library-item active" : "certificate-library-item"} key={certificate.certificateNumber} onClick={() => setSelectedNumber(certificate.certificateNumber)}><strong>{certificate.level ?? "Course"} record</strong><small>{certificate.learnerName} · {formatDate(certificate.issuedAt)}</small></button>)}</div> : <p className="certificate-section-note">Eligible completion record থেকে তৈরি artifact এখানে offline-এ থাকবে। Settings-এর backup export ব্যবহার করলে সেটিও সঙ্গে রাখা যায়।</p>}</article>
        <article className="paper-card certificate-safety-note"><ShieldCheck size={22} /><h2>Privacy & scope</h2><p>কোনো result, learner name বা certificate এই browser থেকে স্বয়ংক্রিয়ভাবে পাঠানো হয় না। Verification payload শুধু local educational record-এর সীমিত identifier বহন করে; online verifier চালু নেই।</p></article>
      </aside>
    </section>

    {selectedCertificate && <section className="certificate-artifact-wrap"><article className="certificate-artifact" aria-label={`Offline certificate ${selectedCertificate.certificateNumber}`}><header><div className="certificate-crest"><Award size={31} /></div><div><span>ENGLISH ACADEMY</span><strong>Offline Certificate</strong><small>Local Educational Record · Not an official CEFR certificate</small></div><b>LOCAL<br />ONLY</b></header><div className="certificate-artifact-body"><p>This is to record that</p><h2>{selectedCertificate.learnerName}</h2><p>has completed the configured learning rule for</p><h3>{selectedCertificate.level ?? "English Academy"} completion evidence</h3><p className="certificate-statement">{selectedCertificate.statement}</p><dl><div><dt>Issued</dt><dd>{formatDate(selectedCertificate.issuedAt)}</dd></div><div><dt>Record number</dt><dd>{selectedCertificate.certificateNumber}</dd></div><div><dt>Status</dt><dd>Local educational record</dd></div></dl></div><footer><div className="certificate-payload"><QrCode size={26} /><div><span>Privacy-safe QR-ready payload</span><code>{selectedCertificate.verificationPayload}</code></div></div><div className="certificate-signature"><span>English Academy</span><small>Offline learning workspace</small></div></footer></article><div className="certificate-artifact-actions"><p><ShieldCheck size={16} />এই artifact browser-এর print dialog থেকে PDF হিসেবে save করা যায়। Online verification service না থাকায় এটি <strong>Offline Certificate</strong> হিসেবে চিহ্নিত।</p><div><Button variant="outline" onClick={() => void copyPayload()}><Copy size={16} />Payload copy</Button><Button onClick={() => window.print()}><Printer size={16} />Print / Save PDF</Button></div></div></section>}
  </AppShell>;
}
