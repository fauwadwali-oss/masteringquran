import SEO from "@/components/SEO";

export default function Terms() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 px-6 font-sans">
      <SEO
        title="Terms of Service - Mastering Quran"
        description="Terms governing the use of Mastering Quran, operated by Nusrat Wali Ventures LLC."
      />
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
          Terms of Service
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-12">Effective date: April 18, 2026</p>

        <div className="space-y-8 text-slate-700 dark:text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Acceptance</h2>
            <p>
              These Terms govern your use of{" "}
              <a href="https://masteringquran.com" className="text-blue-600 dark:text-blue-400 hover:underline">masteringquran.com</a> (the "Site"), operated by Nusrat Wali Ventures LLC ("we", "us", "our"). By accessing the Site, you agree to these Terms. If you do not agree, do not use the Site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Use of the Site</h2>
            <p>You agree to use the Site lawfully and respectfully. Do not attempt to disrupt the Site, submit abusive content, impersonate others, or infringe intellectual property. We may remove content or restrict access at our discretion.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Not medical advice</h2>
            <p>
              Content on the Site and on products we operate or link to — including MasteringSeries, Mastering Scholar, Mastering Medical, FoodVision AI, and consulting materials — is for educational and informational purposes only. <strong>It is not medical advice, diagnosis, or treatment.</strong> Always consult a qualified healthcare professional for decisions about your health.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Intellectual property</h2>
            <p>The Site's design, text, logos, and graphics are owned by Nusrat Wali Ventures LLC or its licensors and are protected by copyright and trademark law. Quranic text displayed on the Site is in the public domain; translations are used under their respective licenses.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Third-party links</h2>
            <p>The Site links to third-party platforms (our own ventures and external partners). We are not responsible for the content, policies, or practices of third-party sites.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Disclaimers</h2>
            <p>The Site is provided "as is" without warranties of any kind, express or implied. We do not warrant that the Site will be uninterrupted, error-free, or secure.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Limitation of liability</h2>
            <p>To the maximum extent permitted by law, Nusrat Wali Ventures LLC and its owners, employees, and affiliates are not liable for any indirect, incidental, or consequential damages arising from your use of the Site.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Governing law</h2>
            <p>These Terms are governed by the laws of the State of Texas, United States, without regard to conflict-of-law principles. Any disputes will be resolved in the state or federal courts located in Harris County, Texas.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Changes</h2>
            <p>We may update these Terms from time to time. Continued use of the Site after changes constitutes acceptance of the revised Terms.</p>
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
