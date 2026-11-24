// Cloudflare Pages Function: revokes Sign in with Apple access just before an account is deleted.
import { appleConfigured, revokeApple, type AppleEnv } from "../_lib/apple";
import { getSupabaseUser, jsonResponse as json, preflight, type SupabaseEnv } from "../_lib/auth";

type Env = SupabaseEnv & AppleEnv;

export const onRequestOptions: PagesFunction<Env> = async ({ request }) => preflight(request);

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
    const user = await getSupabaseUser(request, env);
    if (!user) return json(request, 401, { error: "invalid token" });
    const sub = user.identities?.find((i) => i.provider === "apple")?.identity_data?.sub;
    if (!sub) return json(request, 400, { error: "no Apple sign-in on this account" });
    if (!appleConfigured(env)) return json(request, 503, { error: "not configured" });
    const body = (await request.json().catch(() => null)) as { code?: unknown } | null;
    const code = typeof body?.code === "string" ? body.code : "";
    if (!code || code.length > 2000) return json(request, 400, { error: "missing code" });
    try {
        const result = await revokeApple(env, code, sub);
        return json(request, result === "revoked" ? 200 : result === "wrong_account" ? 409 : 502, { result });
    } catch (e) {
        console.error("apple revoke failed", e);
        return json(request, 502, { error: "revoke failed" });
    }
};
