"use client";

import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
} from "recharts";
import { useTranslation } from "../i18n/LanguageContext";

interface ChartDataPoint {
    label: string;
    value: number;
}

const formatValue = (val: number) => {
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
    return `$${val.toFixed(0)}`;
};

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ value: number; dataKey: string; color: string }>;
    label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
    if (!active || !payload) return null;
    return (
        <div
            style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-strong)",
                borderRadius: "var(--radius-md)",
                padding: "10px 14px",
                boxShadow: "var(--shadow-lg)",
            }}
        >
            <div style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 6 }}>
                {label}
            </div>
            {payload.map((p, i) => (
                <div
                    key={i}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 13,
                        fontWeight: 600,
                    }}
                >
                    <span
                        style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: p.color,
                        }}
                    />
                    <span style={{ color: "var(--fg-primary)" }}>
                        ${p.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                </div>
            ))}
        </div>
    );
}

interface PerformanceChartProps {
    data?: ChartDataPoint[];
    title?: string;
    subtitle?: string;
}

export default function PerformanceChart({ data, title, subtitle }: PerformanceChartProps) {
    const { t } = useTranslation();

    const chartTitle = title || t("charts.portfolioPerformance");
    const chartSubtitle = subtitle || t("charts.trailingBenchmark");

    // If no data, show empty state
    if (!data || data.length === 0) {
        return (
            <div className="card" style={{ padding: "24px" }}>
                <div style={{ marginBottom: 24 }}>
                    <h3
                        style={{
                            fontSize: 15,
                            fontWeight: 600,
                            color: "var(--fg-primary)",
                            margin: 0,
                        }}
                    >
                        {chartTitle}
                    </h3>
                    <p
                        style={{
                            fontSize: 12,
                            color: "var(--fg-muted)",
                            margin: 0,
                            marginTop: 4,
                        }}
                    >
                        {chartSubtitle}
                    </p>
                </div>
                <div
                    style={{
                        height: 280,
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
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 24,
                }}
            >
                <div>
                    <h3
                        style={{
                            fontSize: 15,
                            fontWeight: 600,
                            color: "var(--fg-primary)",
                            margin: 0,
                        }}
                    >
                        {chartTitle}
                    </h3>
                    <p
                        style={{
                            fontSize: 12,
                            color: "var(--fg-muted)",
                            margin: 0,
                            marginTop: 4,
                        }}
                    >
                        {chartSubtitle}
                    </p>
                </div>
                <div style={{ display: "flex", gap: 16 }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            fontSize: 12,
                            color: "var(--fg-secondary)",
                        }}
                    >
                        <span
                            style={{
                                width: 10,
                                height: 3,
                                borderRadius: 2,
                                background: "var(--accent)",
                            }}
                        />
                        {t("charts.portfolio")}
                    </div>
                </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.15} />
                            <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border)"
                        vertical={false}
                    />
                    <XAxis
                        dataKey="label"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "var(--fg-dim)", fontSize: 11 }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "var(--fg-dim)", fontSize: 11 }}
                        tickFormatter={formatValue}
                        width={60}
                        domain={["auto", "auto"]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#38bdf8"
                        strokeWidth={2.5}
                        fill="url(#portfolioGrad)"
                        dot={false}
                        activeDot={{
                            r: 5,
                            fill: "#38bdf8",
                            stroke: "var(--bg-surface)",
                            strokeWidth: 2,
                        }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
