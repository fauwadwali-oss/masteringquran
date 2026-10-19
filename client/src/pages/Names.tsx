import { useMemo, useState, type ReactNode } from "react";
import { Info, Search, Sparkles, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import SEO from "@/components/SEO";
import { NAMES, searchNames } from "@/lib/islamic-data";

const SOURCE_LINKS = {
    bukhari: "https://sunnah.com/bukhari:7392",
    muslim: "https://sunnah.com/muslim:2677a",
    tirmidhi: "https://sunnah.com/tirmidhi:3507",
    editions: "https://github.com/fawazahmed0/hadith-api",
};

const namesJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "99 Names of Allah (Asma ul-Husna)",
    description: "The traditional 99-name enumeration in Jami` at-Tirmidhi 3507, with Arabic, transliteration and sourced English renderings.",
    numberOfItems: NAMES.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: NAMES.map(name => ({
        "@type": "ListItem",
        position: name.number,
        url: `https://masteringquran.com/names#name-${name.number}`,
        name: name.transliteration,
        ...(name.english ? { description: name.english } : {}),
    })),
};

const SourceLink = ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium underline decoration-amber-400/70 underline-offset-2 hover:text-amber-700 dark:hover:text-amber-100">
        {children}
    </a>
);

export default function Names() {
    const [search, setSearch] = useState("");
    const filtered = useMemo(() => searchNames(search), [search]);
    const hasQuery = Boolean(search.trim());

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50/30 via-white to-white font-sans dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
            <SEO
                title="99 Names of Allah (Asma ul-Husna) | Mastering Quran"
                description="Explore the traditional 99 Names of Allah list in Arabic with transliteration and sourced English renderings, plus clear notes on the hadith evidence."
                canonicalPath="/names"
                jsonLd={namesJsonLd}
            />
            <section className="px-4 py-10 sm:px-6 sm:py-16">
                <div className="mx-auto max-w-5xl">
                    <header className="mb-8 space-y-3 text-center sm:mb-10">
                        <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 dark:border-amber-800 dark:bg-amber-950/30">
                            <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden />
                            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Asma ul-Husna</span>
                        </div>
                        <h1 className="text-4xl font-bold text-slate-900 md:text-6xl dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                            99 Names of Allah
                        </h1>
                        <p className="font-amiri text-2xl text-amber-700 dark:text-amber-400" lang="ar" dir="rtl">
                            الأسماء الحسنى
                        </p>
                        <blockquote className="mx-auto max-w-2xl text-base text-slate-600 dark:text-slate-300">
                            <p>“And to Allāh belong the best names, so invoke Him by them.”</p>
                            <cite className="mt-1 block text-sm not-italic text-slate-500 dark:text-slate-400">
                                <Link className="underline underline-offset-2 hover:text-amber-700 dark:hover:text-amber-300" to="/quran/7/180">
                                    Quran 7:180
                                </Link>{" "}
                                · Saheeh International
                            </cite>
                        </blockquote>
                    </header>

                    <aside className="mx-auto mb-8 flex max-w-3xl gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-sm leading-relaxed text-amber-950 sm:mb-10 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
                        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                        <div className="space-y-2">
                            <p>
                                <strong>What is this list?</strong> This page presents the traditional enumeration in <SourceLink href={SOURCE_LINKS.tirmidhi}>Jami` at-Tirmidhi 3507</SourceLink>. The
                                hadith that Allah has ninety-nine names is authentic ( <SourceLink href={SOURCE_LINKS.bukhari}>Sahih al-Bukhari 7392</SourceLink> and{" "}
                                <SourceLink href={SOURCE_LINKS.muslim}>Sahih Muslim 2677</SourceLink>
                                ), but those narrations do not enumerate the names.
                            </p>
                            <p>
                                The Tirmidhi enumeration is graded <em>da'if</em> (weak). This page does not claim that Allah's names are limited to only ninety-nine. Each English rendering below
                                identifies its source; where no reliable sourced rendering was available, none is supplied.
                            </p>
                        </div>
                    </aside>

                    <div className="mx-auto mb-8 max-w-md sm:mb-10">
                        <label className="sr-only" htmlFor="name-search">
                            Search the 99 Names of Allah
                        </label>
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
                            <Input
                                id="name-search"
                                type="text"
                                role="searchbox"
                                inputMode="search"
                                autoComplete="off"
                                spellCheck={false}
                                placeholder="Search Arabic, name, number, or meaning…"
                                value={search}
                                onChange={event => setSearch(event.target.value)}
                                aria-describedby="name-search-help name-search-status"
                                className="h-11 rounded-xl bg-white pl-10 pr-10 dark:bg-slate-800"
                            />
                            {hasQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearch("")}
                                    className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:hover:bg-slate-700 dark:hover:text-white"
                                    aria-label="Clear search"
                                >
                                    <X className="h-4 w-4" aria-hidden />
                                </button>
                            )}
                        </div>
                        <p id="name-search-help" className="sr-only">
                            Searches Arabic text, transliteration without requiring accent marks, name number, and English rendering.
                        </p>
                    </div>

                    <p id="name-search-status" role="status" aria-live="polite" className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                        {filtered.length} of {NAMES.length} {filtered.length === 1 ? "name" : "names"}
                    </p>

                    {filtered.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {filtered.map(name => (
                                <article id={`name-${name.number}`} key={name.number} className="scroll-mt-24">
                                    <Card className="h-full border border-amber-100 bg-gradient-to-br from-white to-amber-50/40 transition-shadow hover:shadow-lg dark:border-amber-900/30 dark:from-slate-900 dark:to-amber-950/10">
                                        <CardContent className="space-y-3 p-5">
                                            <div className="flex items-start justify-between gap-4">
                                                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                                                    {name.number}
                                                </span>
                                                <p className="font-amiri text-right text-3xl leading-tight text-amber-800 dark:text-amber-300" lang="ar" dir="rtl">
                                                    {name.arabic}
                                                </p>
                                            </div>
                                            <div>
                                                <h2 className="font-semibold italic text-slate-900 dark:text-white">{name.transliteration}</h2>
                                                {name.english && <p className="text-sm font-medium text-amber-700 dark:text-amber-400">{name.english}</p>}
                                            </div>
                                            {name.explanation && <blockquote className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">“{name.explanation}”</blockquote>}
                                            <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">Source: {name.englishSource ?? "No reliable sourced English rendering"}</p>
                                        </CardContent>
                                    </Card>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-amber-200 bg-white/70 px-6 py-12 text-center dark:border-amber-900/50 dark:bg-slate-900/70">
                            <p className="font-medium text-slate-900 dark:text-white">No names match “{search.trim()}”.</p>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Try a name, Arabic text, a number from 1–99, or an English meaning.</p>
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                className="mt-4 rounded-lg border border-amber-300 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:border-amber-800 dark:text-amber-300 dark:hover:bg-amber-950/40"
                            >
                                Show all 99 names
                            </button>
                        </div>
                    )}

                    <p className="mx-auto mt-12 max-w-3xl text-center text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                        Source note: the Arabic list and most English renderings come from the public-domain Arabic and English editions of{" "}
                        <SourceLink href={SOURCE_LINKS.tirmidhi}>Jami` at-Tirmidhi 3507</SourceLink>, distributed through the <SourceLink href={SOURCE_LINKS.editions}>hadith-api editions</SourceLink>.
                        Where marked, the page quotes Saheeh International or Sahih Muslim 2713.
                    </p>
                </div>
            </section>
        </div>
    );
}
