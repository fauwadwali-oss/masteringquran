// Static prayer-time pages: /prayer-times (all cities by country) and one page per
// city flagged in client/public/data/cities.json. Uses the same client code as the
// app (client/src/lib/prayer.ts, bundled for Node) so titles and times match.
//
// The timetable on each page is for the month of the build. The app recalculates
// live on load, so visitors always see today; rebuild monthly to keep crawlers fresh.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

export async function renderPrayerPages({ ROOT, ORIGIN, template, setHead, setBody, esc, write }) {
    const bundle = path.join(os.tmpdir(), `mq-prayer-lib-${process.pid}.mjs`);
    await build({
        entryPoints: [path.join(ROOT, "client", "src", "lib", "prayer.ts")],
        bundle: true,
        platform: "node",
        format: "esm",
        outfile: bundle,
        logLevel: "silent",
    });
    const P = await import(pathToFileURL(bundle).href);
    fs.rmSync(bundle, { force: true });

    const rows = JSON.parse(fs.readFileSync(path.join(ROOT, "client", "public", "data", "cities.json"), "utf8"));
    const cities = rows.map(([slug, name, region, cc, lat, lon, tz, pop, page]) => ({
        slug, name, region, countryCode: cc, latitude: lat, longitude: lon, timeZone: tz, population: pop, hasPage: page === 1,
    }));
    const paged = cities.filter((c) => c.hasPage);
    const byCountry = new Map();
    for (const c of paged) {
        if (!byCountry.has(c.countryCode)) byCountry.set(c.countryCode, []);
        byCountry.get(c.countryCode).push(c);
    }

    const now = new Date();
    const methodLabel = (id) => P.METHODS.find((m) => m.id === id)?.label ?? id;
    const sitemap = [];

    for (const c of paged) {
        const pathname = `/prayer-times/${c.slug}`;
        const settings = P.defaultSettings(c.countryCode);
        const [y, m] = P.ymdInZone(now, c.timeZone);
        const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
        const monthName = new Date(Date.UTC(y, m - 1, 15)).toLocaleDateString("en-US", { timeZone: "UTC", month: "long", year: "numeric" });
        const t = (d) => P.formatTime(d, c.timeZone, settings.hour12);
        const tableRows = Array.from({ length: days }, (_, i) => {
            const x = P.timesFor(c, settings, [y, m, i + 1]);
            const label = new Date(Date.UTC(y, m - 1, i + 1, 12)).toLocaleDateString("en-US", { timeZone: "UTC", weekday: "short", month: "short", day: "numeric" });
            return `<tr><td>${label}</td>${P.PRAYERS.map((k) => `<td>${t(x[k])}</td>`).join("")}</tr>`;
        }).join("");
        const qibla = P.qiblaBearing(c.latitude, c.longitude);
        const nearby = (byCountry.get(c.countryCode) || []).filter((o) => o.slug !== c.slug).slice(0, 10);

        const body =
            `<nav><a href="/">Mastering Quran</a> / <a href="/prayer-times">Prayer times</a> / ${esc(c.name)}</nav>` +
            `<h1>Prayer times in ${esc(c.name)}</h1>` +
            `<p class="meta">${esc(P.placeLabel(c))} · ${esc(c.timeZone.replace(/_/g, " "))} · ${esc(methodLabel(settings.method))} · ${settings.madhab === "Hanafi" ? "Hanafi Asr" : "Standard Asr"}</p>` +
            `<section><h2>${esc(c.name)} prayer timetable, ${monthName}</h2><div style="overflow-x:auto"><table><thead><tr><th>Date</th>${P.PRAYERS.map((k) => `<th>${P.PRAYER_LABELS[k]}</th>`).join("")}</tr></thead><tbody>${tableRows}</tbody></table></div></section>` +
            `<section><h2>Qibla direction from ${esc(c.name)}</h2><p>${qibla.toFixed(1)}° from true north. <a href="/qibla">Open the Qibla finder</a>.</p></section>` +
            (nearby.length
                ? `<section><h2>More cities in ${esc(P.countryName(c.countryCode))}</h2><p>${nearby.map((o) => `<a href="/prayer-times/${o.slug}">${esc(o.name)}</a>`).join(" · ")}</p></section>`
                : "") +
            `<p class="src">Calculated with the open-source adhan library. City data from GeoNames. Your local mosque's timetable may differ by a few minutes.</p>`;

        write(
            `prayer-times/${c.slug}.html`,
            setBody(
                setHead(template, {
                    title: P.cityTitle(c),
                    description: P.cityDescription(c),
                    pathname,
                    jsonLd: {
                        "@context": "https://schema.org",
                        "@type": "BreadcrumbList",
                        itemListElement: [
                            { "@type": "ListItem", position: 1, name: "Prayer times", item: `${ORIGIN}/prayer-times` },
                            { "@type": "ListItem", position: 2, name: c.name, item: `${ORIGIN}${pathname}` },
                        ],
                    },
                }),
                body,
            ),
        );
        sitemap.push(`  <url><loc>${ORIGIN}${pathname}</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>`);
    }

    // Hub page: every city with a page, grouped by country, biggest countries first.
    const countries = [...byCountry.entries()].sort((a, b) => b[1].length - a[1].length || P.countryName(a[0]).localeCompare(P.countryName(b[0])));
    const hubBody =
        `<nav><a href="/">Mastering Quran</a> / Prayer times</nav>` +
        `<h1>Prayer Times</h1>` +
        `<p class="meta">Fajr, Sunrise, Dhuhr, Asr, Maghrib and Isha for ${paged.length} cities, calculated with the method mosques in each country usually use.</p>` +
        countries
            .map(([cc, list]) => `<section><h2>${esc(P.countryName(cc))}</h2><p>${list.map((o) => `<a href="/prayer-times/${o.slug}">${esc(o.name)}</a>`).join(" · ")}</p></section>`)
            .join("");
    write("prayer-times.html", setBody(setHead(template, { title: P.HUB_TITLE, description: P.HUB_DESCRIPTION, pathname: "/prayer-times" }), hubBody));

    return { sitemap, staticRoutes: new Set(["/prayer-times"]), count: paged.length };
}
