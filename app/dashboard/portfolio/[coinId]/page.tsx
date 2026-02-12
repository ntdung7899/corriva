"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "../../../components/DashboardLayout";
import { useTranslation } from "../../../i18n/LanguageContext";
import {
    ArrowLeft,
    Loader2,
    TrendingUp,
    TrendingDown,
    Minus,
    Clock,
    Calendar,
    CalendarRange,
    BarChart3,
    DollarSign,
    Activity,
    Layers,
    Target,
    ShieldCheck,
    Crosshair,
    Repeat,
    Shield,
    Gauge,
    AlertTriangle,
    Zap,
} from "lucide-react";
import {
    getCoinMarketChart,
    getCoinDetail,
    analyzeMarketTrend,
    analyzeDCAZones,
    type MarketChartData,
    type CoinDetail,
    type MarketAnalysis,
    type TrendDirection,
    type DCAAnalysis,
    type DCAGrade,
    type CyclePhase,
} from "../../../lib/crypto-api";
import {
    analyzeRisk,
    type RiskAnalysis,
    type RiskLevel,
    type Signal,
} from "../../../lib/risk-engine";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

/* ── Time range options ──────────────────────────────────────── */
const TIME_RANGES = [
    { key: "7D", days: 7, labelKey: "coinDetail.range7d" },
    { key: "30D", days: 30, labelKey: "coinDetail.range30d" },
    { key: "90D", days: 90, labelKey: "coinDetail.range90d" },
    { key: "1Y", days: 365, labelKey: "coinDetail.range1y" },
];

/* ── Format helpers ──────────────────────────────────────────── */
function formatPrice(v: number): string {
    if (v >= 1) return v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 });
}

function formatLargeNumber(v: number): string {
    if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
    if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
    if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
    return `$${v.toLocaleString()}`;
}

function formatChartDate(timestamp: number, days: number): string {
    const d = new Date(timestamp);
    if (days <= 7) return d.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    if (days <= 90) return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    return d.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
}

/* ── Trend visual config ─────────────────────────────────────── */
const trendConfig: Record<TrendDirection, { icon: typeof TrendingUp; color: string; bg: string; label: string }> = {
    bullish: { icon: TrendingUp, color: "var(--risk-low)", bg: "var(--risk-low-soft)", label: "🟢" },
    bearish: { icon: TrendingDown, color: "var(--risk-high)", bg: "var(--risk-high-soft)", label: "🔴" },
    neutral: { icon: Minus, color: "var(--risk-medium)", bg: "var(--risk-medium-soft)", label: "🟡" },
};

/* ── DCA Grade visual config ─────────────────────────────────── */
const gradeConfig: Record<DCAGrade, { color: string; bg: string; icon: typeof ShieldCheck }> = {
    strongBuy: { color: "#22c55e", bg: "rgba(34,197,94,0.12)", icon: ShieldCheck },
    buy: { color: "var(--accent)", bg: "var(--accent-soft)", icon: TrendingUp },
    hold: { color: "var(--risk-medium)", bg: "var(--risk-medium-soft)", icon: Minus },
    overvalued: { color: "var(--risk-high)", bg: "var(--risk-high-soft)", icon: TrendingDown },
};

const cycleConfig: Record<CyclePhase, { color: string; bg: string }> = {
    accumulation: { color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
    markup: { color: "var(--accent)", bg: "var(--accent-soft)" },
    distribution: { color: "var(--risk-medium)", bg: "var(--risk-medium-soft)" },
    markdown: { color: "var(--risk-high)", bg: "var(--risk-high-soft)" },
};

/* ── DCA Section Component ───────────────────────────────────── */
function DCASection({ dca, t }: { dca: DCAAnalysis; t: (key: string) => string }) {
    const grade = gradeConfig[dca.currentGrade];
    const GradeIcon = grade.icon;
    const cycle = cycleConfig[dca.cyclePhase];

    // Calculate position of current price on the zone bar (0-100%)
    const zoneMin = dca.zones.strongBuy.low;
    const zoneMax = dca.zones.overvalued.high;
    const zoneRange = zoneMax - zoneMin;
    const pricePosition = zoneRange > 0
        ? Math.max(0, Math.min(100, ((dca.currentPrice - zoneMin) / zoneRange) * 100))
        : 50;

    return (
        <div style={{ marginTop: 28 }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <Crosshair size={18} color="var(--accent)" />
                <span style={{ fontSize: 16, fontWeight: 700, color: "var(--fg-primary)" }}>
                    {t("dca.title")}
                </span>
                <span className="badge badge-accent" style={{ fontSize: 11 }}>
                    DCA
                </span>
            </div>

            {/* Top row: Rating + Cycle + Drawdown */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 14,
                marginBottom: 16,
            }}>
                {/* Rating Card */}
                <div className="card" style={{
                    padding: "22px 24px",
                    position: "relative",
                    overflow: "hidden",
                }}>
                    <div style={{
                        position: "absolute", top: 0, right: 0,
                        width: 140, height: 140,
                        background: `radial-gradient(circle at top right, ${grade.bg}, transparent 70%)`,
                        pointerEvents: "none",
                    }} />
                    <div style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 10, fontWeight: 500 }}>
                        {t("dca.currentRating")}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <div style={{
                            width: 44, height: 44,
                            borderRadius: "var(--radius-md)",
                            background: grade.bg,
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <GradeIcon size={22} color={grade.color} />
                        </div>
                        <div>
                            <div style={{
                                fontSize: 20, fontWeight: 800,
                                color: grade.color, letterSpacing: "-0.01em",
                            }}>
                                {t(`dca.grade${dca.currentGrade.charAt(0).toUpperCase() + dca.currentGrade.slice(1)}`)}
                            </div>
                            <div style={{ fontSize: 11, color: "var(--fg-muted)" }}>
                                {t("dca.confidence")}: {dca.gradeConfidence}%
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cycle Phase Card */}
                <div className="card" style={{ padding: "22px 24px", position: "relative", overflow: "hidden" }}>
                    <div style={{
                        position: "absolute", top: 0, right: 0,
                        width: 140, height: 140,
                        background: `radial-gradient(circle at top right, ${cycle.bg}, transparent 70%)`,
                        pointerEvents: "none",
                    }} />
                    <div style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 10, fontWeight: 500 }}>
                        {t("dca.cyclePhase")}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                            width: 44, height: 44, borderRadius: "var(--radius-md)",
                            background: cycle.bg,
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <Repeat size={22} color={cycle.color} />
                        </div>
                        <div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: cycle.color }}>
                                {t(`dca.cycle${dca.cyclePhase.charAt(0).toUpperCase() + dca.cyclePhase.slice(1)}`)}
                            </div>
                            <div style={{ fontSize: 11, color: "var(--fg-muted)" }}>
                                {t("dca.drawdownATH")}: {dca.drawdownFromATH}%
                            </div>
                        </div>
                    </div>
                </div>

                {/* DCA Recommended Price Card */}
                <div className="card" style={{ padding: "22px 24px", position: "relative", overflow: "hidden" }}>
                    <div style={{
                        position: "absolute", top: 0, right: 0, width: 140, height: 140,
                        background: "radial-gradient(circle at top right, var(--accent-soft), transparent 70%)",
                        pointerEvents: "none",
                    }} />
                    <div style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 10, fontWeight: 500 }}>
                        {t("dca.recommendedPrice")}
                    </div>
                    <div style={{
                        fontSize: 26, fontWeight: 800,
                        color: "var(--accent)",
                        fontVariantNumeric: "tabular-nums",
                        letterSpacing: "-0.02em",
                    }}>
                        ${formatPrice(dca.dcaRecommendedPrice)}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--fg-muted)", marginTop: 4 }}>
                        {t("dca.basedOnVWAP")}
                    </div>
                </div>
            </div>

            {/* Price Zone Bar */}
            <div className="card" style={{ padding: "24px", marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--fg-primary)", marginBottom: 16 }}>
                    {t("dca.priceZones")}
                </div>

                {/* Zone bar */}
                <div style={{ position: "relative", marginBottom: 32 }}>
                    <div style={{ display: "flex", height: 32, borderRadius: 8, overflow: "hidden" }}>
                        <div style={{ flex: 1, background: "rgba(34,197,94,0.25)" }} title={t("dca.zoneStrongBuy")} />
                        <div style={{ flex: 1.5, background: "rgba(56,189,248,0.2)" }} title={t("dca.zoneBuy")} />
                        <div style={{ flex: 1, background: "rgba(251,191,36,0.2)" }} title={t("dca.zoneHold")} />
                        <div style={{ flex: 1, background: "rgba(248,113,113,0.2)" }} title={t("dca.zoneOvervalued")} />
                    </div>

                    {/* Current price marker */}
                    <div style={{
                        position: "absolute",
                        left: `${pricePosition}%`,
                        top: -6,
                        transform: "translateX(-50%)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}>
                        <div style={{
                            width: 3, height: 44,
                            background: "var(--fg-primary)",
                            borderRadius: 2,
                            boxShadow: "0 0 8px rgba(255,255,255,0.3)",
                        }} />
                        <div style={{
                            marginTop: 4,
                            padding: "3px 8px",
                            borderRadius: "var(--radius-full)",
                            background: "var(--bg-elevated)",
                            border: "1px solid var(--border-strong)",
                            fontSize: 11,
                            fontWeight: 700,
                            color: "var(--fg-primary)",
                            whiteSpace: "nowrap",
                        }}>
                            ${formatPrice(dca.currentPrice)}
                        </div>
                    </div>
                </div>

                {/* Zone labels */}
                <div style={{ display: "flex", gap: 2 }}>
                    {[
                        { label: t("dca.zoneStrongBuy"), color: "#22c55e", low: dca.zones.strongBuy.low, high: dca.zones.strongBuy.high, flex: 1 },
                        { label: t("dca.zoneBuy"), color: "var(--accent)", low: dca.zones.buy.low, high: dca.zones.buy.high, flex: 1.5 },
                        { label: t("dca.zoneHold"), color: "var(--risk-medium)", low: dca.zones.hold.low, high: dca.zones.hold.high, flex: 1 },
                        { label: t("dca.zoneOvervalued"), color: "var(--risk-high)", low: dca.zones.overvalued.low, high: dca.zones.overvalued.high, flex: 1 },
                    ].map((zone) => (
                        <div key={zone.label} style={{ flex: zone.flex, textAlign: "center" }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: zone.color, marginBottom: 2 }}>
                                {zone.label}
                            </div>
                            <div style={{ fontSize: 10, color: "var(--fg-dim)" }}>
                                ${formatPrice(zone.low)} - ${formatPrice(zone.high)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Key Metrics */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: 12,
                marginBottom: 16,
            }}>
                {[
                    { label: t("dca.vwap"), value: `$${formatPrice(dca.vwap)}`, color: "var(--accent)" },
                    { label: t("dca.support"), value: `$${formatPrice(dca.support)}`, color: "var(--risk-low)" },
                    { label: t("dca.resistance"), value: `$${formatPrice(dca.resistance)}`, color: "var(--risk-high)" },
                    { label: t("dca.volumeAccZone"), value: `$${formatPrice(dca.volumeAccumulationPrice)}`, color: "var(--risk-medium)" },
                ].map((m) => (
                    <div key={m.label} className="card" style={{ padding: "14px 16px" }}>
                        <div style={{ fontSize: 11, color: "var(--fg-muted)", marginBottom: 6, fontWeight: 500 }}>
                            {m.label}
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: m.color, fontVariantNumeric: "tabular-nums" }}>
                            {m.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* Disclaimer */}
            <div style={{
                fontSize: 11,
                color: "var(--fg-dim)",
                lineHeight: 1.5,
                padding: "12px 16px",
                background: "var(--bg-elevated)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
            }}>
                ⚠️ {t("dca.disclaimer")}
            </div>
        </div>
    );
}


/* ── Risk level visual config ───────────────────────────────────── */
const riskLevelConfig: Record<RiskLevel, { color: string; bg: string; label: string }> = {
    low: { color: "var(--risk-low)", bg: "var(--risk-low-soft)", label: "riskEngine.levelLow" },
    moderate: { color: "var(--risk-medium)", bg: "var(--risk-medium-soft)", label: "riskEngine.levelModerate" },
    high: { color: "var(--risk-high)", bg: "var(--risk-high-soft)", label: "riskEngine.levelHigh" },
    extreme: { color: "#dc2626", bg: "rgba(220,38,38,0.12)", label: "riskEngine.levelExtreme" },
};

const signalConfig: Record<Signal, { color: string; bg: string; icon: typeof TrendingUp }> = {
    buy: { color: "#22c55e", bg: "rgba(34,197,94,0.12)", icon: TrendingUp },
    hold: { color: "var(--risk-medium)", bg: "var(--risk-medium-soft)", icon: Minus },
    sell: { color: "var(--risk-high)", bg: "var(--risk-high-soft)", icon: TrendingDown },
    accumulate: { color: "var(--accent)", bg: "var(--accent-soft)", icon: Zap },
    reduceRisk: { color: "#f97316", bg: "rgba(249,115,22,0.12)", icon: AlertTriangle },
};

/* ── Risk Dashboard Section Component ───────────────────────────── */
function RiskDashboardSection({ risk, t }: { risk: RiskAnalysis; t: (key: string) => string }) {
    const levelCfg = riskLevelConfig[risk.riskLevel];
    const sigCfg = signalConfig[risk.signal];
    const SigIcon = sigCfg.icon;

    // SVG arc gauge parameters
    const radius = 64;
    const stroke = 10;
    const circumference = Math.PI * radius; // half-circle
    const progress = (risk.riskScore / 100) * circumference;

    // Map signal key to i18n key
    const signalLabelMap: Record<Signal, string> = {
        buy: "riskEngine.signalBuy",
        hold: "riskEngine.signalHold",
        sell: "riskEngine.signalSell",
        accumulate: "riskEngine.signalAccumulate",
        reduceRisk: "riskEngine.signalReduceRisk",
    };

    return (
        <div style={{ marginBottom: 20 }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <Shield size={18} color="var(--accent)" />
                <span style={{ fontSize: 16, fontWeight: 700, color: "var(--fg-primary)" }}>
                    {t("riskEngine.title")}
                </span>
                <span className="badge badge-accent" style={{ fontSize: 11 }}>
                    AI
                </span>
            </div>

            {/* Top row: Risk Score + Signal + Confidence */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 14,
                marginBottom: 16,
            }}>
                {/* Risk Score Gauge Card */}
                <div className="card" style={{
                    padding: "24px",
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}>
                    <div style={{
                        position: "absolute", top: 0, right: 0,
                        width: 140, height: 140,
                        background: `radial-gradient(circle at top right, ${levelCfg.bg}, transparent 70%)`,
                        pointerEvents: "none",
                    }} />
                    <div style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 12, fontWeight: 500, alignSelf: "flex-start" }}>
                        {t("riskEngine.riskScore")}
                    </div>

                    {/* SVG Half-circle gauge */}
                    <svg width={radius * 2 + stroke * 2} height={radius + stroke * 2 + 10} viewBox={`0 0 ${radius * 2 + stroke * 2} ${radius + stroke * 2 + 10}`}>
                        {/* Background arc */}
                        <path
                            d={`M ${stroke} ${radius + stroke} A ${radius} ${radius} 0 0 1 ${radius * 2 + stroke} ${radius + stroke}`}
                            fill="none"
                            stroke="var(--bg-active)"
                            strokeWidth={stroke}
                            strokeLinecap="round"
                        />
                        {/* Progress arc */}
                        <path
                            d={`M ${stroke} ${radius + stroke} A ${radius} ${radius} 0 0 1 ${radius * 2 + stroke} ${radius + stroke}`}
                            fill="none"
                            stroke={levelCfg.color}
                            strokeWidth={stroke}
                            strokeLinecap="round"
                            strokeDasharray={`${progress} ${circumference}`}
                            style={{ transition: "stroke-dasharray 0.8s ease" }}
                        />
                        {/* Score text */}
                        <text
                            x={radius + stroke}
                            y={radius + stroke - 8}
                            textAnchor="middle"
                            style={{ fontSize: 32, fontWeight: 800, fill: "var(--fg-primary)" }}
                        >
                            {risk.riskScore}
                        </text>
                        <text
                            x={radius + stroke}
                            y={radius + stroke + 14}
                            textAnchor="middle"
                            style={{ fontSize: 12, fontWeight: 600, fill: levelCfg.color }}
                        >
                            {t(levelCfg.label)}
                        </text>
                    </svg>
                </div>

                {/* Signal Card */}
                <div className="card" style={{
                    padding: "24px",
                    position: "relative",
                    overflow: "hidden",
                }}>
                    <div style={{
                        position: "absolute", top: 0, right: 0,
                        width: 140, height: 140,
                        background: `radial-gradient(circle at top right, ${sigCfg.bg}, transparent 70%)`,
                        pointerEvents: "none",
                    }} />
                    <div style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 12, fontWeight: 500 }}>
                        {t("riskEngine.signal")}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                        <div style={{
                            width: 48, height: 48,
                            borderRadius: "var(--radius-md)",
                            background: sigCfg.bg,
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <SigIcon size={24} color={sigCfg.color} />
                        </div>
                        <div>
                            <div style={{
                                fontSize: 22, fontWeight: 800,
                                color: sigCfg.color, letterSpacing: "-0.01em",
                            }}>
                                {t(signalLabelMap[risk.signal])}
                            </div>
                        </div>
                    </div>
                    <div style={{
                        fontSize: 12,
                        color: "var(--fg-secondary)",
                        lineHeight: 1.5,
                    }}>
                        {t(risk.signalReason)}
                    </div>
                </div>

                {/* Confidence Card */}
                <div className="card" style={{
                    padding: "24px",
                    position: "relative",
                    overflow: "hidden",
                }}>
                    <div style={{
                        position: "absolute", top: 0, right: 0, width: 140, height: 140,
                        background: "radial-gradient(circle at top right, var(--accent-soft), transparent 70%)",
                        pointerEvents: "none",
                    }} />
                    <div style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 12, fontWeight: 500 }}>
                        {t("riskEngine.confidence")}
                    </div>
                    <div style={{
                        fontSize: 36, fontWeight: 800,
                        color: "var(--accent)",
                        fontVariantNumeric: "tabular-nums",
                        letterSpacing: "-0.02em",
                        marginBottom: 8,
                    }}>
                        {risk.confidence}%
                    </div>
                    {/* Confidence bar */}
                    <div style={{
                        height: 6,
                        borderRadius: 3,
                        background: "var(--bg-active)",
                        overflow: "hidden",
                    }}>
                        <div style={{
                            height: "100%",
                            width: `${risk.confidence}%`,
                            borderRadius: 3,
                            background: "var(--accent)",
                            transition: "width 0.6s ease",
                        }} />
                    </div>
                </div>
            </div>

            {/* Key Risk Metrics Row */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: 12,
                marginBottom: 16,
            }}>
                {[
                    { label: t("riskEngine.volatility"), value: `${risk.metrics.annualizedVolatility}%`, color: risk.metrics.annualizedVolatility > 80 ? "var(--risk-high)" : risk.metrics.annualizedVolatility > 40 ? "var(--risk-medium)" : "var(--risk-low)" },
                    { label: t("riskEngine.maxDrawdown"), value: `${risk.metrics.maxDrawdown}%`, color: risk.metrics.maxDrawdown < -50 ? "var(--risk-high)" : risk.metrics.maxDrawdown < -20 ? "var(--risk-medium)" : "var(--risk-low)" },
                    { label: t("riskEngine.var95"), value: `${risk.metrics.var95}%`, color: risk.metrics.var95 < -5 ? "var(--risk-high)" : risk.metrics.var95 < -2 ? "var(--risk-medium)" : "var(--risk-low)" },
                    { label: t("riskEngine.portfolioVol"), value: `${risk.metrics.portfolioVolatility}%`, color: "var(--accent)" },
                ].map((m) => (
                    <div key={m.label} className="card" style={{ padding: "16px 18px" }}>
                        <div style={{ fontSize: 11, color: "var(--fg-muted)", marginBottom: 6, fontWeight: 500 }}>
                            {m.label}
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: m.color, fontVariantNumeric: "tabular-nums" }}>
                            {m.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* Technical Indicators Row */}
            <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <Gauge size={16} color="var(--fg-muted)" />
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--fg-primary)" }}>
                        {t("riskEngine.technicals")}
                    </span>
                </div>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: 12,
                }}>
                    {/* RSI */}
                    <div className="card" style={{ padding: "16px 18px" }}>
                        <div style={{ fontSize: 11, color: "var(--fg-muted)", marginBottom: 6, fontWeight: 500 }}>
                            {t("riskEngine.rsi14")}
                        </div>
                        <div style={{
                            fontSize: 18, fontWeight: 700, fontVariantNumeric: "tabular-nums",
                            color: risk.technicals.rsi14 > 70 ? "var(--risk-high)" : risk.technicals.rsi14 < 30 ? "#22c55e" : "var(--fg-primary)",
                        }}>
                            {risk.technicals.rsi14}
                        </div>
                        <div style={{ fontSize: 10, color: "var(--fg-dim)", marginTop: 4 }}>
                            {risk.technicals.rsi14 > 70 ? "Overbought" : risk.technicals.rsi14 < 30 ? "Oversold" : "Neutral"}
                        </div>
                    </div>
                    {/* SMA50 */}
                    <div className="card" style={{ padding: "16px 18px" }}>
                        <div style={{ fontSize: 11, color: "var(--fg-muted)", marginBottom: 6, fontWeight: 500 }}>
                            {t("riskEngine.sma50")}
                        </div>
                        <div style={{
                            fontSize: 16, fontWeight: 700, fontVariantNumeric: "tabular-nums",
                            color: risk.technicals.currentPrice > risk.technicals.sma50 ? "var(--risk-low)" : "var(--risk-high)",
                        }}>
                            ${formatPrice(risk.technicals.sma50)}
                        </div>
                        <div style={{ fontSize: 10, color: "var(--fg-dim)", marginTop: 4 }}>
                            {risk.technicals.currentPrice > risk.technicals.sma50 ? "Price Above" : "Price Below"}
                        </div>
                    </div>
                    {/* SMA200 */}
                    <div className="card" style={{ padding: "16px 18px" }}>
                        <div style={{ fontSize: 11, color: "var(--fg-muted)", marginBottom: 6, fontWeight: 500 }}>
                            {t("riskEngine.sma200")}
                        </div>
                        <div style={{
                            fontSize: 16, fontWeight: 700, fontVariantNumeric: "tabular-nums",
                            color: risk.technicals.currentPrice > risk.technicals.sma200 ? "var(--risk-low)" : "var(--risk-high)",
                        }}>
                            ${formatPrice(risk.technicals.sma200)}
                        </div>
                        <div style={{ fontSize: 10, color: "var(--fg-dim)", marginTop: 4 }}>
                            {risk.technicals.sma50 > risk.technicals.sma200 ? "Golden Cross ✨" : "Death Cross ⚠️"}
                        </div>
                    </div>
                    {/* Momentum */}
                    <div className="card" style={{ padding: "16px 18px" }}>
                        <div style={{ fontSize: 11, color: "var(--fg-muted)", marginBottom: 6, fontWeight: 500 }}>
                            {t("riskEngine.momentum")}
                        </div>
                        <div style={{
                            fontSize: 18, fontWeight: 700, fontVariantNumeric: "tabular-nums",
                            color: risk.technicals.momentum30d >= 0 ? "var(--risk-low)" : "var(--risk-high)",
                        }}>
                            {risk.technicals.momentum30d >= 0 ? "+" : ""}{risk.technicals.momentum30d}%
                        </div>
                    </div>
                </div>
            </div>

            {/* Disclaimer */}
            <div style={{
                fontSize: 11,
                color: "var(--fg-dim)",
                lineHeight: 1.5,
                padding: "12px 16px",
                background: "var(--bg-elevated)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
            }}>
                ⚠️ {t("riskEngine.disclaimer")}
            </div>
        </div>
    );
}


export default function CoinDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { t } = useTranslation();
    const coinId = params.coinId as string;

    const [detail, setDetail] = useState<CoinDetail | null>(null);
    const [chartData, setChartData] = useState<MarketChartData | null>(null);
    const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);
    const [dcaAnalysis, setDcaAnalysis] = useState<DCAAnalysis | null>(null);
    const [riskData, setRiskData] = useState<RiskAnalysis | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedRange, setSelectedRange] = useState(3); // default 1Y

    const fetchData = useCallback(async (days: number) => {
        setLoading(true);
        setError(null);
        try {
            const [coinDetail, chart] = await Promise.all([
                getCoinDetail(coinId),
                getCoinMarketChart(coinId, days),
            ]);
            setDetail(coinDetail);
            setChartData(chart);
            const trend = analyzeMarketTrend(chart, coinDetail);
            setAnalysis(trend);
            const dca = analyzeDCAZones(chart, coinDetail);
            setDcaAnalysis(dca);
            const risk = analyzeRisk(chart, coinDetail);
            setRiskData(risk);
        } catch {
            setError(t("coinDetail.error"));
        } finally {
            setLoading(false);
        }
    }, [coinId, t]);

    useEffect(() => {
        fetchData(TIME_RANGES[selectedRange].days);
    }, [selectedRange, fetchData]);

    const chartPoints = chartData?.prices.map(([ts, price]) => ({
        time: ts,
        price,
    })) ?? [];

    const priceChange24h = detail?.market_data.price_change_percentage_24h ?? 0;
    const isUp = priceChange24h >= 0;

    /* ── Custom tooltip ──────────────────────────────────────── */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ChartTooltip = ({ active, payload }: any) => {
        if (!active || !payload?.[0]) return null;
        const { time, price } = payload[0].payload;
        return (
            <div
                style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-strong)",
                    borderRadius: "var(--radius-md)",
                    padding: "10px 14px",
                    fontSize: 12,
                    boxShadow: "var(--shadow-lg)",
                }}
            >
                <div style={{ color: "var(--fg-muted)", marginBottom: 4 }}>
                    {new Date(time).toLocaleString()}
                </div>
                <div style={{ color: "var(--fg-primary)", fontWeight: 700, fontSize: 14 }}>
                    ${formatPrice(price)}
                </div>
            </div>
        );
    };

    return (
        <DashboardLayout
            title={detail?.name ?? t("coinDetail.loading")}
            subtitle={detail ? `${detail.symbol.toUpperCase()} · #${detail.market_cap_rank}` : ""}
        >
            {/* Back button */}
            <button
                onClick={() => router.push("/dashboard/portfolio")}
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 14px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border)",
                    background: "transparent",
                    color: "var(--fg-secondary)",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                    marginBottom: 20,
                    transition: "all 0.15s",
                }}
            >
                <ArrowLeft size={14} />
                {t("coinDetail.back")}
            </button>

            {loading && (
                <div
                    className="card"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                        padding: "80px 24px",
                        color: "var(--fg-muted)",
                        fontSize: 14,
                    }}
                >
                    <Loader2 size={22} style={{ animation: "spin 1s linear infinite" }} />
                    {t("coinDetail.loading")}
                </div>
            )}

            {error && !loading && (
                <div
                    className="card"
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 12,
                        padding: "80px 24px",
                        color: "var(--risk-high)",
                        fontSize: 14,
                    }}
                >
                    <span>{error}</span>
                    <button
                        onClick={() => fetchData(TIME_RANGES[selectedRange].days)}
                        style={{
                            padding: "6px 20px",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid var(--border)",
                            background: "var(--bg-elevated)",
                            color: "var(--fg-primary)",
                            fontSize: 13,
                            cursor: "pointer",
                        }}
                    >
                        {t("portfolio.retry")}
                    </button>
                </div>
            )}

            {!loading && !error && detail && (
                <>
                    {/* ── Coin Header ────────────────────────────────── */}
                    <div
                        className="card"
                        style={{
                            padding: "24px 28px",
                            marginBottom: 20,
                            display: "flex",
                            alignItems: "center",
                            gap: 20,
                            flexWrap: "wrap",
                        }}
                    >
                        <img
                            src={detail.image.large}
                            alt={detail.name}
                            width={56}
                            height={56}
                            style={{ borderRadius: "var(--radius-full)", flexShrink: 0 }}
                        />
                        <div style={{ flex: 1, minWidth: 200 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                                <h1 style={{
                                    margin: 0,
                                    fontSize: 28,
                                    fontWeight: 800,
                                    color: "var(--fg-primary)",
                                    letterSpacing: "-0.02em",
                                }}>
                                    {detail.name}
                                </h1>
                                <span className="badge badge-accent" style={{ fontSize: 13, fontWeight: 600 }}>
                                    {detail.symbol.toUpperCase()}
                                </span>
                            </div>
                            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 6 }}>
                                <span style={{
                                    fontSize: 32,
                                    fontWeight: 800,
                                    color: "var(--fg-primary)",
                                    fontVariantNumeric: "tabular-nums",
                                    letterSpacing: "-0.02em",
                                }}>
                                    ${formatPrice(detail.market_data.current_price.usd)}
                                </span>
                                <span
                                    style={{
                                        fontSize: 16,
                                        fontWeight: 700,
                                        color: isUp ? "var(--risk-low)" : "var(--risk-high)",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 4,
                                    }}
                                >
                                    {isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                    {isUp ? "+" : ""}{priceChange24h.toFixed(2)}%
                                </span>
                                <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>24h</span>
                            </div>
                        </div>
                    </div>

                    {/* ── Chart Section ──────────────────────────────── */}
                    <div className="card" style={{ padding: "24px 20px", marginBottom: 20 }}>
                        {/* Chart header + range selector */}
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 20,
                            flexWrap: "wrap",
                            gap: 12,
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <BarChart3 size={18} color="var(--accent)" />
                                <span style={{ fontSize: 16, fontWeight: 700, color: "var(--fg-primary)" }}>
                                    {t("coinDetail.priceChart")}
                                </span>
                            </div>
                            <div style={{ display: "flex", gap: 4 }}>
                                {TIME_RANGES.map((range, i) => (
                                    <button
                                        key={range.key}
                                        onClick={() => setSelectedRange(i)}
                                        style={{
                                            padding: "5px 14px",
                                            borderRadius: "var(--radius-full)",
                                            border: "1px solid",
                                            borderColor: i === selectedRange ? "var(--accent)" : "var(--border)",
                                            background: i === selectedRange ? "var(--accent-soft)" : "transparent",
                                            color: i === selectedRange ? "var(--accent)" : "var(--fg-muted)",
                                            fontSize: 12,
                                            fontWeight: 600,
                                            cursor: "pointer",
                                            transition: "all 0.15s",
                                        }}
                                    >
                                        {range.key}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Recharts Area */}
                        <div style={{ width: "100%", height: 360 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartPoints} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                                    <defs>
                                        <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={isUp ? "#34d399" : "#f87171"} stopOpacity={0.3} />
                                            <stop offset="100%" stopColor={isUp ? "#34d399" : "#f87171"} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="time"
                                        tickFormatter={(v) => formatChartDate(v, TIME_RANGES[selectedRange].days)}
                                        tick={{ fill: "var(--fg-dim)", fontSize: 11 }}
                                        axisLine={{ stroke: "var(--border)" }}
                                        tickLine={false}
                                        minTickGap={50}
                                    />
                                    <YAxis
                                        domain={["auto", "auto"]}
                                        tickFormatter={(v) => `$${formatPrice(v)}`}
                                        tick={{ fill: "var(--fg-dim)", fontSize: 11 }}
                                        axisLine={false}
                                        tickLine={false}
                                        width={80}
                                    />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="price"
                                        stroke={isUp ? "#34d399" : "#f87171"}
                                        strokeWidth={2}
                                        fill="url(#priceGradient)"
                                        animationDuration={800}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* ── Market Stats Grid ──────────────────────────── */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                        gap: 12,
                        marginBottom: 20,
                    }}>
                        {[
                            { icon: DollarSign, label: t("coinDetail.marketCap"), value: formatLargeNumber(detail.market_data.market_cap.usd) },
                            { icon: Activity, label: t("coinDetail.volume24h"), value: formatLargeNumber(detail.market_data.total_volume.usd) },
                            { icon: TrendingUp, label: t("coinDetail.high24h"), value: `$${formatPrice(detail.market_data.high_24h.usd)}` },
                            { icon: TrendingDown, label: t("coinDetail.low24h"), value: `$${formatPrice(detail.market_data.low_24h.usd)}` },
                            { icon: Target, label: t("coinDetail.ath"), value: `$${formatPrice(detail.market_data.ath.usd)}` },
                            { icon: Layers, label: t("coinDetail.circulatingSupply"), value: detail.market_data.circulating_supply.toLocaleString(undefined, { maximumFractionDigits: 0 }) },
                        ].map((stat) => {
                            const Icon = stat.icon;
                            return (
                                <div key={stat.label} className="card" style={{ padding: "16px 18px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                        <Icon size={15} color="var(--fg-muted)" />
                                        <span style={{ fontSize: 12, color: "var(--fg-muted)", fontWeight: 500 }}>
                                            {stat.label}
                                        </span>
                                    </div>
                                    <div style={{
                                        fontSize: 16,
                                        fontWeight: 700,
                                        color: "var(--fg-primary)",
                                        fontVariantNumeric: "tabular-nums",
                                    }}>
                                        {stat.value}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* ── Risk Dashboard ──────────────────────────────── */}
                    {riskData && <RiskDashboardSection risk={riskData} t={t} />}

                    {/* ── Market Analysis ─────────────────────────────── */}
                    {analysis && (
                        <div>
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                marginBottom: 16,
                            }}>
                                <BarChart3 size={18} color="var(--accent)" />
                                <span style={{ fontSize: 16, fontWeight: 700, color: "var(--fg-primary)" }}>
                                    {t("coinDetail.marketAnalysis")}
                                </span>
                                <span className="badge badge-accent" style={{ fontSize: 11 }}>
                                    AI
                                </span>
                            </div>

                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                                gap: 16,
                            }}>
                                {[
                                    {
                                        title: t("coinDetail.shortTerm"),
                                        subtitle: t("coinDetail.shortTermDesc"),
                                        icon: Clock,
                                        data: analysis.shortTerm,
                                    },
                                    {
                                        title: t("coinDetail.mediumTerm"),
                                        subtitle: t("coinDetail.mediumTermDesc"),
                                        icon: Calendar,
                                        data: analysis.mediumTerm,
                                    },
                                    {
                                        title: t("coinDetail.longTerm"),
                                        subtitle: t("coinDetail.longTermDesc"),
                                        icon: CalendarRange,
                                        data: analysis.longTerm,
                                    },
                                ].map((term) => {
                                    const cfg = trendConfig[term.data.direction];
                                    const TrendIcon = cfg.icon;
                                    const TermIcon = term.icon;
                                    return (
                                        <div
                                            key={term.title}
                                            className="card"
                                            style={{
                                                padding: "24px",
                                                position: "relative",
                                                overflow: "hidden",
                                            }}
                                        >
                                            {/* Decorative gradient corner */}
                                            <div style={{
                                                position: "absolute",
                                                top: 0,
                                                right: 0,
                                                width: 120,
                                                height: 120,
                                                background: `radial-gradient(circle at top right, ${cfg.bg}, transparent 70%)`,
                                                pointerEvents: "none",
                                            }} />

                                            {/* Term header */}
                                            <div style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 10,
                                                marginBottom: 6,
                                            }}>
                                                <TermIcon size={16} color="var(--fg-muted)" />
                                                <span style={{
                                                    fontSize: 14,
                                                    fontWeight: 700,
                                                    color: "var(--fg-primary)",
                                                }}>
                                                    {term.title}
                                                </span>
                                            </div>
                                            <div style={{
                                                fontSize: 11,
                                                color: "var(--fg-muted)",
                                                marginBottom: 18,
                                            }}>
                                                {term.subtitle}
                                            </div>

                                            {/* Trend badge */}
                                            <div style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 10,
                                                marginBottom: 16,
                                            }}>
                                                <div style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 6,
                                                    padding: "6px 14px",
                                                    borderRadius: "var(--radius-full)",
                                                    background: cfg.bg,
                                                    color: cfg.color,
                                                    fontSize: 13,
                                                    fontWeight: 700,
                                                }}>
                                                    <TrendIcon size={15} />
                                                    {t(`coinDetail.trend${term.data.direction.charAt(0).toUpperCase() + term.data.direction.slice(1)}`)}
                                                </div>
                                                <span style={{
                                                    fontSize: 15,
                                                    fontWeight: 700,
                                                    color: term.data.priceChange >= 0 ? "var(--risk-low)" : "var(--risk-high)",
                                                    fontVariantNumeric: "tabular-nums",
                                                }}>
                                                    {term.data.priceChange >= 0 ? "+" : ""}
                                                    {term.data.priceChange}%
                                                </span>
                                            </div>

                                            {/* Confidence bar */}
                                            <div style={{ marginBottom: 6 }}>
                                                <div style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    fontSize: 11,
                                                    color: "var(--fg-muted)",
                                                    marginBottom: 6,
                                                }}>
                                                    <span>{t("coinDetail.confidence")}</span>
                                                    <span style={{ fontWeight: 600, color: "var(--fg-secondary)" }}>
                                                        {term.data.confidence}%
                                                    </span>
                                                </div>
                                                <div style={{
                                                    height: 6,
                                                    borderRadius: 3,
                                                    background: "var(--bg-active)",
                                                    overflow: "hidden",
                                                }}>
                                                    <div style={{
                                                        height: "100%",
                                                        width: `${term.data.confidence}%`,
                                                        borderRadius: 3,
                                                        background: cfg.color,
                                                        transition: "width 0.6s ease",
                                                    }} />
                                                </div>
                                            </div>

                                            {/* Summary */}
                                            <div style={{
                                                fontSize: 12,
                                                color: "var(--fg-secondary)",
                                                lineHeight: 1.6,
                                                marginTop: 14,
                                            }}>
                                                {t(term.data.summaryKey)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ── DCA & HOLD Analysis ─────────────────────────── */}
                    {dcaAnalysis && <DCASection dca={dcaAnalysis} t={t} />}
                </>
            )}
        </DashboardLayout>
    );
}
