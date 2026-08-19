/**
 * Design reminder — “ভাষার মানচিত্র”: compass navigation, warm parchment surfaces,
 * ink typography, and restrained terracotta position markers.
 */
import { Link, useLocation } from "wouter";
import {
  BookOpen,
  BookMarked,
  ChartNoAxesCombined,
  ChevronRight,
  CircleHelp,
  GraduationCap,
  LibraryBig,
  ListChecks,
  RotateCcw,
  Map,
  Menu,
  Settings,
  Sparkles,
  Target,
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

const navigation = [
  { href: "/dashboard", label: "আমার পথ", icon: Map },
  { href: "/course/course-english-foundations", label: "পাঠ্যপথ", icon: LibraryBig },
  { href: "/practice", label: "অনুশীলন", icon: ListChecks },
  { href: "/vocabulary", label: "শব্দভাণ্ডার", icon: BookOpen },
  { href: "/grammar", label: "Grammar", icon: BookMarked },
  { href: "/mistakes", label: "Mistake Bank", icon: RotateCcw },
  { href: "/progress", label: "অগ্রগতি", icon: ChartNoAxesCombined },
];

const mobileNavigation = [navigation[0], navigation[1], navigation[2], navigation[4], navigation[5]];

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
          <small>Learner’s atlas</small>
        </span>
      </Link>

      <div className="sidebar-label">Learning compass</div>
      <nav className="sidebar-nav" aria-label="প্রধান নেভিগেশন">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = location === item.href || (item.href !== "/dashboard" && location.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={cn("nav-item", active && "nav-item-active")}>
              <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
              <span>{item.label}</span>
              {active && <ChevronRight className="nav-chevron" size={15} />}
            </Link>
          );
        })}
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
          <div className="page-heading">
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
    <section className="phase-notice" aria-label="Phase 0 সীমা">
      <div className="phase-notice-icon"><Target size={18} /></div>
      <p><strong>Phase 0 foundation</strong> — এই prototype-এ structured lesson, প্রশ্ন, অগ্রগতি ও offline storage যাচাই করা যাচ্ছে। সম্পূর্ণ course ও AI tutor ইচ্ছাকৃতভাবে এখনও যুক্ত করা হয়নি।</p>
    </section>
  );
}
