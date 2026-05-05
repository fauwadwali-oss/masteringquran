import { lazy, Suspense, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import UserPreferences from "./components/UserPreferences";
import KeyboardShortcutsProvider from "./components/KeyboardShortcutsProvider";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

const Home = lazy(() => import("./pages/Home"));
const Quran = lazy(() => import("./pages/Quran"));
const SearchPage = lazy(() => import("./pages/Search"));
const Hadith = lazy(() => import("./pages/Hadith"));
const Ask = lazy(() => import("./pages/Ask"));
const PrayerTimes = lazy(() => import("./pages/PrayerTimes"));
const Qibla = lazy(() => import("./pages/Qibla"));
const Names = lazy(() => import("./pages/Names"));
const Duas = lazy(() => import("./pages/Duas"));
const Ramadan = lazy(() => import("./pages/Ramadan"));
const CalendarPage = lazy(() => import("./pages/Calendar"));
const Topics = lazy(() => import("./pages/Topics"));
const About = lazy(() => import("./pages/About"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Sources = lazy(() => import("./pages/Sources"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const Bookmarks = lazy(() => import("./pages/Bookmarks"));
const Notes = lazy(() => import("./pages/Notes"));
const Memorize = lazy(() => import("./pages/Memorize"));
const Plans = lazy(() => import("./pages/Plans"));
const Quiz = lazy(() => import("./pages/Quiz"));
const Flashcards = lazy(() => import("./pages/Flashcards"));
const Prophets = lazy(() => import("./pages/Prophets"));
const Seerah = lazy(() => import("./pages/Seerah"));
const Glossary = lazy(() => import("./pages/Glossary"));
const HajjPage = lazy(() => import("./pages/Hajj"));
const Share = lazy(() => import("./pages/Share"));
const Daily = lazy(() => import("./pages/Daily"));
const Zakat = lazy(() => import("./pages/Zakat"));
const LearnArabic = lazy(() => import("./pages/LearnArabic"));
const LearnLetters = lazy(() => import("./pages/learn/Letters"));
const LearnShapes = lazy(() => import("./pages/learn/Shapes"));
const LearnHarakat = lazy(() => import("./pages/learn/Harakat"));
const LearnTanweenMadd = lazy(() => import("./pages/learn/TanweenMadd"));
const LearnTajweed = lazy(() => import("./pages/learn/Tajweed"));
const LearnFirstSurah = lazy(() => import("./pages/learn/FirstSurah"));
const LearnVocabulary = lazy(() => import("./pages/learn/Vocabulary"));
const LearnGrammar = lazy(() => import("./pages/learn/Grammar"));
const LearnNumbersPhrases = lazy(() => import("./pages/learn/NumbersPhrases"));
const LearnRoots = lazy(() => import("./pages/learn/Roots"));
const LearnWriting = lazy(() => import("./pages/learn/Writing"));
const LearnGraduation = lazy(() => import("./pages/learn/Graduation"));
const Tribute = lazy(() => import("./pages/Tribute"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const NotFound = lazy(() => import("./pages/NotFound"));

function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.08),transparent_30%),linear-gradient(180deg,#f8fffb_0%,#f8fafc_42%,#ffffff_100%)] text-slate-950 dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_28%),linear-gradient(180deg,#020617_0%,#0f172a_52%,#020617_100%)] dark:text-slate-100">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}

function RouteLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-6 py-16">
      <div className="rounded-2xl border border-emerald-100 bg-white/85 px-6 py-5 text-center shadow-xl shadow-emerald-900/5 dark:border-emerald-900/40 dark:bg-slate-900/85">
        <div className="mx-auto mb-3 h-10 w-10 animate-pulse rounded-full bg-emerald-100 dark:bg-emerald-950" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Loading Mastering Quran...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <UserPreferences>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <BrowserRouter>
                <ScrollToTop />
                <KeyboardShortcutsProvider />
                <Layout>
                  <Suspense fallback={<RouteLoading />}>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/quran" element={<Quran />} />
                      <Route path="/search" element={<SearchPage />} />
                      <Route path="/hadith" element={<Hadith />} />
                      <Route path="/ask" element={<Ask />} />
                      <Route path="/prayer-times" element={<PrayerTimes />} />
                      <Route path="/qibla" element={<Qibla />} />
                      <Route path="/names" element={<Names />} />
                      <Route path="/duas" element={<Duas />} />
                      <Route path="/ramadan" element={<Ramadan />} />
                      <Route path="/calendar" element={<CalendarPage />} />
                      <Route path="/topics" element={<Topics />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/faq" element={<FAQ />} />
                      <Route path="/sources" element={<Sources />} />
                      <Route path="/auth/callback" element={<AuthCallback />} />
                      <Route path="/bookmarks" element={<Bookmarks />} />
                      <Route path="/notes" element={<Notes />} />
                      <Route path="/memorize" element={<Memorize />} />
                      <Route path="/plans" element={<Plans />} />
                      <Route path="/quiz" element={<Quiz />} />
                      <Route path="/flashcards" element={<Flashcards />} />
                      <Route path="/prophets" element={<Prophets />} />
                      <Route path="/seerah" element={<Seerah />} />
                      <Route path="/glossary" element={<Glossary />} />
                      <Route path="/hajj" element={<HajjPage />} />
                      <Route path="/share" element={<Share />} />
                      <Route path="/daily" element={<Daily />} />
                      <Route path="/zakat" element={<Zakat />} />
                      <Route path="/learn-arabic" element={<LearnArabic />} />
                      <Route path="/learn-arabic/letters" element={<LearnLetters />} />
                      <Route path="/learn-arabic/shapes" element={<LearnShapes />} />
                      <Route path="/learn-arabic/harakat" element={<LearnHarakat />} />
                      <Route path="/learn-arabic/tanween-madd" element={<LearnTanweenMadd />} />
                      <Route path="/learn-arabic/tajweed" element={<LearnTajweed />} />
                      <Route path="/learn-arabic/first-surah" element={<LearnFirstSurah />} />
                      <Route path="/learn-arabic/vocabulary" element={<LearnVocabulary />} />
                      <Route path="/learn-arabic/grammar" element={<LearnGrammar />} />
                      <Route path="/learn-arabic/numbers-phrases" element={<LearnNumbersPhrases />} />
                      <Route path="/learn-arabic/roots" element={<LearnRoots />} />
                      <Route path="/learn-arabic/writing" element={<LearnWriting />} />
                      <Route path="/learn-arabic/graduation" element={<LearnGraduation />} />
                      <Route path="/in-loving-memory" element={<Tribute />} />
                      <Route path="/privacy" element={<Privacy />} />
                      <Route path="/terms" element={<Terms />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </Layout>
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </UserPreferences>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
