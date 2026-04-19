import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Site-wide keyboard shortcuts. Ignored while the user is typing.
// g+h: home · g+q: quran · g+a: ask ai · g+t: topics · /: focus search · ?: show help

export default function KeyboardShortcutsProvider() {
    const navigate = useNavigate();

    useEffect(() => {
        let lastG = 0;
        const handler = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement | null;
            const tag = target?.tagName;
            if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) return;
            if (e.metaKey || e.ctrlKey || e.altKey) return;

            const key = e.key.toLowerCase();
            const now = Date.now();

            if (key === "g") {
                lastG = now;
                return;
            }

            // Two-key "g + X" navigation (within 1 second)
            if (now - lastG < 1000) {
                lastG = 0;
                const map: Record<string, string> = {
                    h: "/",
                    q: "/quran",
                    a: "/ask",
                    t: "/topics",
                    d: "/duas",
                    p: "/prayer-times",
                    c: "/calendar",
                    r: "/ramadan",
                    n: "/names",
                    b: "/hadith",
                };
                if (map[key]) {
                    e.preventDefault();
                    navigate(map[key]);
                    return;
                }
            }

            if (key === "/") {
                const input = document.querySelector<HTMLInputElement>('input[placeholder*="Search"], input[placeholder*="search"]');
                if (input) {
                    e.preventDefault();
                    input.focus();
                    input.select?.();
                }
            }

            if (e.key === "?") {
                window.dispatchEvent(new CustomEvent("mq-show-shortcuts"));
            }
        };

        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [navigate]);

    return null;
}
