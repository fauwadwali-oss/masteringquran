import { useEffect } from "react";

interface SEOProps {
    title: string;
    description: string;
    canonicalPath?: string;
}

function upsertMeta(selector: string, attr: "name" | "property", key: string, content: string) {
    let meta = document.querySelector(selector);
    if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attr, key);
        document.head.appendChild(meta);
    }
    meta.setAttribute("content", content);
}

export default function SEO({ title, description, canonicalPath }: SEOProps) {
    useEffect(() => {
        document.title = title;

        upsertMeta('meta[name="description"]', "name", "description", description);
        upsertMeta('meta[property="og:title"]', "property", "og:title", title);
        upsertMeta('meta[property="og:description"]', "property", "og:description", description);
        upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", title);
        upsertMeta('meta[name="twitter:description"]', "name", "twitter:description", description);

        const canonicalUrl = `https://masteringquran.com${canonicalPath || window.location.pathname}`;
        let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
        if (!canonical) {
            canonical = document.createElement("link");
            canonical.setAttribute("rel", "canonical");
            document.head.appendChild(canonical);
        }
        canonical.setAttribute("href", canonicalUrl);
        upsertMeta('meta[property="og:url"]', "property", "og:url", canonicalUrl);
    }, [title, description, canonicalPath]);

    return null;
}
