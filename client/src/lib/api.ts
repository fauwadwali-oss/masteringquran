// The iOS/Android apps serve the site from a local origin (capacitor://localhost,
// https://localhost), so server routes must use the live site's address there.
const SITE_ORIGIN = "https://masteringquran.com";

function isNativePlatform(): boolean {
    const capacitor = (window as typeof window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
    return Boolean(capacitor?.isNativePlatform?.());
}

/** URL for a Cloudflare Pages Function such as "/api/ask", on web and in the apps. */
export function apiUrl(path: string): string {
    return isNativePlatform() ? `${SITE_ORIGIN}${path}` : path;
}
