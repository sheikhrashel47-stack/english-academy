/** Design reminder — Emerald Study House: developer tools use the same calm paper record style, with explicit licence safeguards. */
import { FileUp, ShieldCheck, TriangleAlert } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { learningUseCases } from "@/application/usecases/LearningUseCases";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";

type Snapshot = { vocabulary: number; grammar: number };

export default function ContentAdminPage() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null); const [report, setReport] = useState<string | null>(null); const isDev = import.meta.env.DEV;
  const refresh = () => { void Promise.all([learningUseCases.searchVocabulary({ pageSize: 1 }), learningUseCases.getGrammarConcepts({ pageSize: 1 })]).then(([vocabulary, grammar]) => setSnapshot({ vocabulary: vocabulary.total, grammar: grammar.total })); };
  useEffect(refresh, []);
  const importFile = async (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file) return; try { const payload = JSON.parse(await file.text()); const imported = await learningUseCases.importVocabularyBatch(payload); setReport(`Imported ${imported.imported}; duplicate ${imported.duplicates}; invalid ${imported.invalid}; unlicensed ${imported.unlicensed}.`); toast.success("Import report created হয়েছে।"); refresh(); } catch { setReport("Import হয়নি। শুধু valid JSON package ব্যবহার করো এবং source/license metadata দাও।"); toast.error("Content package parse করা যায়নি।"); } finally { event.target.value = ""; } };
  if (!isDev) return <AppShell eyebrow="Content controls" title="Developer preview"><section className="skill-placeholder paper-card"><ShieldCheck size={24} /><h2>Developer preview only</h2><p>Production learner experience-এ corpus administration প্রকাশ করা হয় না।</p></section></AppShell>;
  return <AppShell eyebrow="Developer preview" title="Corpus control desk"><section className="content-admin-hero paper-card"><div><p className="card-kicker"><ShieldCheck size={15} /> Licence-first import gate</p><h2>Corpus import-এর আগে<br /><em>provenance দেখো।</em></h2><p>Source, licence এবং commercial-use permission ছাড়া কোনো vocabulary বা sentence record persist হবে না।</p></div><div className="content-admin-stats"><strong>{snapshot?.vocabulary ?? "—"}</strong><span>vocabulary records</span><strong>{snapshot?.grammar ?? "—"}</strong><span>grammar concepts</span></div></section><section className="content-admin-grid"><article className="paper-card"><header><FileUp size={18} /><div><p className="card-kicker">JSON package</p><h2>Vocabulary import preview</h2></div></header><p>JSON package-এ <code>sources</code> ও <code>vocabulary</code> array থাকতে হবে। Importer license gate, normalization ও duplicate check চালাবে।</p><label className="content-file-input"><input type="file" accept="application/json,.json" onChange={(event) => void importFile(event)} />Choose licensed JSON package</label>{report ? <output className="content-import-report">{report}</output> : null}</article><article className="paper-card content-admin-guardrail"><TriangleAlert size={18} /><h2>Before importing a large corpus</h2><p>Chunked import ব্যবহার করো, stable source ID রাখো, এবং প্রতিটি sentence-এর licence metadata যাচাই করো। This preview does not download or generate external datasets.</p><Button type="button" variant="outline" onClick={refresh}>Refresh local counts</Button></article></section></AppShell>;
}
