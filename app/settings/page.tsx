"use client";

import DashboardLayout from "../components/DashboardLayout";
import {
    User,
    Shield,
    Bell,
    Palette,
    Globe,
    Key,
    ChevronRight,
    ToggleLeft,
    ToggleRight,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "../i18n/LanguageContext";

interface SettingToggleProps {
    label: string;
    description: string;
    defaultOn?: boolean;
}

function SettingToggle({ label, description, defaultOn = false }: SettingToggleProps) {
    const [on, setOn] = useState(defaultOn);
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 0",
                borderBottom: "1px solid var(--border)",
            }}
        >
            <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "var(--fg-primary)" }}>
                    {label}
                </div>
                <div style={{ fontSize: 12, color: "var(--fg-muted)", marginTop: 2 }}>
                    {description}
                </div>
            </div>
            <button
                onClick={() => setOn(!on)}
                style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: on ? "var(--accent)" : "var(--fg-dim)",
                    display: "flex",
                    alignItems: "center",
                    padding: 0,
                }}
            >
                {on ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
            </button>
        </div>
    );
}

export default function SettingsPage() {
    const { t } = useTranslation();

    const sections = [
        {
            icon: User,
            title: t("settings.profile"),
            description: t("settings.profileDesc"),
        },
        {
            icon: Shield,
            title: t("settings.security"),
            description: t("settings.securityDesc"),
        },
        {
            icon: Key,
            title: t("settings.apiKeys"),
            description: t("settings.apiKeysDesc"),
        },
        {
            icon: Globe,
            title: t("settings.dataSources"),
            description: t("settings.dataSourcesDesc"),
        },
    ];

    return (
        <DashboardLayout title={t("settings.title")} subtitle={t("settings.subtitle")}>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 20,
                }}
            >
                {/* Quick links */}
                <div className="card" style={{ padding: 24 }}>
                    <h3
                        style={{
                            fontSize: 15,
                            fontWeight: 600,
                            color: "var(--fg-primary)",
                            margin: 0,
                            marginBottom: 16,
                        }}
                    >
                        {t("settings.accountSettings")}
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {sections.map((s) => {
                            const Icon = s.icon;
                            return (
                                <button
                                    key={s.title}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 12,
                                        padding: "12px 14px",
                                        background: "transparent",
                                        border: "none",
                                        borderRadius: "var(--radius-md)",
                                        cursor: "pointer",
                                        width: "100%",
                                        textAlign: "left",
                                        transition: "background 0.15s",
                                        color: "var(--fg-primary)",
                                    }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.background = "var(--bg-hover)")
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.background = "transparent")
                                    }
                                >
                                    <div
                                        style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: "var(--radius-md)",
                                            background: "var(--bg-elevated)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <Icon size={16} color="var(--fg-secondary)" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 14, fontWeight: 500 }}>
                                            {s.title}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 12,
                                                color: "var(--fg-muted)",
                                                marginTop: 1,
                                            }}
                                        >
                                            {s.description}
                                        </div>
                                    </div>
                                    <ChevronRight size={16} color="var(--fg-dim)" />
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Notification & Display preferences */}
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div className="card" style={{ padding: 24 }}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                marginBottom: 12,
                            }}
                        >
                            <Bell size={16} color="var(--fg-secondary)" />
                            <h3
                                style={{
                                    fontSize: 15,
                                    fontWeight: 600,
                                    color: "var(--fg-primary)",
                                    margin: 0,
                                }}
                            >
                                {t("settings.notifications")}
                            </h3>
                        </div>
                        <SettingToggle
                            label={t("settings.riskThresholdAlerts")}
                            description={t("settings.riskThresholdAlertsDesc")}
                            defaultOn
                        />
                        <SettingToggle
                            label={t("settings.dailySummary")}
                            description={t("settings.dailySummaryDesc")}
                            defaultOn
                        />
                        <SettingToggle
                            label={t("settings.rebalancingRec")}
                            description={t("settings.rebalancingRecDesc")}
                            defaultOn={false}
                        />
                        <SettingToggle
                            label={t("settings.marketEventAlerts")}
                            description={t("settings.marketEventAlertsDesc")}
                            defaultOn
                        />
                    </div>

                    <div className="card" style={{ padding: 24 }}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                marginBottom: 12,
                            }}
                        >
                            <Palette size={16} color="var(--fg-secondary)" />
                            <h3
                                style={{
                                    fontSize: 15,
                                    fontWeight: 600,
                                    color: "var(--fg-primary)",
                                    margin: 0,
                                }}
                            >
                                {t("settings.display")}
                            </h3>
                        </div>
                        <SettingToggle
                            label={t("settings.darkMode")}
                            description={t("settings.darkModeDesc")}
                            defaultOn
                        />
                        <SettingToggle
                            label={t("settings.compactView")}
                            description={t("settings.compactViewDesc")}
                            defaultOn={false}
                        />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
