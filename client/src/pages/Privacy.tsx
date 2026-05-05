import SEO from "@/components/SEO";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 px-6 font-sans">
      <SEO
        title="Privacy Policy - Mastering Quran"
        description="How Mastering Quran (operated by Nusrat Wali Ventures LLC) collects, uses, and protects information."
      />
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
          Privacy Policy
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-12">Effective date: May 5, 2026</p>

        <div className="space-y-8 text-slate-700 dark:text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Overview</h2>
            <p>
              Nusrat Wali Ventures LLC ("we", "us", "our") operates{" "}
              <a href="https://masteringquran.com" className="text-blue-600 dark:text-blue-400 hover:underline">masteringquran.com</a> and the Mastering Quran mobile apps (the "Service"). This Privacy Policy explains what information we collect, how we use it, and the choices you have.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Information we collect</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Account information.</strong> If you sign in, we store your email address and Supabase user ID so bookmarks, notes, memorization progress, reading plans, and daily reminder settings can sync across your devices.</li>
              <li><strong>Content you save.</strong> We store the bookmarks, notes, learning progress, memorization status, zakat records, and reminder preferences you choose to save.</li>
              <li><strong>Optional location.</strong> Prayer times and Qibla can use your device location when you grant permission. Coordinates are used to calculate results and are not stored by us for that feature.</li>
              <li><strong>Messages and support.</strong> If you email us or submit a form, we receive your email address and the contents of your message.</li>
              <li><strong>Usage data.</strong> We may use privacy-respecting analytics to count page views and referrers. We do not use advertising trackers or sell personal information.</li>
              <li><strong>Server logs.</strong> Our host (Cloudflare) keeps standard access logs (IP, user agent, request URL) for security and performance.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">How we use it</h2>
            <p>We use the information to operate the Service, authenticate users, sync saved study features, send reminders you request, respond to inquiries, improve performance, and protect against abuse. We do not sell personal information.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Third-party services</h2>
            <p>We rely on the following providers, each with its own privacy practices:</p>
            <ul className="list-disc list-inside space-y-2 mt-3">
              <li><strong>Cloudflare Pages</strong> — hosting and CDN.</li>
              <li><strong>Supabase</strong> — authentication and database for saved app features.</li>
              <li><strong>Quran.com API, UmmahAPI, and related source APIs</strong> — Quran text, recitation, prayer times, Qibla, hadith, and study content.</li>
              <li><strong>Analytics providers, if enabled</strong> — privacy-respecting usage analytics.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Your choices</h2>
            <p>You can sign out at any time and remove saved items from the app where supported. You can request deletion of your account data or messages by emailing{" "}
              <a href="mailto:fauwad@nusratwaliventures.com" className="text-blue-600 dark:text-blue-400 hover:underline">fauwad@nusratwaliventures.com</a>. You can also deny location and notification permissions in your device settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Children</h2>
            <p>The Site is not directed at children under 13, and we do not knowingly collect personal information from children.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Changes</h2>
            <p>We may update this policy from time to time. We will revise the effective date above when we do.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Contact</h2>
            <p>
              Questions? Email{" "}
              <a href="mailto:fauwad@nusratwaliventures.com" className="text-blue-600 dark:text-blue-400 hover:underline">fauwad@nusratwaliventures.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
