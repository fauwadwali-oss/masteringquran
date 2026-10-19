const ENDPOINT = 'https://msdrills.com/site-monitoring/api/events';

async function stableSubscriptionEventId(userId: string): Promise<string> {
    const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`masteringquran:daily_email_subscribed:${userId}`)));
    digest[6] = (digest[6] & 0x0f) | 0x50;
    digest[8] = (digest[8] & 0x3f) | 0x80;
    const hex = Array.from(digest.slice(0, 16), (value) => value.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function trackDailyEmailSubscription(userId: string): void {
    void (async () => {
        try {
            const body = JSON.stringify({
                site_id: 'masteringquran',
                event_name: 'daily_email_subscribed',
                event_id: await stableSubscriptionEventId(userId),
            });
            const blob = new Blob([body], { type: 'text/plain' });
            if (navigator.sendBeacon?.(ENDPOINT, blob)) return;
            await fetch(ENDPOINT, { method: 'POST', body, headers: { 'content-type': 'text/plain' }, keepalive: true });
        } catch {
            // Measurement must never interrupt subscription setup.
        }
    })();
}
