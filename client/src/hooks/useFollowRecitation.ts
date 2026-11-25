import { useCallback, useEffect, useRef, useState } from "react";

/** The part of the screen between the sticky header and the player bar. */
export interface ReadingArea {
    top: number;
    bottom: number;
}

const SETTLE_MS = 160;
const GAP = 12;
const SCROLL_KEYS = new Set(["PageUp", "PageDown", "Home", "End", "ArrowUp", "ArrowDown", " "]);

export const isInView = (box: ReadingArea, area: ReadingArea, least = 60) =>
    Math.min(box.bottom, area.bottom) - Math.max(box.top, area.top) >= Math.min(least, box.bottom - box.top);

export const fitsInView = (box: ReadingArea, area: ReadingArea) => box.top >= area.top && box.bottom <= area.bottom;

const reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

function readingArea(bar: HTMLElement | null): ReadingArea {
    const header = document.querySelector("nav.sticky")?.getBoundingClientRect().bottom ?? 0;
    return { top: Math.max(0, header) + GAP, bottom: (bar?.getBoundingClientRect().top ?? window.innerHeight) - GAP };
}

/**
 * Keeps the verse being recited on screen. Scrolling away pauses following until the reader
 * scrolls back to the verse, presses play, or chooses to return.
 * `verseId` is the DOM id of the verse being recited; `ready` changes when the verses are redrawn.
 */
export function useFollowRecitation(
    verseId: string | null,
    ready: unknown,
    barRef: { current: HTMLElement | null },
    startFollowing: boolean,
) {
    const following = useRef(startFollowing);
    const [away, setAway] = useState(false);
    const id = useRef(verseId);
    id.current = verseId;
    // True while the page is moving because of us rather than the reader.
    const ours = useRef(false);
    const readerScrolling = useRef(false);
    const touching = useRef(false);
    const keepIfVisible = useRef(false);
    const settleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const target = () => (id.current ? document.getElementById(id.current) : null);

    const bringIntoView = useCallback((force = false) => {
        const el = target();
        // A dialog owns the screen: the next verse, or closing it, catches up.
        if (!el || document.body.hasAttribute("data-scroll-locked")) return;
        const area = readingArea(barRef.current);
        const box = el.getBoundingClientRect();
        if (!force && fitsInView(box, area)) return;
        const distance = box.top - area.top;
        if (Math.abs(distance) < 2) return;
        ours.current = true;
        const smooth = !reducedMotion() && !document.hidden && Math.abs(distance) < window.innerHeight * 2;
        window.scrollBy({ top: distance, behavior: smooth ? "smooth" : "instant" });
    }, [barRef]);

    const settle = useCallback(() => {
        clearTimeout(settleTimer.current);
        settleTimer.current = setTimeout(() => {
            if (touching.current) return;
            const el = target();
            const wasOurs = ours.current;
            ours.current = false;
            readerScrolling.current = false;
            if (!el) return;
            const area = readingArea(barRef.current);
            const box = el.getBoundingClientRect();
            if (wasOurs) {
                // Verses drawn during the scroll can change height, so land on the right spot.
                if (following.current && !isInView(box, area)) bringIntoView(true);
                return;
            }
            following.current = isInView(box, area);
            setAway(!following.current);
        }, SETTLE_MS);
    }, [barRef, bringIntoView]);

    useEffect(() => {
        const byReader = () => {
            ours.current = false;
            readerScrolling.current = true;
            settle();
        };
        const onKey = (e: KeyboardEvent) => {
            const el = e.target as HTMLElement | null;
            if (SCROLL_KEYS.has(e.key) && !el?.closest("input, textarea, select, button, [role=listbox], [role=menu], [contenteditable=true]")) byReader();
        };
        const onTouchMove = () => {
            touching.current = true;
            byReader();
        };
        const onTouchEnd = () => {
            touching.current = false;
            if (readerScrolling.current) settle();
        };
        const opts = { passive: true } as const;
        window.addEventListener("wheel", byReader, opts);
        window.addEventListener("touchmove", onTouchMove, opts);
        window.addEventListener("touchend", onTouchEnd, opts);
        window.addEventListener("touchcancel", onTouchEnd, opts);
        window.addEventListener("keydown", onKey);
        window.addEventListener("scroll", settle, opts);
        return () => {
            clearTimeout(settleTimer.current);
            window.removeEventListener("wheel", byReader);
            window.removeEventListener("touchmove", onTouchMove);
            window.removeEventListener("touchend", onTouchEnd);
            window.removeEventListener("touchcancel", onTouchEnd);
            window.removeEventListener("keydown", onKey);
            window.removeEventListener("scroll", settle);
        };
    }, [settle]);

    useEffect(() => {
        if (!verseId) {
            setAway(false);
            return;
        }
        const frame = requestAnimationFrame(() => {
            if (following.current) {
                // Never pull the page while the reader is moving it.
                if (!readerScrolling.current) bringIntoView(!keepIfVisible.current);
                keepIfVisible.current = false;
                setAway(false);
                return;
            }
            const el = target();
            if (!el) return;
            // Recitation reached what the reader is looking at: pick up following again.
            const inView = isInView(el.getBoundingClientRect(), readingArea(barRef.current));
            if (inView) following.current = true;
            setAway(!inView);
        });
        return () => cancelAnimationFrame(frame);
    }, [verseId, ready, barRef, bringIntoView]);

    // Audio continues while the phone is locked: catch up when the page is seen again.
    useEffect(() => {
        const onVisible = () => {
            if (!document.hidden && following.current) requestAnimationFrame(() => bringIntoView());
        };
        document.addEventListener("visibilitychange", onVisible);
        return () => document.removeEventListener("visibilitychange", onVisible);
    }, [bringIntoView]);

    /** The reader pressed play on a verse: follow from there, without moving a verse already in view. */
    const startFollow = useCallback(() => {
        following.current = true;
        readerScrolling.current = false;
        keepIfVisible.current = true;
        setAway(false);
        bringIntoView();
    }, [bringIntoView]);

    const returnToVerse = useCallback(() => {
        following.current = true;
        readerScrolling.current = false;
        setAway(false);
        bringIntoView(true);
    }, [bringIntoView]);

    return { away: away && verseId !== null, startFollow, returnToVerse };
}
