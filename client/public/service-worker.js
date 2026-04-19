// Mastering Quran — service worker
// Handles Web Push delivery for the "verse a day" feature.
// Kept deliberately minimal: no network caching yet (avoids stale-asset pitfalls
// on Cloudflare Pages). Caching can be layered in later if we need offline.

const CACHE_NAME = "mq-shell-v1";

self.addEventListener("install", (event) => {
    // Activate immediately on update
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});

// Push payload shape we send from the server:
// {
//   "title": "Quran 2:255",
//   "body": "Allah — there is no deity except Him…",
//   "url": "/quran?verse=2:255"
// }
self.addEventListener("push", (event) => {
    let data = { title: "Mastering Quran", body: "A new verse is ready.", url: "/" };
    try {
        if (event.data) data = { ...data, ...event.data.json() };
    } catch (e) {
        // If it's a plain text payload, use it as the body
        try { data.body = event.data.text(); } catch {}
    }
    const options = {
        body: data.body,
        icon: "/MQ_shield_logo.png",
        badge: "/MQ_shield_logo.png",
        data: { url: data.url || "/" },
        tag: "mq-daily-verse",
        renotify: true,
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const url = event.notification.data?.url || "/";
    event.waitUntil(
        self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
            for (const client of list) {
                if ("focus" in client) {
                    client.navigate(url);
                    return client.focus();
                }
            }
            if (self.clients.openWindow) return self.clients.openWindow(url);
        }),
    );
});
