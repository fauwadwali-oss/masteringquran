import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import SEO from "@/components/SEO";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 space-y-8 bg-slate-50 dark:bg-slate-950">
      <SEO
        title="Page Not Found - Mastering Quran"
        description="The page you are looking for does not exist."
      />

      <div className="space-y-4">
        <h1 className="text-9xl font-bold text-slate-200 dark:text-slate-800">404</h1>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Page Not Found</h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
        </p>
      </div>

      <Button asChild size="lg" className="bg-slate-900 hover:bg-slate-800 text-white">
        <Link to="/">
          <Home className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </Button>
    </div>
  );
}
