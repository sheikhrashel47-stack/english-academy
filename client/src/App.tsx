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
const GrammarPage = lazy(() => import("@/pages/GrammarPage"));
const MistakeBankPage = lazy(() => import("@/pages/MistakeBankPage"));
const ToolsPage = lazy(() => import("@/pages/ToolsPage"));
const SkillLabPage = lazy(() => import("@/pages/SkillLabPage"));
const VocabularyDetailPage = lazy(() => import("@/pages/VocabularyDetailPage"));
const FlashcardsPage = lazy(() => import("@/pages/FlashcardsPage"));
const ReviewPage = lazy(() => import("@/pages/ReviewPage"));
const PrototypeStudioPage = lazy(() => import("@/pages/PrototypeStudioPage"));

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
        <Route path="/learn" component={CoursePage} />
        <Route path="/learn/levels" component={CoursePage} />
        <Route path="/learn/level/:level" component={CoursePage} />
        <Route path="/learn/unit/:unitId" component={UnitPage} />
        <Route path="/learn/lesson/:lessonId" component={LessonPage} />
        <Route path="/vocabulary/flashcards" component={FlashcardsPage} />
        <Route path="/vocabulary/:word" component={VocabularyDetailPage} />
        <Route path="/vocabulary" component={VocabularyPage} />
        <Route path="/grammar/:topic" component={GrammarPage} />
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
        <Route path="/listening" component={() => <SkillLabPage skill="listening" />} />
        <Route path="/pronunciation" component={() => <SkillLabPage skill="pronunciation" />} />
        <Route path="/speaking" component={() => <SkillLabPage skill="speaking" />} />
        <Route path="/writing" component={() => <SkillLabPage skill="writing" />} />
        <Route path="/reading" component={() => <SkillLabPage skill="reading" />} />
        <Route path="/mistakes" component={MistakeBankPage} />
        <Route path="/review" component={ReviewPage} />
        <Route path="/flashcards" component={FlashcardsPage} />
        <Route path="/ai" component={() => <PrototypeStudioPage kind="ai" />} />
        <Route path="/roleplay" component={() => <PrototypeStudioPage kind="roleplay" />} />
        <Route path="/exams" component={() => <PrototypeStudioPage kind="exams" />} />
        <Route path="/profile" component={() => <PrototypeStudioPage kind="profile" />} />
        <Route path="/history" component={() => <PrototypeStudioPage kind="history" />} />
        <Route path="/certificates" component={() => <PrototypeStudioPage kind="certificates" />} />
        <Route path="/progress/skills" component={ProgressPage} />
        <Route path="/progress" component={ProgressPage} />
        <Route path="/tools" component={ToolsPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
  );
}

function Bootstrap() {
  useEffect(() => { void initializeLearningApp(); }, []);
  return <Suspense fallback={<div className="route-loading">পথটি খোলা হচ্ছে…</div>}><Router /></Suspense>;
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
