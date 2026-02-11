"use client";

import { Bell, Search } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "../i18n/LanguageContext";

interface TopNavProps {
    title: string;
    subtitle?: string;
}

export default function TopNav({ title, subtitle }: TopNavProps) {
    const { t } = useTranslation();

    return (
        <header
            style={{
                height: "var(--topbar-h)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 32px",
                borderBottom: "1px solid var(--border)",
                background: "rgba(11, 17, 32, 0.6)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                position: "sticky",
                top: 0,
                zIndex: 30,
            }}
        >
            {/* Left */}
            <div>
                <h1
                    style={{
                        fontSize: 20,
                        fontWeight: 700,
                        letterSpacing: "-0.01em",
                        color: "var(--fg-primary)",
                        margin: 0,
                    }}
                >
                    {title}
                </h1>
                {subtitle && (
                    <p
                        style={{
                            fontSize: 13,
                            color: "var(--fg-muted)",
                            margin: 0,
                            marginTop: 1,
                        }}
                    >
                        {subtitle}
                    </p>
                )}
            </div>

            {/* Right */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {/* Search */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "7px 14px",
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-md)",
                        fontSize: 13,
                        color: "var(--fg-muted)",
                        cursor: "pointer",
                        minWidth: 200,
                    }}
                >
                    <Search size={14} />
                    <span>{t("nav.search")}</span>
                    <span
                        style={{
                            marginLeft: "auto",
                            fontSize: 11,
                            padding: "1px 6px",
                            background: "var(--bg-hover)",
                            borderRadius: 4,
                            color: "var(--fg-dim)",
                        }}
                    >
                        ⌘K
                    </span>
                </div>

                {/* Language Switcher */}
                <LanguageSwitcher />

                {/* Notifications */}
                <button
                    style={{
                        width: 36,
                        height: 36,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border)",
                        background: "var(--bg-elevated)",
                        color: "var(--fg-secondary)",
                        cursor: "pointer",
                        position: "relative",
                    }}
                >
                    <Bell size={16} />
                    <span
                        style={{
                            position: "absolute",
                            top: 6,
                            right: 7,
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            background: "var(--risk-high)",
                            border: "2px solid var(--bg-elevated)",
                        }}
                    />
                </button>
            </div>
        </header>
    );
}
