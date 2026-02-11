"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from "react";
import en from "./en.json";
import vi from "./vi.json";

export type Locale = "en" | "vi";

const translations: Record<Locale, Record<string, unknown>> = { en, vi };

interface LanguageContextType {
    locale: Locale;
    setLocale: (l: Locale) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
    locale: "vi",
    setLocale: () => {},
    t: (key: string) => key,
});

/**
 * Resolve a dot-separated key like "nav.overview" from a nested object.
 */
function resolve(obj: Record<string, unknown>, path: string): string {
    const parts = path.split(".");
    let current: unknown = obj;
    for (const part of parts) {
        if (current && typeof current === "object" && part in (current as Record<string, unknown>)) {
            current = (current as Record<string, unknown>)[part];
        } else {
            return path; // fallback: return the key itself
        }
    }
    return typeof current === "string" ? current : path;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>("vi");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("corriva-locale") as Locale | null;
        if (saved && (saved === "en" || saved === "vi")) {
            setLocaleState(saved);
        }
        setMounted(true);
    }, []);

    const setLocale = useCallback((l: Locale) => {
        setLocaleState(l);
        localStorage.setItem("corriva-locale", l);
        document.documentElement.lang = l;
    }, []);

    const t = useCallback(
        (key: string) => resolve(translations[locale], key),
        [locale]
    );

    // Avoid hydration mismatch — render nothing visible until mounted
    if (!mounted) {
        return (
            <LanguageContext.Provider value={{ locale: "vi", setLocale, t }}>
                {children}
            </LanguageContext.Provider>
        );
    }

    return (
        <LanguageContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useTranslation() {
    return useContext(LanguageContext);
}
