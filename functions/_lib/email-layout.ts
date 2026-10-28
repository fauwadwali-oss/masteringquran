// Shared HTML shell for Mastering Quran emails. Table layout and inline styles
// so it renders in Gmail, Outlook and Apple Mail. Keep copy free of em dashes.

export interface EmailParts {
    preheader: string;
    heading: string;
    paragraphs: string[];
    button?: { label: string; url: string };
    afterButton?: string[];
    footerNote: string;
}

const SITE = "https://masteringquran.com";

export function renderEmail(parts: EmailParts): string {
    const p = (text: string) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#334155;">${text}</p>`;
    const button = parts.button
        ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;"><tr><td style="border-radius:10px;background:#059669;">
<a href="${parts.button.url}" style="display:inline-block;padding:14px 28px;font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px;">${parts.button.label}</a>
</td></tr></table>`
        : "";
    return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${parts.heading}</title></head>
<body style="margin:0;padding:0;background:#f6f3ec;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;">${parts.preheader}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f3ec;padding:32px 16px;"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e7e2d6;">
<tr><td style="background:#064e3b;padding:24px 32px;">
<a href="${SITE}" style="text-decoration:none;"><img src="${SITE}/MQ_shield_logo.png" width="40" height="40" alt="" style="vertical-align:middle;border:0;">
<span style="vertical-align:middle;margin-left:10px;font-size:18px;font-weight:700;color:#ffffff;">Mastering Quran</span></a>
</td></tr>
<tr><td style="padding:32px;">
<h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:#0f172a;">${parts.heading}</h1>
${parts.paragraphs.map(p).join("\n")}
${button}
${(parts.afterButton ?? []).map((t) => `<p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#64748b;">${t}</p>`).join("\n")}
</td></tr>
<tr><td style="padding:20px 32px;background:#faf8f3;border-top:1px solid #eee8db;font-size:12px;line-height:1.6;color:#94a3b8;">
${parts.footerNote}<br>
<a href="${SITE}" style="color:#059669;text-decoration:none;">masteringquran.com</a> &middot; <a href="${SITE}/privacy" style="color:#94a3b8;">Privacy</a>
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}
