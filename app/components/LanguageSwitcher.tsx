"use client";

import { useTranslation, type Locale } from "../i18n/LanguageContext";

const options: { value: Locale; flag: string; label: string }[] = [
    { value: "vi", flag: "🇻🇳", label: "VI" },
    { value: "en", flag: "🇺🇸", label: "EN" },
];

export default function LanguageSwitcher() {
    const { locale, setLocale } = useTranslation();

    return (
        <div
            style={{
                display: "flex",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
                overflow: "hidden",
                fontSize: 12,
                fontWeight: 600,
            }}
        >
            {options.map((opt) => {
                const active = locale === opt.value;
                return (
                    <button
                        key={opt.value}
                        onClick={() => setLocale(opt.value)}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            padding: "6px 10px",
                            border: "none",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                            background: active
                                ? "var(--accent-soft)"
                                : "var(--bg-elevated)",
                            color: active
                                ? "var(--accent)"
                                : "var(--fg-secondary)",
                            borderRight:
                                opt.value === "vi"
                                    ? "1px solid var(--border)"
                                    : "none",
                        }}
                    >
                        <span style={{ fontSize: 14 }}>{opt.flag}</span>
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
}
