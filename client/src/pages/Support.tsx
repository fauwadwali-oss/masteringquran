import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";

const EMAIL = "fauwad@nusratwaliventures.com";
const link = "text-emerald-700 underline dark:text-emerald-400";

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section>
            <h2 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">{title}</h2>
            <p>{children}</p>
        </section>
    );
}

export default function Support() {
    return (
        <div className="min-h-screen bg-slate-50 px-6 py-12 font-sans dark:bg-slate-950">
            <SEO title="Support | Mastering Quran" description="Get help with the Mastering Quran website and apps." canonicalPath="/support" />
            <div className="mx-auto max-w-2xl space-y-8 leading-relaxed text-slate-700 dark:text-slate-300">
                <h1 className="text-3xl font-bold text-slate-900 md:text-4xl dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Support</h1>
                <Section title="Contact us">
                    Email <a className={link} href={`mailto:${EMAIL}?subject=Mastering%20Quran%20support`}>{EMAIL}</a>. Tell us your device and what happened. A screenshot helps.
                </Section>
                <Section title="Signing in">
                    Use Continue with Google, your email and password, or a magic link. Sign in with Apple is available in the iPhone app. If you forgot your password, choose Forgot password in the sign-in window.
                </Section>
                <Section title="Listening with the phone locked">
                    Start a surah or a playlist, then lock your phone. Pause and skip from the lock screen.
                </Section>
                <Section title="Home screen widget">
                    Press and hold an empty part of your home screen. On iPhone, tap Edit, then Add Widget. On Android, tap Widgets. Choose Mastering Quran.
                </Section>
                <Section title="Reporting an Ask Wali answer">
                    Choose Report answer under the answer. We review these reports.
                </Section>
                <Section title="Corrections and content rights">
                    See <Link className={link} to="/sources">Sources</Link> for the editions we show. Send corrections or rights questions to the email above.
                </Section>
                <Section title="Deleting your account">
                    Go to <Link className={link} to="/account">your account</Link>. See also our <Link className={link} to="/privacy">Privacy Policy</Link> and <Link className={link} to="/terms">Terms</Link>.
                </Section>
            </div>
        </div>
    );
}
