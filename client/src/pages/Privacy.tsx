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
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-12">Effective date: November 24, 2026</p>

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
              <li><strong>Account information.</strong> If you sign in, we store your email address, Supabase user ID, and (if you choose one) a securely hashed password so bookmarks, notes, memorization progress, playlists, and daily reminder settings can sync across your devices. Reading-plan progress, bookmark collections, and the zakat form draft stay on your device.</li>
              <li><strong>Content you save.</strong> We store the bookmarks, notes, learning progress, memorization status, zakat records, and reminder preferences you choose to save.</li>
              <li><strong>Optional location.</strong> Prayer times and Qibla can use your device location when you grant permission. They are calculated on your device; we do not receive your coordinates.</li>
              <li><strong>Messages and support.</strong> If you email us or submit a form, we receive your email address and the contents of your message.</li>
              <li><strong>Sign-in activity.</strong> We record the steps of signing up, signing in, and resetting a password (for example, which option you chose and whether it worked) to find and fix problems. These records do not include your email address or password.</li>
              <li><strong>Ask Wali questions.</strong> When you use Ask Wali, your question and the recent messages in that conversation are sent to Anthropic to write the answer. Your name and email are not included. We do not save your questions; we store how many you asked each day to apply the daily limit.</li>
              <li><strong>Daily reminders.</strong> If you turn them on, we store your email address or a push notification address, your timezone, and your delivery time.</li>
              <li><strong>Usage data.</strong> We use Google Analytics to count page views, referrers, and some actions, and a page-speed script from msdrills.com, a site we operate, to measure loading speed. We do not show ads or sell personal information.</li>
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
              <li><strong>Anthropic</strong>: writes Ask Wali answers (the Claude AI model).</li>
              <li><strong>Resend</strong>: sends sign-in, welcome, and daily verse emails.</li>
              <li><strong>Quran.com, AlQuran.cloud, Islamic Network, and jsDelivr</strong>: Quran text, recitation, tafsir, hadith, and study content.</li>
              <li><strong>metals.dev</strong>: gold and silver prices for the zakat calculator.</li>
              <li><strong>Google Analytics</strong>: usage statistics.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Your choices</h2>
            <p>You can sign out at any time and remove saved items from the app where supported. You can permanently delete your account and its data at <a href="/account" className="text-blue-600 dark:text-blue-400 hover:underline">masteringquran.com/account</a> or in the app under your profile menu, then Account. You can also request deletion by emailing{" "}
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
