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
  Wrench,
  House,
  X,
} from "lucide-react";
import { useState } from "react";
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
      { href: "/course/course-english-foundations", label: "Learning Map", icon: LibraryBig },
      { href: "/practice", label: "Practice", icon: ListChecks },
    ],
  },
  {
    label: "Skills & Review",
    items: [
      { href: "/vocabulary", label: "Vocabulary", icon: BookOpen },
      { href: "/grammar", label: "Grammar", icon: BookMarked },
      { href: "/mistakes", label: "Mistake Bank", icon: RotateCcw },
    ],
  },
  {
    label: "অগ্রগতি",
    items: [
      { href: "/progress", label: "Progress", icon: ChartNoAxesCombined },
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

export function AppShell({ children, title, eyebrow }: AppShellProps) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  const sidebar = (
    <aside className="app-sidebar">
      <Link href="/dashboard" className="brand-lockup" onClick={() => setOpen(false)}>
        <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663892230510/HDBugHwgvZZHpDdM.png" alt="English Academy" className="brand-mark" />
        <span className="brand-type">
          <strong>English</strong>
          <em>Academy</em>
          <small>Study workspace</small>
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
            <div className="streak-pill" aria-label="বর্তমান streak 3 দিন">
              <Sparkles size={15} /> <span>৩ দিনের ধারা</span>
            </div>
            <Link href="/settings" className="avatar-button" aria-label="প্রোফাইল ও সেটিংস">র</Link>
          </div>
        </header>

        <div className="content-stage">{children}</div>
        <nav className="mobile-bottom-nav" aria-label="দ্রুত নেভিগেশন">
          {mobileNavigation.map((item) => {
            const Icon = item.icon;
            const active = location === item.href || (item.href !== "/dashboard" && location.startsWith(item.href));
            return <Link key={item.href} href={item.href} className={cn("mobile-bottom-link", active && "mobile-bottom-link-active")}><Icon size={18} /><span>{item.label}</span></Link>;
          })}
        </nav>
      </main>
    </div>
  );
}

export function PhaseZeroNotice() {
  return (
    <section className="phase-notice" aria-label="প্রাথমিক সংস্করণের সীমা">
      <div className="phase-notice-icon"><Sparkles size={18} /></div>
      <p><strong>Initial learning shell</strong> — এই সংস্করণে structured lesson, practice, progress ও offline storage ব্যবহার করা যায়। AI Coach, exam center ও detailed skill labs পরবর্তী ধাপে যুক্ত হবে।</p>
    </section>
  );
}
