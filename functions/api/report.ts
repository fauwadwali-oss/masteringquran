// Cloudflare Pages Function: a reader reports an Ask Wali answer without leaving the app.
// The report is saved first, then emailed to the owner.
import { bearerToken, getSupabaseUser, jsonResponse as json, preflight, supabaseConfig, type SupabaseEnv } from "../_lib/auth";
import { parseReport, REPORT_REASONS } from "../_lib/report-input";

interface Env extends SupabaseEnv {
    RESEND_API_KEY?: string;
    WELCOME_FROM?: string;
    REPORT_TO?: string;
}

export const onRequestOptions: PagesFunction<Env> = async ({ request }) => preflight(request);

export const onRequestPost: PagesFunction<Env> = async ({ request, env, waitUntil }) => {
    const user = await getSupabaseUser(request, env);
    if (!user) return json(request, 401, { error: "Please sign in again." });
    const report = parseReport(await request.text());
    if (!report) return json(request, 400, { error: "That report could not be read." });

    const { url, anonKey } = supabaseConfig(env);
    const saved = await fetch(`${url}/rest/v1/rpc/mq_report_answer`, {
        method: "POST",
        headers: { apikey: anonKey, Authorization: `Bearer ${bearerToken(request)}`, "Content-Type": "application/json" },
        body: JSON.stringify({ p_reason: report.reason, p_details: report.details, p_question: report.question, p_answer: report.answer }),
    }).catch(() => null);
    if (!saved?.ok) return json(request, 502, { error: "Your report could not be sent. Please try again." });
    const id = (await saved.json()) as string | null;
    if (!id) return json(request, 429, { error: "You have sent 10 reports today. Please email us if there is more." });

    if (env.RESEND_API_KEY) {
        const text = [
            `Reason: ${REPORT_REASONS[report.reason]}`,
            `Details: ${report.details || "(none)"}`,
            `Report: ${id}`,
            `Account: ${user.id}`,
            `\nQUESTION\n${report.question}`,
            `\nANSWER\n${report.answer}`,
        ].join("\n");
        waitUntil(
            fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": `ai-report-${id}` },
                body: JSON.stringify({
                    from: env.WELCOME_FROM || "Mastering Quran <hello@masteringquran.com>",
                    to: [env.REPORT_TO || "fauwad@nusratwaliventures.com"],
                    subject: `Ask Wali report: ${REPORT_REASONS[report.reason]}`,
                    text,
                }),
            }).then((r) => {
                if (!r.ok) console.error("report email failed", r.status, id);
            }).catch((e) => console.error("report email failed", id, e)),
        );
    }
    return json(request, 200, { ok: true });
};
