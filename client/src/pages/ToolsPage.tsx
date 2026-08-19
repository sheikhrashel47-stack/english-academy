/**
 * Design reminder — “Emerald Study House”: tools are an organised support layer.
 * Planned AI capabilities are stated honestly and always point to an available path.
 */
import { ArrowRight, BookOpen, BookOpenCheck, BrainCircuit, MessagesSquare, Mic, PenLine, RotateCcw, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { AppShell, PhaseZeroNotice } from "@/components/app/AppShell";

type Tool = { title: string; description: string; icon: typeof Sparkles; action: string; href?: string; status?: "available" | "planned" };

const languageTools: Tool[] = [
  { title: "Vocabulary Library", description: "শব্দ খোঁজো, অর্থ দেখো এবং flashcard review করো।", icon: BookOpen, action: "Vocabulary খুলুন", href: "/vocabulary", status: "available" },
  { title: "Grammar Library", description: "ছোট ধারণা, উদাহরণ ও lesson-linked practice।", icon: BookOpenCheck, action: "Grammar খুলুন", href: "/grammar", status: "available" },
  { title: "Smart Review", description: "যে শব্দ বা প্রশ্নের review সময় হয়েছে, সেখান থেকে শুরু করো।", icon: RotateCcw, action: "Review শুরু করো", href: "/review", status: "available" },
  { title: "Listening Lab", description: "Browser voice দিয়ে short listening sample ও check question।", icon: Mic, action: "Listening খুলো", href: "/listening", status: "available" },
  { title: "Writing Desk", description: "Prompt, word count এবং locally saved writing draft।", icon: PenLine, action: "Writing খুলো", href: "/writing", status: "available" },
  { title: "Roleplay Lab", description: "বাস্তব কথোপকথনের scenario-based browser recording practice।", icon: MessagesSquare, action: "Roleplay খুলুন", href: "/roleplay", status: "available" },
  { title: "Pronunciation Lab", description: "Sound, stress এবং guided browser recording sample।", icon: Mic, action: "Pronunciation খুলো", href: "/pronunciation", status: "available" },
];

const futureTools: Tool[] = [
  { title: "AI Coach", description: "Future conversation ও writing support-এর জন্য transparent interface foundation।", icon: Sparkles, action: "Coach interface", href: "/ai", status: "planned" },
];

function ToolCard({ tool }: { tool: Tool }) {
  const [, setLocation] = useLocation();
  const Icon = tool.icon;
  return <article className="academy-tools-card"><div className="academy-tools-card-header"><span className="academy-icon-tile"><Icon size={19} /></span><span className={tool.status === "available" ? "academy-status academy-status-live" : "academy-status"}>{tool.status === "available" ? "Available" : "Coming next"}</span></div><h2>{tool.title}</h2><p>{tool.description}</p><button type="button" onClick={() => tool.href && setLocation(tool.href)} disabled={!tool.href}>{tool.action} <ArrowRight size={15} /></button></article>;
}

export default function ToolsPage() {
  return <AppShell eyebrow="Tools" title="তোমার study toolkit">
    <section className="academy-tools-hero paper-card"><div><p className="card-kicker">Right tool, right moment</p><h2>শেখার জন্য যা দরকার,<br /><em>এক জায়গায়।</em></h2><p>আজ যে skill-টি practise করতে চাও, সেটি বেছে নাও। ভবিষ্যতের AI ও skill labs-ও এই একই toolkit-এর অংশ হবে।</p></div><span className="academy-tools-hero-mark"><BrainCircuit size={38} /></span></section>
    <section className="academy-tools-section" aria-labelledby="available-tools"><div className="academy-section-heading"><div><p className="card-kicker">Available now</p><h2 className="section-title" id="available-tools">ভিত্তি শক্ত করার tools</h2></div></div><div className="academy-tools-grid">{languageTools.map((tool) => <ToolCard key={tool.title} tool={tool} />)}</div></section>
    <section className="academy-tools-section" aria-labelledby="future-tools"><div className="academy-section-heading"><div><p className="card-kicker">Planned experience</p><h2 className="section-title" id="future-tools">পরবর্তী learning labs</h2></div><span className="academy-section-note">এই cards-গুলো feature promise নয়; পরের phase-এর UI destination।</span></div><div className="academy-tools-grid">{futureTools.map((tool) => <ToolCard key={tool.title} tool={tool} />)}</div></section>
    <PhaseZeroNotice />
  </AppShell>;
}
