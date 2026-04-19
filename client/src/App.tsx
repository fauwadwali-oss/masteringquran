import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Quran from "./pages/Quran";
import Hadith from "./pages/Hadith";
import Ask from "./pages/Ask";
import PrayerTimes from "./pages/PrayerTimes";
import Qibla from "./pages/Qibla";
import Names from "./pages/Names";
import Duas from "./pages/Duas";
import Ramadan from "./pages/Ramadan";
import CalendarPage from "./pages/Calendar";
import Topics from "./pages/Topics";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import AuthCallback from "./pages/AuthCallback";
import Bookmarks from "./pages/Bookmarks";
import Notes from "./pages/Notes";
import Memorize from "./pages/Memorize";
import Plans from "./pages/Plans";
import Quiz from "./pages/Quiz";
import Flashcards from "./pages/Flashcards";
import Prophets from "./pages/Prophets";
import Seerah from "./pages/Seerah";
import Glossary from "./pages/Glossary";
import HajjPage from "./pages/Hajj";
import Share from "./pages/Share";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import UserPreferences from "./components/UserPreferences";
import KeyboardShortcutsProvider from "./components/KeyboardShortcutsProvider";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
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
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/quran" element={<Quran />} />
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
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
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
