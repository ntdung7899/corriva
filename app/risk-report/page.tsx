"use client";

import DashboardLayout from "../components/DashboardLayout";
import CircularProgress from "../components/CircularProgress";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import {
    ShieldAlert,
    TrendingDown,
    BrainCircuit,
    Gauge,
    AlertTriangle,
} from "lucide-react";

const volatilityData = [
    { sector: "Tech", value: 28.4, color: "#f87171" },
    { sector: "Finance", value: 16.3, color: "#fbbf24" },
    { sector: "Healthcare", value: 12.1, color: "#34d399" },
    { sector: "Real Estate", value: 19.4, color: "#fb923c" },
    { sector: "Energy", value: 22.8, color: "#f87171" },
    { sector: "Consumer", value: 14.5, color: "#fbbf24" },
    { sector: "Bonds", value: 4.2, color: "#34d399" },
];

interface TooltipProps {
    active?: boolean;
    payload?: Array<{ value: number; payload: { sector: string; color: string } }>;
}

function VolTooltip({ active, payload }: TooltipProps) {
    if (!active || !payload?.[0]) return null;
    const d = payload[0];
    return (
        <div
            style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-strong)",
                borderRadius: "var(--radius-md)",
                padding: "8px 14px",
                boxShadow: "var(--shadow-lg)",
                fontSize: 13,
            }}
        >
            <span style={{ color: "var(--fg-secondary)" }}>
                {d.payload.sector}:
            </span>{" "}
            <span style={{ fontWeight: 700, color: d.payload.color }}>
                {d.value}%
            </span>
        </div>
    );
}

const riskMetrics = [
    {
        label: "Value at Risk (95%)",
        value: "-3.2%",
        detail: "~$41,105 daily",
        icon: ShieldAlert,
        color: "var(--risk-high)",
    },
    {
        label: "Max Drawdown",
        value: "-8.7%",
        detail: "Peak-to-trough (12mo)",
        icon: TrendingDown,
        color: "var(--warning)",
    },
    {
        label: "Conditional VaR (99%)",
        value: "-5.1%",
        detail: "Expected tail loss",
        icon: AlertTriangle,
        color: "var(--risk-high)",
    },
    {
        label: "Tracking Error",
        value: "4.6%",
        detail: "vs. S&P 500",
        icon: Gauge,
        color: "var(--accent)",
    },
];

export default function RiskReportPage() {
    return (
        <DashboardLayout
            title="Risk Report"
            subtitle="Comprehensive risk metrics and analysis"
        >
            {/* ── Score + Key Metrics ──────────────────────────────── */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "280px 1fr",
                    gap: 20,
                    marginBottom: 24,
                }}
            >
                {/* Risk Score */}
                <div
                    className="card-glow"
                    style={{
                        padding: 28,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    <span
                        style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: "var(--fg-secondary)",
                            marginBottom: 20,
                        }}
                    >
                        Composite Risk Score
                    </span>
                    <CircularProgress
                        value={42}
                        label="/ 100"
                        sublabel="Moderate"
                        size={160}
                        strokeWidth={11}
                    />
                    <div
                        style={{
                            marginTop: 20,
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                        }}
                    >
                        {[
                            { label: "Market Risk", val: 52 },
                            { label: "Credit Risk", val: 28 },
                            { label: "Liquidity Risk", val: 18 },
                        ].map((r) => (
                            <div key={r.label}>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        fontSize: 11,
                                        color: "var(--fg-muted)",
                                        marginBottom: 4,
                                    }}
                                >
                                    <span>{r.label}</span>
                                    <span style={{ color: "var(--fg-secondary)", fontWeight: 600 }}>
                                        {r.val}
                                    </span>
                                </div>
                                <div
                                    style={{
                                        height: 4,
                                        borderRadius: 2,
                                        background: "var(--bg-active)",
                                    }}
                                >
                                    <div
                                        style={{
                                            height: "100%",
                                            width: `${r.val}%`,
                                            borderRadius: 2,
                                            background:
                                                r.val > 50
                                                    ? "var(--risk-high)"
                                                    : r.val > 30
                                                        ? "var(--risk-medium)"
                                                        : "var(--risk-low)",
                                            transition: "width 0.8s ease",
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Risk Metric Cards */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 16,
                    }}
                >
                    {riskMetrics.map((m) => {
                        const Icon = m.icon;
                        return (
                            <div className="card" key={m.label} style={{ padding: "20px 22px" }}>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 10,
                                        marginBottom: 14,
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 34,
                                            height: 34,
                                            borderRadius: "var(--radius-md)",
                                            background: `color-mix(in srgb, ${m.color} 12%, transparent)`,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <Icon size={16} color={m.color} strokeWidth={2} />
                                    </div>
                                    <span
                                        style={{
                                            fontSize: 13,
                                            fontWeight: 500,
                                            color: "var(--fg-secondary)",
                                        }}
                                    >
                                        {m.label}
                                    </span>
                                </div>
                                <div
                                    style={{
                                        fontSize: 28,
                                        fontWeight: 800,
                                        color: m.color,
                                        letterSpacing: "-0.02em",
                                        lineHeight: 1,
                                    }}
                                >
                                    {m.value}
                                </div>
                                <div
                                    style={{
                                        fontSize: 12,
                                        color: "var(--fg-dim)",
                                        marginTop: 6,
                                    }}
                                >
                                    {m.detail}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Volatility Chart + AI Explanation ────────────────── */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 20,
                }}
            >
                {/* Volatility by sector */}
                <div className="card" style={{ padding: 24 }}>
                    <h3
                        style={{
                            fontSize: 15,
                            fontWeight: 600,
                            color: "var(--fg-primary)",
                            margin: 0,
                            marginBottom: 4,
                        }}
                    >
                        Sector Volatility
                    </h3>
                    <p
                        style={{
                            fontSize: 12,
                            color: "var(--fg-muted)",
                            margin: 0,
                            marginBottom: 20,
                        }}
                    >
                        Annualized volatility by sector
                    </p>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={volatilityData} barSize={28} layout="vertical">
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="var(--border)"
                                horizontal={false}
                            />
                            <XAxis
                                type="number"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "var(--fg-dim)", fontSize: 11 }}
                                tickFormatter={(v: number) => `${v}%`}
                            />
                            <YAxis
                                type="category"
                                dataKey="sector"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: "var(--fg-secondary)", fontSize: 12 }}
                                width={70}
                            />
                            <Tooltip content={<VolTooltip />} cursor={false} />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                {volatilityData.map((entry) => (
                                    <Cell key={entry.sector} fill={entry.color} fillOpacity={0.8} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* AI Explanation */}
                <div className="card" style={{ padding: 24 }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            marginBottom: 16,
                        }}
                    >
                        <div
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: "var(--radius-md)",
                                background: "var(--accent-soft)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <BrainCircuit size={18} color="var(--accent)" />
                        </div>
                        <div>
                            <span
                                style={{
                                    fontSize: 15,
                                    fontWeight: 600,
                                    color: "var(--fg-primary)",
                                }}
                            >
                                AI Risk Assessment
                            </span>
                            <div style={{ fontSize: 11, color: "var(--fg-dim)", marginTop: 1 }}>
                                Generated Feb 11, 2026
                            </div>
                        </div>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 14,
                            fontSize: 13,
                            lineHeight: 1.7,
                            color: "var(--fg-secondary)",
                        }}
                    >
                        <div
                            style={{
                                padding: "12px 16px",
                                background: "var(--risk-high-soft)",
                                borderRadius: "var(--radius-md)",
                                borderLeft: "3px solid var(--risk-high)",
                            }}
                        >
                            <strong style={{ color: "var(--risk-high)" }}>
                                High Concentration Alert:
                            </strong>{" "}
                            Technology exposure represents 31.6% of portfolio with annualized
                            volatility of 28.4%. This exceeds the recommended 25% sector cap.
                        </div>

                        <p style={{ margin: 0 }}>
                            The portfolio&apos;s 95% Value at Risk of -3.2% translates to a potential
                            daily loss of approximately $41,105. The max drawdown of -8.7% occurred
                            during the October correction, recovering within 18 trading days.
                        </p>

                        <p style={{ margin: 0 }}>
                            Fixed income allocation provides adequate downside hedging. However,
                            the correlation between equity sectors increased from 0.52 to 0.67
                            over the past quarter, reducing portfolio diversification benefit.
                        </p>

                        <div
                            style={{
                                padding: "12px 16px",
                                background: "var(--accent-soft)",
                                borderRadius: "var(--radius-md)",
                                borderLeft: "3px solid var(--accent)",
                            }}
                        >
                            <strong style={{ color: "var(--accent)" }}>Recommendation:</strong>{" "}
                            Reduce tech allocation by 5-7% and increase international fixed income
                            exposure to improve risk-adjusted returns and lower correlation concentration.
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
