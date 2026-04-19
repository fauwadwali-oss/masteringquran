import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type FontSize = "sm" | "md" | "lg" | "xl";

interface PrefContext {
    fontSize: FontSize;
    setFontSize: (s: FontSize) => void;
}

const Ctx = createContext<PrefContext | null>(null);

const FONT_SCALES: Record<FontSize, number> = { sm: 0.9, md: 1.0, lg: 1.1, xl: 1.25 };

export default function UserPreferences({ children }: { children: ReactNode }) {
    const [fontSize, setFontSizeState] = useState<FontSize>(() => {
        if (typeof window === "undefined") return "md";
        return (localStorage.getItem("fontSize") as FontSize) || "md";
    });

    useEffect(() => {
        const scale = FONT_SCALES[fontSize] ?? 1.0;
        document.documentElement.style.setProperty("--app-font-scale", String(scale));
        localStorage.setItem("fontSize", fontSize);
    }, [fontSize]);

    return <Ctx.Provider value={{ fontSize, setFontSize: setFontSizeState }}>{children}</Ctx.Provider>;
}

export function useUserPreferences() {
    const c = useContext(Ctx);
    if (!c) throw new Error("useUserPreferences inside UserPreferences");
    return c;
}
