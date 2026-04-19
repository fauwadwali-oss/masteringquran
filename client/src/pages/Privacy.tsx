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
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-12">Effective date: April 18, 2026</p>

        <div className="space-y-8 text-slate-700 dark:text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Overview</h2>
            <p>
              Nusrat Wali Ventures LLC ("we", "us", "our") operates{" "}
              <a href="https://masteringquran.com" className="text-blue-600 dark:text-blue-400 hover:underline">masteringquran.com</a> (the "Site"). This Privacy Policy explains what information we collect, how we use it, and the choices you have. By using the Site, you agree to the practices described here.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Information we collect</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Information you provide.</strong> If you email us or submit a form, we receive your email address and the contents of your message.</li>
              <li><strong>Visitor memorial submissions.</strong> If you leave a condolence or light a candle on the memorial page, we store the message, name (optional), and timestamp you provide.</li>
              <li><strong>Usage data.</strong> We use privacy-respecting analytics (Umami) to count page views and referrers. No cookies, no cross-site tracking, no personal identifiers.</li>
              <li><strong>Server logs.</strong> Our host (Cloudflare) keeps standard access logs (IP, user agent, request URL) for security and performance.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">How we use it</h2>
            <p>We use the information to operate the Site, respond to inquiries, display memorial content, improve performance, and protect against abuse. We do not sell personal information.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Third-party services</h2>
            <p>We rely on the following providers, each with its own privacy practices:</p>
            <ul className="list-disc list-inside space-y-2 mt-3">
              <li><strong>Cloudflare Pages</strong> — hosting and CDN.</li>
              <li><strong>Supabase</strong> — database for memorial submissions.</li>
              <li><strong>Umami Analytics</strong> — privacy-first usage analytics.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Your choices</h2>
            <p>You can request that we delete any memorial submission or message you sent by emailing{" "}
              <a href="mailto:info@masteringquran.com" className="text-blue-600 dark:text-blue-400 hover:underline">info@masteringquran.com</a>. You can disable cookies or analytics in your browser at any time.
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
              <a href="mailto:info@masteringquran.com" className="text-blue-600 dark:text-blue-400 hover:underline">info@masteringquran.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
