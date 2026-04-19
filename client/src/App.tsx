import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
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
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
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
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <ScrollToTop />
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
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
