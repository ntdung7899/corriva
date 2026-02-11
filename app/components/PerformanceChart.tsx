"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
} from "recharts";
import { useTranslation } from "../i18n/LanguageContext";

const performanceData = [
    { month: "Jul", portfolio: 1000000, benchmark: 1000000 },
    { month: "Aug", portfolio: 1035000, benchmark: 1018000 },
    { month: "Sep", portfolio: 1012000, benchmark: 995000 },
    { month: "Oct", portfolio: 1078000, benchmark: 1042000 },
    { month: "Nov", portfolio: 1125000, benchmark: 1065000 },
    { month: "Dec", portfolio: 1098000, benchmark: 1055000 },
    { month: "Jan", portfolio: 1142000, benchmark: 1080000 },
    { month: "Feb", portfolio: 1165000, benchmark: 1092000 },
    { month: "Mar", portfolio: 1210000, benchmark: 1115000 },
    { month: "Apr", portfolio: 1185000, benchmark: 1105000 },
    { month: "May", portfolio: 1248000, benchmark: 1135000 },
    { month: "Jun", portfolio: 1284000, benchmark: 1158000 },
];

const formatValue = (val: number) => `$${(val / 1000).toFixed(0)}K`;

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
                    <span style={{ color: "var(--fg-secondary)", fontWeight: 400 }}>
                        {p.dataKey === "portfolio" ? "Portfolio" : "Benchmark"}:
                    </span>
                    <span style={{ color: "var(--fg-primary)" }}>
                        ${p.value.toLocaleString()}
                    </span>
                </div>
            ))}
        </div>
    );
}

export default function PerformanceChart() {
    const { t } = useTranslation();

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
                        {t("charts.portfolioPerformance")}
                    </h3>
                    <p
                        style={{
                            fontSize: 12,
                            color: "var(--fg-muted)",
                            margin: 0,
                            marginTop: 4,
                        }}
                    >
                        {t("charts.trailingBenchmark")}
                    </p>
                </div>
                <div style={{ display: "flex", gap: 16 }}>
                    {[
                        { label: t("charts.portfolio"), color: "var(--accent)" },
                        { label: t("charts.benchmark"), color: "var(--fg-dim)" },
                    ].map((item) => (
                        <div
                            key={item.label}
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
                                    background: item.color,
                                }}
                            />
                            {item.label}
                        </div>
                    ))}
                </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={performanceData}>
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
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "var(--fg-dim)", fontSize: 11 }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "var(--fg-dim)", fontSize: 11 }}
                        tickFormatter={formatValue}
                        width={55}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="portfolio"
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
                    <Line
                        type="monotone"
                        dataKey="benchmark"
                        stroke="var(--fg-dim)"
                        strokeWidth={1.5}
                        strokeDasharray="6 4"
                        dot={false}
                        activeDot={{
                            r: 4,
                            fill: "var(--fg-dim)",
                            stroke: "var(--bg-surface)",
                            strokeWidth: 2,
                        }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
