import { renderEmail } from "./email-layout";

export const WELCOME_HTML = renderEmail({
    preheader: "Your free Mastering Quran account is ready.",
    heading: "Welcome to Mastering Quran",
    paragraphs: [
        "Assalamu alaikum, and welcome. Your free account is ready.",
        "Your bookmarks, notes, memorization progress and reading plans now save to your account and sync across the website and the iPhone and Android apps.",
        "A few good places to start:",
        `<a href="https://masteringquran.com/quran" style="color:#059669;">Read the Quran</a> with translation and tafsir<br>
<a href="https://masteringquran.com/memorize" style="color:#059669;">Memorize</a> with spaced review<br>
<a href="https://masteringquran.com/learn-arabic" style="color:#059669;">Learn Arabic</a> from the alphabet up<br>
<a href="https://masteringquran.com/ask" style="color:#059669;">Ask Wali</a> questions about verses, hadith and tafsir`,
    ],
    button: { label: "Start reading", url: "https://masteringquran.com/quran" },
    afterButton: [`Questions? The <a href="https://masteringquran.com/faq" style="color:#059669;">FAQ</a> covers the most common ones.`],
    footerNote: "You're getting this because you created a Mastering Quran account.",
});

export const WELCOME_TEXT = `Welcome to Mastering Quran

Assalamu alaikum, and welcome. Your free account is ready.

Your bookmarks, notes, memorization progress and reading plans now save to your account and sync across the website and the iPhone and Android apps.

Read the Quran: https://masteringquran.com/quran
Memorize: https://masteringquran.com/memorize
Learn Arabic: https://masteringquran.com/learn-arabic
Ask Wali: https://masteringquran.com/ask

Questions? See https://masteringquran.com/faq`;
