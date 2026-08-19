/**
 * Design reminder — “ভাষার মানচিত্র”: every route has a clear return path through
 * the compass shell; calm learning continuity is more important than route novelty.
 */
import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Router as WouterRouter, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
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
        <Route path="/vocabulary" component={VocabularyPage} />
        <Route path="/grammar" component={GrammarPage} />
        <Route path="/practice" component={PracticePage} />
        <Route path="/mistakes" component={MistakeBankPage} />
        <Route path="/progress" component={ProgressPage} />
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
        <TooltipProvider>
          <Toaster />
          <Bootstrap />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
