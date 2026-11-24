// Sign in with Apple: exchange a fresh authorization code and revoke the app's access,
// which Apple requires when an account that used it is deleted.

export interface AppleEnv {
    APPLE_TEAM_ID?: string;
    APPLE_KEY_ID?: string;
    /** Contents of the .p8 key. */
    APPLE_PRIVATE_KEY?: string;
    APPLE_CLIENT_ID?: string;
}

const DEFAULT_CLIENT_ID = "com.nusratwaliventures.masteringquran";

const b64url = (data: ArrayBuffer | Uint8Array | string): string => {
    const bytes = typeof data === "string" ? new TextEncoder().encode(data) : new Uint8Array(data as ArrayBuffer);
    let bin = "";
    for (const b of bytes) bin += String.fromCharCode(b);
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

export async function appleClientSecret(env: AppleEnv, now = Date.now()): Promise<string> {
    const der = Uint8Array.from(atob(env.APPLE_PRIVATE_KEY!.replace(/-----[^-]+-----|\s|\\n/g, "")), (c) => c.charCodeAt(0));
    const key = await crypto.subtle.importKey("pkcs8", der, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
    const iat = Math.floor(now / 1000);
    const unsigned = [
        { alg: "ES256", kid: env.APPLE_KEY_ID },
        { iss: env.APPLE_TEAM_ID, iat, exp: iat + 300, aud: "https://appleid.apple.com", sub: env.APPLE_CLIENT_ID || DEFAULT_CLIENT_ID },
    ].map((part) => b64url(JSON.stringify(part))).join(".");
    const signature = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, new TextEncoder().encode(unsigned));
    return `${unsigned}.${b64url(signature)}`;
}

export const appleConfigured = (env: AppleEnv) => Boolean(env.APPLE_TEAM_ID && env.APPLE_KEY_ID && env.APPLE_PRIVATE_KEY);

/** True when Apple confirmed the access was revoked. */
export async function revokeApple(env: AppleEnv, code: string): Promise<boolean> {
    const credentials = { client_id: env.APPLE_CLIENT_ID || DEFAULT_CLIENT_ID, client_secret: await appleClientSecret(env) };
    const exchange = await fetch("https://appleid.apple.com/auth/token", {
        method: "POST",
        body: new URLSearchParams({ ...credentials, code, grant_type: "authorization_code" }),
    });
    if (!exchange.ok) return false;
    const { refresh_token } = (await exchange.json()) as { refresh_token?: string };
    if (!refresh_token) return false;
    const revoke = await fetch("https://appleid.apple.com/auth/revoke", {
        method: "POST",
        body: new URLSearchParams({ ...credentials, token: refresh_token, token_type_hint: "refresh_token" }),
    });
    return revoke.ok;
}
