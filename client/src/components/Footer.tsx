import { Link } from "react-router-dom";
import { BookOpen, Heart, Mail, Sparkles } from "lucide-react";

export default function Footer() {
    return (
        <footer className="relative overflow-hidden bg-[#061827] px-6 py-14 text-slate-300">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(16,185,129,0.18),transparent_28%),radial-gradient(circle_at_88%_18%,rgba(245,158,11,0.12),transparent_26%)]" />
            <div className="relative mx-auto grid max-w-6xl gap-10 text-center md:grid-cols-[1.35fr_0.8fr_0.8fr_0.9fr] md:text-left">
                <div className="space-y-4">
                    <Link to="/" className="inline-flex items-center justify-center gap-3 md:justify-start">
                        <img src="/mq-logo-mark.svg" alt="" aria-hidden="true" className="h-12 w-auto" />
                        <span className="text-lg font-bold text-white">Mastering Quran</span>
                    </Link>
                    <p className="max-w-sm text-sm leading-7 text-slate-400 mx-auto md:mx-0">
                        Read, listen, and understand the Holy Quran — free, ad-free, and grounded in verified sources.
                    </p>
                    <p className="text-xs text-slate-500">
                        Operated by Nusrat Wali Ventures LLC · Houston, Texas
                    </p>
                </div>

                <div className="space-y-2">
                    <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Study</h4>
                    <div className="flex flex-col gap-3 text-sm">
                        <FooterLink to="/quran" icon={BookOpen} label="Read the Quran" />
                        <FooterLink to="/hadith" icon={BookOpen} label="Browse Hadith" />
                        <FooterLink to="/learn-arabic" icon={Sparkles} label="Learn Arabic" />
                        <FooterLink to="/ask" icon={Sparkles} label="Ask AI" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Daily</h4>
                    <div className="flex flex-col gap-3 text-sm">
                        <FooterLink to="/prayer-times" icon={BookOpen} label="Prayer Times" />
                        <FooterLink to="/duas" icon={Heart} label="Duas" />
                        <FooterLink to="/plans" icon={BookOpen} label="Reading Plans" />
                        <FooterLink to="/daily" icon={Mail} label="Daily Reminder" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Project</h4>
                    <div className="flex flex-col gap-3 text-sm">
                        <FooterLink to="/about" label="About" />
                        <FooterLink to="/faq" label="FAQ" />
                        <FooterLink to="/sources" label="Sources" />
                        <FooterLink to="/in-loving-memory" label="In Loving Memory" />
                        <a href="mailto:fauwad@nusratwaliventures.com" className="transition-colors hover:text-white">
                            Contact
                        </a>
                    </div>
                </div>
            </div>

            <div className="relative mx-auto mt-12 flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-slate-500 sm:flex-row">
                <span>&copy; 2026 Nusrat Wali Ventures LLC · Dedicated to <Link to="/in-loving-memory" className="hover:text-white transition-colors underline">Dr. Nusrat Wali and Dr. Wali Ahmad</Link></span>
                <div className="flex gap-6">
                    <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                    <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
                </div>
            </div>
        </footer>
    );
}

function FooterLink({
    to,
    label,
    icon: Icon,
}: {
    to: string;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
}) {
    return (
        <Link to={to} className="inline-flex items-center justify-center gap-2 transition-colors hover:text-white md:justify-start">
            {Icon && <Icon className="h-4 w-4 text-emerald-400" />}
            <span>{label}</span>
        </Link>
    );
}
