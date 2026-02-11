"use client";

import { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { AlertTriangle, TrendingDown, Zap, Snowflake } from "lucide-react";
import { useTranslation } from "../../i18n/LanguageContext";

type ScenarioKey = "crash" | "rate" | "crypto";

const chartDataMap: Record<ScenarioKey, Array<{ day: string; value: number; stressed: number }>> = {
    crash: [
        { day: "D0", value: 1284520, stressed: 1284520 },
        { day: "D5", value: 1290000, stressed: 1180000 },
        { day: "D10", value: 1285000, stressed: 1125000 },
        { day: "D15", value: 1292000, stressed: 1102198 },
        { day: "D30", value: 1300000, stressed: 1085000 },
        { day: "D45", value: 1305000, stressed: 1100000 },
        { day: "D60", value: 1310000, stressed: 1130000 },
        { day: "D90", value: 1320000, stressed: 1165000 },
    ],
    rate: [
        { day: "D0", value: 1284520, stressed: 1284520 },
        { day: "D5", value: 1290000, stressed: 1250000 },
        { day: "D10", value: 1285000, stressed: 1220000 },
        { day: "D15", value: 1292000, stressed: 1200000 },
        { day: "D30", value: 1300000, stressed: 1184327 },
        { day: "D45", value: 1305000, stressed: 1195000 },
        { day: "D60", value: 1310000, stressed: 1215000 },
        { day: "D90", value: 1320000, stressed: 1250000 },
    ],
    crypto: [
        { day: "D0", value: 1284520, stressed: 1284520 },
        { day: "D5", value: 1290000, stressed: 1275000 },
        { day: "D10", value: 1285000, stressed: 1260000 },
        { day: "D15", value: 1292000, stressed: 1253692 },
        { day: "D30", value: 1300000, stressed: 1258000 },
        { day: "D45", value: 1305000, stressed: 1268000 },
        { day: "D60", value: 1310000, stressed: 1280000 },
        { day: "D90", value: 1320000, stressed: 1300000 },
    ],
};

const fmt = (v: number) => `$${(v / 1000).toFixed(0)}K`;

interface TooltipProps {
    active?: boolean;
    payload?: Array<{ value: number; dataKey: string }>;
    label?: string;
}

function StressTooltip({ active, payload, label }: TooltipProps) {
    if (!active || !payload) return null;
    return (
        <div
            style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-strong)",
                borderRadius: "var(--radius-md)",
                padding: "10px 14px",
                boxShadow: "var(--shadow-lg)",
                fontSize: 13,
            }}
        >
            <div style={{ color: "var(--fg-muted)", fontSize: 11, marginBottom: 6 }}>
                {label}
            </div>
            {payload.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span
                        style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background:
                                p.dataKey === "stressed" ? "#f87171" : "var(--accent)",
                        }}
                    />
                    <span style={{ color: "var(--fg-secondary)" }}>
                        {p.dataKey === "stressed" ? "Stressed" : "Baseline"}:
                    </span>
                    <span style={{ fontWeight: 600, color: "var(--fg-primary)" }}>
                        ${p.value.toLocaleString()}
                    </span>
                </div>
            ))}
        </div>
    );
}

export default function StressTestPage() {
    const [selected, setSelected] = useState<ScenarioKey>("crash");
    const { t } = useTranslation();

    const scenarios = [
        {
            key: "crash" as ScenarioKey,
            label: t("stress.marketCrash"),
            description: t("stress.marketCrashDesc"),
            icon: TrendingDown,
            impact: t("stress.severe"),
            lossPercent: 14.2,
            lossAmount: "$182,322",
            recovery: "6-9 months",
            color: "var(--risk-high)",
        },
        {
            key: "rate" as ScenarioKey,
            label: t("stress.rateHike"),
            description: t("stress.rateHikeDesc"),
            icon: Zap,
            impact: t("overview.moderate"),
            lossPercent: 7.8,
            lossAmount: "$100,193",
            recovery: "3-5 months",
            color: "var(--warning)",
        },
        {
            key: "crypto" as ScenarioKey,
            label: t("stress.cryptoWinter"),
            description: t("stress.cryptoWinterDesc"),
            icon: Snowflake,
            impact: t("stress.low"),
            lossPercent: 2.4,
            lossAmount: "$30,828",
            recovery: "1-2 months",
            color: "var(--risk-medium)",
        },
    ];

    const scenario = scenarios.find((s) => s.key === selected)!;
    const chartData = chartDataMap[selected];

    return (
        <DashboardLayout
            title={t("stress.title")}
            subtitle={t("stress.subtitle")}
        >
            {/* ── Scenario Selector ───────────────────────────────── */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 16,
                    marginBottom: 24,
                }}
            >
                {scenarios.map((s) => {
                    const active = s.key === selected;
                    const Icon = s.icon;
                    return (
                        <button
                            key={s.key}
                            onClick={() => setSelected(s.key)}
                            style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 14,
                                padding: "18px 20px",
                                borderRadius: "var(--radius-lg)",
                                border: `1.5px solid ${active ? s.color : "var(--border)"}`,
                                background: active
                                    ? `color-mix(in srgb, ${s.color} 6%, var(--bg-surface))`
                                    : "var(--bg-surface)",
                                cursor: "pointer",
                                textAlign: "left",
                                transition: "all 0.2s",
                                boxShadow: active
                                    ? `0 0 20px color-mix(in srgb, ${s.color} 15%, transparent)`
                                    : "var(--shadow-sm)",
                            }}
                        >
                            <div
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: "var(--radius-md)",
                                    background: `color-mix(in srgb, ${s.color} 12%, transparent)`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                }}
                            >
                                <Icon size={18} color={s.color} />
                            </div>
                            <div>
                                <div
                                    style={{
                                        fontSize: 14,
                                        fontWeight: 600,
                                        color: active ? s.color : "var(--fg-primary)",
                                        marginBottom: 2,
                                    }}
                                >
                                    {s.label}
                                </div>
                                <div style={{ fontSize: 12, color: "var(--fg-muted)", lineHeight: 1.5 }}>
                                    {s.description}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* ── Impact Summary + Chart ──────────────────────────── */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "300px 1fr",
                    gap: 20,
                }}
            >
                {/* Impact panel */}
                <div
                    className="card"
                    style={{
                        padding: 24,
                        display: "flex",
                        flexDirection: "column",
                        gap: 20,
                    }}
                >
                    <div>
                        <span
                            style={{
                                fontSize: 11,
                                color: "var(--fg-muted)",
                                textTransform: "uppercase",
                                letterSpacing: "0.04em",
                            }}
                        >
                            {t("stress.impactSeverity")}
                        </span>
                        <div
                            style={{
                                fontSize: 22,
                                fontWeight: 800,
                                color: scenario.color,
                                marginTop: 4,
                            }}
                        >
                            {scenario.impact}
                        </div>
                    </div>

                    <div
                        style={{
                            height: 1,
                            background: "var(--border)",
                        }}
                    />

                    {/* Loss */}
                    <div>
                        <span
                            style={{
                                fontSize: 11,
                                color: "var(--fg-muted)",
                                textTransform: "uppercase",
                                letterSpacing: "0.04em",
                            }}
                        >
                            {t("stress.projectedLoss")}
                        </span>
                        <div
                            style={{
                                fontSize: 32,
                                fontWeight: 800,
                                color: "var(--risk-high)",
                                letterSpacing: "-0.02em",
                                marginTop: 4,
                            }}
                        >
                            -{scenario.lossPercent}%
                        </div>
                        <div
                            style={{
                                fontSize: 14,
                                color: "var(--fg-secondary)",
                                marginTop: 2,
                            }}
                        >
                            {scenario.lossAmount}
                        </div>
                    </div>

                    <div
                        style={{
                            height: 1,
                            background: "var(--border)",
                        }}
                    />

                    {/* Recovery */}
                    <div>
                        <span
                            style={{
                                fontSize: 11,
                                color: "var(--fg-muted)",
                                textTransform: "uppercase",
                                letterSpacing: "0.04em",
                            }}
                        >
                            {t("stress.estRecoveryTime")}
                        </span>
                        <div
                            style={{
                                fontSize: 18,
                                fontWeight: 700,
                                color: "var(--fg-primary)",
                                marginTop: 4,
                            }}
                        >
                            {scenario.recovery}
                        </div>
                    </div>

                    {/* Loss bar indicator */}
                    <div>
                        <div style={{ fontSize: 11, color: "var(--fg-muted)", marginBottom: 6 }}>
                            {t("stress.lossSeverity")}
                        </div>
                        <div
                            style={{
                                height: 8,
                                borderRadius: 4,
                                background: "var(--bg-active)",
                                overflow: "hidden",
                            }}
                        >
                            <div
                                style={{
                                    height: "100%",
                                    width: `${(scenario.lossPercent / 20) * 100}%`,
                                    borderRadius: 4,
                                    background: `linear-gradient(90deg, var(--risk-medium), var(--risk-high))`,
                                    transition: "width 0.6s ease",
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Stress chart */}
                <div className="card" style={{ padding: 24 }}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 20,
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
                                {t("stress.portfolioValueProjection")}
                            </h3>
                            <p
                                style={{
                                    fontSize: 12,
                                    color: "var(--fg-muted)",
                                    margin: 0,
                                    marginTop: 3,
                                }}
                            >
                                {t("stress.baselineVsStressed")}
                            </p>
                        </div>
                        <div style={{ display: "flex", gap: 14 }}>
                            {[
                                { label: t("stress.baseline"), color: "var(--accent)" },
                                { label: t("stress.stressed"), color: "#f87171" },
                            ].map((l) => (
                                <div
                                    key={l.label}
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
                                            background: l.color,
                                        }}
                                    />
                                    {l.label}
                                </div>
                            ))}
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#f87171" stopOpacity={0.2} />
                                    <stop offset="100%" stopColor="#f87171" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="baseGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.1} />
                                    <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="var(--border)"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="day"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "var(--fg-dim)", fontSize: 11 }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "var(--fg-dim)", fontSize: 11 }}
                                tickFormatter={fmt}
                                width={60}
                                domain={["auto", "auto"]}
                            />
                            <Tooltip content={<StressTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#38bdf8"
                                strokeWidth={2}
                                fill="url(#baseGrad)"
                                dot={false}
                            />
                            <Area
                                type="monotone"
                                dataKey="stressed"
                                stroke="#f87171"
                                strokeWidth={2.5}
                                fill="url(#stressGrad)"
                                dot={false}
                                activeDot={{
                                    r: 5,
                                    fill: "#f87171",
                                    stroke: "var(--bg-surface)",
                                    strokeWidth: 2,
                                }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </DashboardLayout>
    );
}
