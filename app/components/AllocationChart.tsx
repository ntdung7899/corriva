"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useTranslation } from "../i18n/LanguageContext";

interface AllocItem {
    name: string;
    symbol?: string;
    pct: number;
    color: string;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ name: string; value: number; payload: { color: string } }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
    if (!active || !payload?.[0]) return null;
    const d = payload[0];
    return (
        <div
            style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-strong)",
                borderRadius: "var(--radius-md)",
                padding: "8px 12px",
                boxShadow: "var(--shadow-lg)",
                fontSize: 13,
            }}
        >
            <span style={{ color: d.payload.color, fontWeight: 600 }}>{d.name}</span>
            <span style={{ color: "var(--fg-secondary)", marginLeft: 8 }}>
                {d.value}%
            </span>
        </div>
    );
}

interface AllocationChartProps {
    data?: AllocItem[];
}

export default function AllocationChart({ data }: AllocationChartProps) {
    const { t } = useTranslation();

    const allocationData = data && data.length > 0
        ? data.map(d => ({ name: d.name, value: d.pct, color: d.color }))
        : [];

    if (allocationData.length === 0) {
        return (
            <div className="card" style={{ padding: "24px" }}>
                <h3
                    style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: "var(--fg-primary)",
                        margin: 0,
                        marginBottom: 4,
                    }}
                >
                    {t("charts.assetAllocation")}
                </h3>
                <p
                    style={{
                        fontSize: 12,
                        color: "var(--fg-muted)",
                        margin: 0,
                        marginBottom: 20,
                    }}
                >
                    {t("charts.currentDistribution")}
                </p>
                <div
                    style={{
                        height: 180,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--fg-dim)",
                        fontSize: 13,
                    }}
                >
                    {t("myPortfolio.noChartData")}
                </div>
            </div>
        );
    }

    return (
        <div className="card" style={{ padding: "24px" }}>
            <h3
                style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "var(--fg-primary)",
                    margin: 0,
                    marginBottom: 4,
                }}
            >
                {t("charts.assetAllocation")}
            </h3>
            <p
                style={{
                    fontSize: 12,
                    color: "var(--fg-muted)",
                    margin: 0,
                    marginBottom: 20,
                }}
            >
                {t("charts.currentDistribution")}
            </p>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 24,
                }}
            >
                <ResponsiveContainer width={180} height={180}>
                    <PieChart>
                        <Pie
                            data={allocationData}
                            cx="50%"
                            cy="50%"
                            innerRadius={52}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                            strokeWidth={0}
                        >
                            {allocationData.map((entry) => (
                                <Cell key={entry.name} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                    {allocationData.map((item) => (
                        <div
                            key={item.name}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                fontSize: 13,
                            }}
                        >
                            <div
                                style={{ display: "flex", alignItems: "center", gap: 8 }}
                            >
                                <span
                                    style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: "50%",
                                        background: item.color,
                                        flexShrink: 0,
                                    }}
                                />
                                <span style={{ color: "var(--fg-secondary)" }}>
                                    {item.name}
                                </span>
                            </div>
                            <span
                                style={{
                                    fontWeight: 600,
                                    color: "var(--fg-primary)",
                                    fontVariantNumeric: "tabular-nums",
                                }}
                            >
                                {item.value}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
