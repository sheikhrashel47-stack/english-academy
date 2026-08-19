/**
 * Design reminder — “Emerald Study House”: navigation is grouped, calm and
 * purposeful. The current learning task is always more prominent than tools.
 */
import { Link, useLocation } from "wouter";
import {
  BookOpen,
  BookMarked,
  ChartNoAxesCombined,
  ChevronRight,
  CircleHelp,
  LibraryBig,
  ListChecks,
  RotateCcw,
  Menu,
  Settings,
  Sparkles,
  Ear,
  ClipboardCheck,
  Mic2,
  PenLine,
  Search,
  Wrench,
  House,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type AppShellProps = {
  children: React.ReactNode;
  title?: string;
  eyebrow?: string;
};

type NavigationItem = { href: string; label: string; icon: typeof House };
type NavigationGroup = { label: string; items: NavigationItem[] };

const navigationGroups: NavigationGroup[] = [
  { label: "মূল পথ", items: [{ href: "/dashboard", label: "Home", icon: House }] },
  {
    label: "শেখা",
    items: [
      { href: "/course/course-english-foundations", label: "Study plan", icon: LibraryBig },
      { href: "/practice", label: "Practice", icon: ListChecks },
    ],
  },
  {
    label: "Skills & Review",
    items: [
      { href: "/vocabulary", label: "Vocabulary", icon: BookOpen },
      { href: "/grammar", label: "Grammar", icon: BookMarked },
      { href: "/listening", label: "Listening", icon: Ear },
      { href: "/audio", label: "Offline audio", icon: Ear },
      { href: "/speaking", label: "Speaking", icon: Mic2 },
      { href: "/writing", label: "Writing", icon: PenLine },
      { href: "/mistakes", label: "Mistake Bank", icon: RotateCcw },
    ],
  },
  {
    label: "অগ্রগতি",
    items: [
      { href: "/progress", label: "Progress", icon: ChartNoAxesCombined },
      { href: "/diagnostic", label: "Diagnostic", icon: ClipboardCheck },
      { href: "/tools", label: "Tools", icon: Wrench },
    ],
  },
];

const mobileNavigation: NavigationItem[] = [
  { href: "/dashboard", label: "Home", icon: House },
  { href: "/course/course-english-foundations", label: "Learn", icon: LibraryBig },
  { href: "/practice", label: "Practice", icon: ListChecks },
  { href: "/tools", label: "AI", icon: Sparkles },
  { href: "/progress", label: "Progress", icon: ChartNoAxesCombined },
];

const quickDestinations = [
  { href: "/learn", label: "Study plan", hint: "Course, level and unit" },
  { href: "/practice/setup", label: "Practice setup", hint: "Questions and filters" },
  { href: "/vocabulary", label: "Vocabulary library", hint: "Word search and pronunciation" },
  { href: "/vocabulary/flashcards", label: "Flashcards", hint: "Local spaced review" },
  { href: "/grammar", label: "Grammar", hint: "Topics and examples" },
  { href: "/listening", label: "Listening Lab", hint: "Browser voice sample" },
  { href: "/audio", label: "Offline audio pack", hint: "Three downloadable pronunciation tracks" },
  { href: "/diagnostic", label: "Personal diagnostic", hint: "Level signal and study path" },
  { href: "/speaking", label: "Speaking Studio", hint: "Browser recording" },
  { href: "/writing", label: "Writing Desk", hint: "Saved local draft" },
  { href: "/review", label: "Review queue", hint: "Due local items" },
  { href: "/progress", label: "Progress", hint: "CEFR learning ledger" },
  { href: "/settings", label: "Settings", hint: "Language and accessibility" },
];

export function AppShell({ children, title, eyebrow }: AppShellProps) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const results = useMemo(() => quickDestinations.filter((item) => `${item.label} ${item.hint}`.toLowerCase().includes(query.toLowerCase())).slice(0, 6), [query]);
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setSearchOpen(true); }
      if (event.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const sidebar = (
    <aside className="app-sidebar">
      <Link href="/dashboard" className="brand-lockup" onClick={() => setOpen(false)}>
        <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663892230510/HDBugHwgvZZHpDdM.png" alt="English Academy" className="brand-mark" />
        <span className="brand-type">
          <strong>English Academy</strong>
          <em>ইংরেজি শেখার প্রতিষ্ঠান</em>
          <small>CEFR STUDY HOUSE</small>
        </span>
      </Link>

      <nav className="sidebar-nav" aria-label="প্রধান নেভিগেশন">
        {navigationGroups.map((group) => (
          <section className="nav-section" key={group.label} aria-label={group.label}>
            <p className="nav-section-label">{group.label}</p>
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = location === item.href || (item.href !== "/dashboard" && location.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={cn("nav-item", active && "nav-item-active")}>
                  <Icon size={18} strokeWidth={active ? 2.25 : 1.8} />
                  <span>{item.label}</span>
                  {active && <ChevronRight className="nav-chevron" size={15} />}
                </Link>
              );
            })}
          </section>
        ))}
      </nav>

      <div className="sidebar-footer">
        <Link href="/settings" className="nav-item" onClick={() => setOpen(false)}>
          <Settings size={18} strokeWidth={1.8} />
          <span>সেটিংস</span>
        </Link>
        <button type="button" className="support-link" onClick={() => window.alert("Phase 0 prototype: সহায়তা কেন্দ্র পরবর্তী ধাপে যুক্ত হবে।")}>
          <CircleHelp size={16} /> সহায়তা
        </button>
      </div>
    </aside>
  );

  return (
    <div className="app-frame">
      <div className="desktop-sidebar">{sidebar}</div>
      <div className={cn("mobile-overlay", open && "mobile-overlay-open")} onClick={() => setOpen(false)} />
      <div className={cn("mobile-sidebar", open && "mobile-sidebar-open")}>{sidebar}</div>

      <main className="app-main">
        <header className="app-topbar">
          <Button className="mobile-menu" variant="ghost" size="icon" onClick={() => setOpen((value) => !value)} aria-label="নেভিগেশন খুলুন">
            {open ? <X size={22} /> : <Menu size={22} />}
          </Button>
          <Link href="/dashboard" className="mobile-brand-lockup" aria-label="English Academy dashboard">
            <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663892230510/HDBugHwgvZZHpDdM.png" alt="" />
            <span>EA</span>
          </Link>
          <div className="page-heading" aria-live="polite">
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
            {title && <h1>{title}</h1>}
          </div>
          <div className="topbar-actions">
            <button type="button" className="global-search-trigger" onClick={() => setSearchOpen(true)} aria-label="Search study destinations"><Search size={16} /><span>Search</span><kbd>⌘K</kbd></button>
            <div className="streak-pill" aria-label="বর্তমান streak 3 দিন">
              <Sparkles size={15} /> <span>৩ দিনের ধারা</span>
            </div>
            <Link href="/settings" className="avatar-button" aria-label="প্রোফাইল ও সেটিংস">র</Link>
          </div>
        </header>

        <div className="content-stage"><div className="academy-focus-line" aria-hidden="true" />{children}</div>
        <nav className="mobile-bottom-nav" aria-label="দ্রুত নেভিগেশন">
          {mobileNavigation.map((item) => {
            const Icon = item.icon;
            const active = location === item.href || (item.href !== "/dashboard" && location.startsWith(item.href));
            return <Link key={item.href} href={item.href} className={cn("mobile-bottom-link", active && "mobile-bottom-link-active")}><Icon size={18} /><span>{item.label}</span></Link>;
          })}
        </nav>
      </main>
      {searchOpen && <div className="global-search-backdrop" role="presentation" onMouseDown={() => setSearchOpen(false)}><section className="global-search-dialog" role="dialog" aria-modal="true" aria-label="Study search" onMouseDown={(event) => event.stopPropagation()}><div><Search size={18} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search learning, practice, tools…" aria-label="Search learning destinations"/><kbd>Esc</kbd></div><ul>{results.map((item) => <li key={item.href}><Link href={item.href} onClick={() => { setSearchOpen(false); setQuery(""); }}><span><strong>{item.label}</strong><small>{item.hint}</small></span><ChevronRight size={16} /></Link></li>)}{results.length === 0 && <li className="global-search-empty">কোনো matching destination নেই</li>}</ul></section></div>}
    </div>
  );
}

export function PhaseZeroNotice() {
  return (
    <section className="phase-notice" aria-label="বর্তমান foundation-এর সীমা">
      <div className="phase-notice-icon"><Sparkles size={18} /></div>
      <p><strong>Offline-first learning foundation</strong> — structured lesson, practice, local review, browser audio/recording, writing draft এবং progress ব্যবহার করা যায়। AI feedback, cloud sync, full mock exams ও verified certificates এখনো চালু হয়নি।</p>
    </section>
  );
}
