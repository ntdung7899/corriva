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


export default function CoinDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { t } = useTranslation();
    const coinId = params.coinId as string;

    const [detail, setDetail] = useState<CoinDetail | null>(null);
    const [chartData, setChartData] = useState<MarketChartData | null>(null);
    const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);
    const [dcaAnalysis, setDcaAnalysis] = useState<DCAAnalysis | null>(null);
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
