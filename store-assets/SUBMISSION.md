# Submission notes

## App Store (reply to the Oct 20 2026 message, Guideline 2.1 Information Needed)

Also paste this in App Review Information → Notes.

1. Screen recording: attached. Recorded on a physical iPhone. It starts at launch and shows reading, audio with the phone locked, creating an account, signing in, Ask Wali, and deleting the account (profile menu → Account → Delete account).
2. Purpose and audience: Mastering Quran helps Muslims and students of Islam read the Quran in Arabic with translation and tafsir, listen to recitation, learn Quranic Arabic, and keep a daily habit. It is free, with no ads or purchases.
3. Main features need no account. An account adds bookmarks, notes, memorization, playlists, synced progress, and Ask Wali (5 questions a day). Demo account: see Sign-In Information. The app has no user-generated content that other people can see.
4. Services: Supabase (accounts and saved data), Apple and Google sign-in, Resend (email), Cloudflare (hosting), Anthropic Claude (Ask Wali; the reader agrees before anything is sent), Quran.com, AlQuran.cloud and Islamic Network (text and recitation), jsDelivr (tafsir and hadith files), metals.dev (zakat prices). Prayer times are calculated on the device.
5. Regions: the same everywhere. Prayer times follow the place the reader chooses. Not offered in mainland China.
6. Sources and translations are named in the app under Sources. Not a regulated industry.

Background audio: recitation and playlists continue while the phone is locked, with system controls.

## App Store: before pressing Add for Review
- Screen recording on a real iPhone, attached (Apple asked for it)
- Demo account in Sign-In Information (password and email, not a magic link)
- Choose the new build instead of 41
- App Privacy answers match `ios/App/App/PrivacyInfo.xcprivacy`: name, email, user ID, other user content, other financial info (zakat), product interaction (sign-in steps), all linked and not used for tracking; search history not linked
- Availability: leave out mainland China (religious content and AI need permits there)
- Support URL: https://masteringquran.com/support
- Age rating questions

## Google Play
- AI-generated content: readers report an answer in the app with Report answer (saved in mq_ai_reports and emailed)
- Data safety: same data as above; account deletion URL https://masteringquran.com/account
- Foreground service (media playback) was declared Oct 28 2026; update the description to say "Quran recitation and playlists"
