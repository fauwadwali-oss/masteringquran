// Writes the Supabase Auth email templates to supabase/templates/ using the same
// layout as the welcome email. Paste each file into Supabase Dashboard >
// Authentication > Emails. Run: npm run auth-emails
import { writeFileSync, mkdirSync } from "node:fs";
import { renderEmail } from "../../functions/_lib/email-layout";
import { WELCOME_HTML } from "../../functions/_lib/welcome-email";

const OUT = "supabase/templates";
mkdirSync(OUT, { recursive: true });

const templates: Record<string, { subject: string; html: string }> = {
    "confirm-signup": {
        subject: "Confirm your email to finish creating your Mastering Quran account",
        html: renderEmail({
            preheader: "One tap to activate your free account.",
            heading: "Welcome! Confirm your email",
            paragraphs: [
                "Assalamu alaikum. Thank you for creating a free Mastering Quran account.",
                "Tap the button below to confirm <strong>{{ .Email }}</strong>. You'll be signed in right away, and your bookmarks, notes and memorization progress will sync across the website and the apps.",
            ],
            button: { label: "Confirm my email", url: "{{ .ConfirmationURL }}" },
            afterButton: [
                "This link works once and expires in 1 hour. If you're using the iPhone or Android app, open this email on the same phone.",
                "Didn't sign up? You can ignore this email and no account will be activated.",
            ],
            footerNote: "You're getting this because someone used this address to sign up at masteringquran.com.",
        }),
    },
    "magic-link": {
        subject: "Your Mastering Quran sign-in link",
        html: renderEmail({
            preheader: "Tap to sign in. No password needed.",
            heading: "Sign in to Mastering Quran",
            paragraphs: ["Tap the button below to sign in as <strong>{{ .Email }}</strong>. No password needed."],
            button: { label: "Sign in", url: "{{ .ConfirmationURL }}" },
            afterButton: [
                "This link works once and expires in 1 hour. If you're using the app, open this email on the same phone.",
                "Didn't ask to sign in? You can safely ignore this email. Nobody can get into your account without this link.",
            ],
            footerNote: "You're getting this because a sign-in link was requested for this address at masteringquran.com.",
        }),
    },
    "reset-password": {
        subject: "Reset your Mastering Quran password",
        html: renderEmail({
            preheader: "Choose a new password for your account.",
            heading: "Reset your password",
            paragraphs: [
                "We got a request to reset the password for <strong>{{ .Email }}</strong>.",
                "Tap the button below to choose a new one. Your bookmarks, notes and progress stay exactly as they are.",
            ],
            button: { label: "Choose a new password", url: "{{ .ConfirmationURL }}" },
            afterButton: [
                "This link works once and expires in 1 hour. If you're using the iPhone or Android app, open this email on the same phone.",
                "Didn't ask for this? Ignore this email and your password won't change.",
            ],
            footerNote: "You're getting this because a password reset was requested for this address at masteringquran.com.",
        }),
    },
};

for (const [name, { subject, html }] of Object.entries(templates)) {
    writeFileSync(`${OUT}/${name}.html`, html);
    console.log(`${name}.html  subject: ${subject}`);
}
writeFileSync(`${OUT}/welcome.preview.html`, WELCOME_HTML);
