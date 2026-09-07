const KEY = "mq-auth-return";

export function safeReturnPath(value: unknown): string {
    if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || /[\\\x00-\x20]/.test(value)) return "/";
    const url = new URL(value, "https://masteringquran.com");
    return url.origin === "https://masteringquran.com" && url.pathname !== "/auth/callback" ? url.pathname + url.search + url.hash : "/";
}

export function rememberAuthReturn(path: string) {
    try { localStorage.setItem(KEY, JSON.stringify({ path: safeReturnPath(path), expires: Date.now() + 60 * 60 * 1000 })); } catch { /* Sign-in still works without storage. */ }
}

export function consumeAuthReturn(): string {
    try {
        const raw = localStorage.getItem(KEY);
        localStorage.removeItem(KEY);
        const saved = raw ? JSON.parse(raw) : null;
        return saved?.expires > Date.now() ? safeReturnPath(saved.path) : "/";
    } catch { return "/"; }
}
