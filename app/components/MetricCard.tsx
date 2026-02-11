"use client";

import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
    icon: LucideIcon;
    title: string;
    value: string;
    change?: string;
    changeType?: "positive" | "negative" | "neutral";
    accentColor?: string;
}

export default function MetricCard({
    icon: Icon,
    title,
    value,
    change,
    changeType = "neutral",
    accentColor = "var(--accent)",
}: MetricCardProps) {
    const changeColor =
        changeType === "positive"
            ? "var(--risk-low)"
            : changeType === "negative"
                ? "var(--risk-high)"
                : "var(--fg-muted)";

    return (
        <div className="card" style={{ padding: "22px 24px" }}>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 16,
                }}
            >
                <span
                    style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "var(--fg-secondary)",
                    }}
                >
                    {title}
                </span>
                <div
                    style={{
                        width: 34,
                        height: 34,
                        borderRadius: "var(--radius-md)",
                        background: `color-mix(in srgb, ${accentColor} 12%, transparent)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Icon size={16} color={accentColor} strokeWidth={2} />
                </div>
            </div>
            <div
                style={{
                    fontSize: 28,
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    color: "var(--fg-primary)",
                    lineHeight: 1.1,
                }}
            >
                {value}
            </div>
            {change && (
                <div
                    style={{
                        marginTop: 8,
                        fontSize: 12,
                        fontWeight: 500,
                        color: changeColor,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                    }}
                >
                    <span>{changeType === "positive" ? "↑" : changeType === "negative" ? "↓" : "•"}</span>
                    {change}
                </div>
            )}
        </div>
    );
}
