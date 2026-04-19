import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-300 py-12 px-6">
            <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-center md:text-left">
                <div>
                    <h3 className="text-white font-bold mb-4">Mastering Quran</h3>
                    <p className="text-sm text-slate-400">
                        Read, listen, and understand the Holy Quran — free, ad-free, and grounded in verified sources.
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                        Operated by Nusrat Wali Ventures LLC · Houston, Texas
                    </p>
                </div>

                <div className="space-y-2">
                    <h4 className="text-white font-semibold mb-4">Tools</h4>
                    <div className="flex flex-col gap-2 text-sm">
                        <Link to="/quran" className="hover:text-white transition-colors">Read the Quran</Link>
                        <Link to="/hadith" className="hover:text-white transition-colors">Browse Hadith</Link>
                        <Link to="/ask" className="hover:text-white transition-colors">Ask AI</Link>
                        <Link to="/topics" className="hover:text-white transition-colors">Topics</Link>
                    </div>
                </div>

                <div className="space-y-2">
                    <h4 className="text-white font-semibold mb-4">Project</h4>
                    <div className="flex flex-col gap-2 text-sm">
                        <Link to="/about" className="hover:text-white transition-colors">About</Link>
                        <Link to="/faq" className="hover:text-white transition-colors">FAQ</Link>
                        <Link to="/in-loving-memory" className="hover:text-white transition-colors">In Loving Memory</Link>
                        <a href="mailto:fauwad@nusratwaliventures.com" className="hover:text-white transition-colors">
                            Contact
                        </a>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                <span>&copy; 2026 Nusrat Wali Ventures LLC · Dedicated to <Link to="/in-loving-memory" className="hover:text-white transition-colors underline">Dr. Nusrat Wali and Dr. Wali Ahmad</Link></span>
                <div className="flex gap-6">
                    <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                    <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
                </div>
            </div>
        </footer>
    );
}
