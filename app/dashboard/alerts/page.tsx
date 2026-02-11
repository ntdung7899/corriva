"use client";

import DashboardLayout from "../../components/DashboardLayout";
import {
    AlertTriangle,
    TrendingUp,
    ShieldAlert,
    Info,
    CheckCircle2,
    Clock,
} from "lucide-react";
import { useTranslation } from "../../i18n/LanguageContext";

const typeStyles: Record<string, { color: string; bg: string }> = {
    critical: { color: "var(--risk-high)", bg: "var(--risk-high-soft)" },
    warning: { color: "var(--warning)", bg: "var(--warning-soft)" },
    info: { color: "var(--accent)", bg: "var(--accent-soft)" },
    success: { color: "var(--risk-low)", bg: "var(--risk-low-soft)" },
};

export default function AlertsPage() {
    const { t } = useTranslation();

    const alerts = [
        {
            id: 1,
            type: "critical",
            title: t("alerts.techOverexposure"),
            message: t("alerts.techOverexposureMsg"),
            time: t("alerts.12minAgo"),
            icon: AlertTriangle,
            read: false,
        },
        {
            id: 2,
            type: "warning",
            title: t("alerts.volatilitySpike"),
            message: t("alerts.volatilitySpikeMsg"),
            time: t("alerts.2hoursAgo"),
            icon: TrendingUp,
            read: false,
        },
        {
            id: 3,
            type: "critical",
            title: t("alerts.varBreach"),
            message: t("alerts.varBreachMsg"),
            time: t("alerts.5hoursAgo"),
            icon: ShieldAlert,
            read: false,
        },
        {
            id: 4,
            type: "info",
            title: t("alerts.correlationUpdate"),
            message: t("alerts.correlationUpdateMsg"),
            time: t("alerts.1dayAgo"),
            icon: Info,
            read: true,
        },
        {
            id: 5,
            type: "success",
            title: t("alerts.rebalancingComplete"),
            message: t("alerts.rebalancingCompleteMsg"),
            time: t("alerts.2daysAgo"),
            icon: CheckCircle2,
            read: true,
        },
        {
            id: 6,
            type: "info",
            title: t("alerts.monthlyReport"),
            message: t("alerts.monthlyReportMsg"),
            time: t("alerts.3daysAgo"),
            icon: Info,
            read: true,
        },
    ];

    const filterTabs = [
        t("alerts.all"),
        t("alerts.critical"),
        t("alerts.warnings"),
        t("alerts.info"),
    ];

    return (
        <DashboardLayout title={t("alerts.title")} subtitle={t("alerts.subtitle")}>
            {/* Filter tabs */}
            <div
                style={{
                    display: "flex",
                    gap: 8,
                    marginBottom: 20,
                }}
            >
                {filterTabs.map((tab, i) => (
                    <button
                        key={tab}
                        style={{
                            padding: "7px 16px",
                            borderRadius: "var(--radius-full)",
                            border: "1px solid var(--border)",
                            background: i === 0 ? "var(--accent-soft)" : "transparent",
                            color: i === 0 ? "var(--accent)" : "var(--fg-secondary)",
                            fontSize: 13,
                            fontWeight: 500,
                            cursor: "pointer",
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Alert list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {alerts.map((a) => {
                    const Icon = a.icon;
                    const style = typeStyles[a.type];
                    return (
                        <div
                            key={a.id}
                            className="card"
                            style={{
                                padding: "18px 22px",
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 14,
                                opacity: a.read ? 0.6 : 1,
                                cursor: "pointer",
                            }}
                        >
                            <div
                                style={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: "var(--radius-md)",
                                    background: style.bg,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                }}
                            >
                                <Icon size={17} color={style.color} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                        marginBottom: 4,
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: 14,
                                            fontWeight: 600,
                                            color: "var(--fg-primary)",
                                        }}
                                    >
                                        {a.title}
                                    </span>
                                    {!a.read && (
                                        <span
                                            style={{
                                                width: 6,
                                                height: 6,
                                                borderRadius: "50%",
                                                background: style.color,
                                                flexShrink: 0,
                                            }}
                                        />
                                    )}
                                </div>
                                <p
                                    style={{
                                        fontSize: 13,
                                        color: "var(--fg-secondary)",
                                        margin: 0,
                                        lineHeight: 1.5,
                                    }}
                                >
                                    {a.message}
                                </p>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 4,
                                    fontSize: 11,
                                    color: "var(--fg-dim)",
                                    flexShrink: 0,
                                    whiteSpace: "nowrap",
                                }}
                            >
                                <Clock size={11} />
                                {a.time}
                            </div>
                        </div>
                    );
                })}
            </div>
        </DashboardLayout>
    );
}
