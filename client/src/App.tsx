/**
 * Design reminder — “Emerald Study House”: every route has a clear return path through
 * a calm, connected study workspace; learning continuity matters more than route novelty.
 */
import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Router as WouterRouter, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LearningPreferencesProvider } from "./contexts/LearningPreferencesContext";
import { initializeLearningApp } from "@/app/bootstrap/initializeLearningApp";
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const LessonPage = lazy(() => import("@/pages/LessonPage"));
const VocabularyPage = lazy(() => import("@/pages/VocabularyPage"));
const ProgressPage = lazy(() => import("@/pages/ProgressPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const CoursePage = lazy(() => import("@/pages/CoursePage"));
const PracticePage = lazy(() => import("@/pages/PracticePage"));
const UnitPage = lazy(() => import("@/pages/UnitPage"));
const LevelPage = lazy(() => import("@/pages/LevelPage"));
const ChapterPage = lazy(() => import("@/pages/ChapterPage"));
const LearningPathPage = lazy(() => import("@/pages/LearningPathPage"));
const GrammarPage = lazy(() => import("@/pages/GrammarPage"));
const GrammarConceptPage = lazy(() => import("@/pages/GrammarConceptPage"));
const MistakeBankPage = lazy(() => import("@/pages/MistakeBankPage"));
const ToolsPage = lazy(() => import("@/pages/ToolsPage"));
const SkillLabPage = lazy(() => import("@/pages/SkillLabPage"));
const VocabularyDetailPage = lazy(() => import("@/pages/VocabularyDetailPage"));
const FlashcardsPage = lazy(() => import("@/pages/FlashcardsPage"));
const ReviewPage = lazy(() => import("@/pages/ReviewPage"));
const PrototypeStudioPage = lazy(() => import("@/pages/PrototypeStudioPage"));
const ContentAdminPage = lazy(() => import("@/pages/ContentAdminPage"));
const AudioLibraryPage = lazy(() => import("@/pages/AudioLibraryPage"));
const DiagnosticPage = lazy(() => import("@/pages/DiagnosticPage"));
const AssessmentPage = lazy(() => import("@/pages/AssessmentPage"));
const AssessmentResultPage = lazy(() => import("@/pages/AssessmentResultPage"));
const AssessmentHistoryPage = lazy(() => import("@/pages/AssessmentHistoryPage"));
const CertificatesPage = lazy(() => import("@/pages/CertificatesPage"));

function Router() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <WouterRouter base={base || undefined}>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/course" component={CoursePage} />
        <Route path="/course/:courseId" component={CoursePage} />
        <Route path="/unit/:unitId" component={UnitPage} />
        <Route path="/lesson/:lessonId" component={LessonPage} />
        <Route path="/learn" component={LearningPathPage} />
        <Route path="/learn/levels" component={LearningPathPage} />
        <Route path="/learn/level/:level" component={LevelPage} />
        <Route path="/level/:level" component={LevelPage} />
        <Route path="/levels/:level" component={LevelPage} />
        <Route path="/learn/unit/:unitId" component={UnitPage} />
        <Route path="/chapter/:chapterId" component={ChapterPage} />
        <Route path="/learn/chapter/:chapterId" component={ChapterPage} />
        <Route path="/learn/lesson/:lessonId" component={LessonPage} />
        <Route path="/vocabulary/flashcards" component={FlashcardsPage} />
        <Route path="/vocabulary/:word" component={VocabularyDetailPage} />
        <Route path="/vocabulary" component={VocabularyPage} />
        <Route path="/audio" component={AudioLibraryPage} />
        <Route path="/diagnostic" component={AssessmentPage} />
        <Route path="/grammar/:conceptId" component={GrammarConceptPage} />
        <Route path="/grammar" component={GrammarPage} />
        <Route path="/practice/setup" component={PracticePage} />
        <Route path="/practice/session" component={PracticePage} />
        <Route path="/practice/result" component={PracticePage} />
        <Route path="/practice" component={PracticePage} />
        <Route path="/skills/listening" component={() => <SkillLabPage skill="listening" />} />
        <Route path="/skills/pronunciation" component={() => <SkillLabPage skill="pronunciation" />} />
        <Route path="/skills/speaking" component={() => <SkillLabPage skill="speaking" />} />
        <Route path="/skills/writing" component={() => <SkillLabPage skill="writing" />} />
        <Route path="/skills/reading" component={() => <SkillLabPage skill="reading" />} />
        <Route path="/skills/communication" component={() => <SkillLabPage skill="communication" />} />
        <Route path="/listening" component={() => <SkillLabPage skill="listening" />} />
        <Route path="/pronunciation" component={() => <SkillLabPage skill="pronunciation" />} />
        <Route path="/speaking" component={() => <SkillLabPage skill="speaking" />} />
        <Route path="/writing" component={() => <SkillLabPage skill="writing" />} />
        <Route path="/reading" component={() => <SkillLabPage skill="reading" />} />
        <Route path="/communication" component={() => <SkillLabPage skill="communication" />} />
        <Route path="/mistakes" component={MistakeBankPage} />
        <Route path="/review" component={ReviewPage} />
        <Route path="/flashcards" component={FlashcardsPage} />
        <Route path="/ai" component={() => <PrototypeStudioPage kind="ai" />} />
        <Route path="/roleplay" component={() => <PrototypeStudioPage kind="roleplay" />} />
        <Route path="/exams/result/:resultId" component={AssessmentResultPage} />
        <Route path="/exams/:blueprintId" component={AssessmentPage} />
        <Route path="/exams" component={AssessmentPage} />
        <Route path="/profile" component={() => <PrototypeStudioPage kind="profile" />} />
        <Route path="/history" component={AssessmentHistoryPage} />
        <Route path="/certificates" component={CertificatesPage} />
        <Route path="/progress/skills" component={ProgressPage} />
        <Route path="/progress" component={ProgressPage} />
        <Route path="/tools" component={ToolsPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/content-admin" component={ContentAdminPage} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
  );
}

function Bootstrap() {
  useEffect(() => { void initializeLearningApp(); }, []);
  return <Suspense fallback={<main className="route-loading" aria-live="polite"><span>ENGLISH ACADEMY · STUDY WORKSPACE</span><h1>Preparing your learning desk</h1><p>তোমার local learning record ও পরের study step প্রস্তুত হচ্ছে।</p><small>Local status · route module loading</small></main>}><Router /></Suspense>;
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <LearningPreferencesProvider>
          <TooltipProvider>
            <Toaster />
            <Bootstrap />
          </TooltipProvider>
        </LearningPreferencesProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
