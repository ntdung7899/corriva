"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../../components/DashboardLayout";
import { Plus, ArrowUpDown, RefreshCw, Loader2, Trash2, TrendingUp, TrendingDown, Wallet, PieChart as PieIcon, BarChart3 } from "lucide-react";
import { useTranslation } from "../../i18n/LanguageContext";
import { getCoinList, getCoinMarketChart, type CryptoCoin, type MarketChartData } from "../../lib/crypto-api";
import { getPortfolio, removeHolding, aggregatePortfolio, type AggregatedHolding } from "../../lib/portfolio-store";
import AddAssetModal from "../../components/AddAssetModal";
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
    AreaChart, Area, XAxis, YAxis,
} from "recharts";

/* ── Static stock assets ─────────────────────────────────────── */
const assets = [
    {
        name: "Apple Inc.",
        ticker: "AAPL",
        allocation: 12.5,
        price: 242.31,
        volatility: 18.2,
        risk: "High" as const,
        change: 1.24,
    },
    {
        name: "Microsoft Corp.",
        ticker: "MSFT",
        allocation: 10.8,
        price: 458.72,
        volatility: 15.6,
        risk: "Low" as const,
        change: 0.87,
    },
    {
        name: "Vanguard Total Bond",
        ticker: "BND",
        allocation: 25.0,
        price: 72.45,
        volatility: 4.2,
        risk: "Low" as const,
        change: -0.12,
    },
    {
        name: "NVIDIA Corp.",
        ticker: "NVDA",
        allocation: 8.3,
        price: 892.14,
        volatility: 42.1,
        risk: "High" as const,
        change: 3.45,
    },
    {
        name: "iShares MSCI EAFE",
        ticker: "EFA",
        allocation: 11.2,
        price: 82.31,
        volatility: 12.8,
        risk: "Medium" as const,
        change: -0.34,
    },
    {
        name: "Prologis Inc.",
        ticker: "PLD",
        allocation: 5.0,
        price: 128.55,
        volatility: 19.4,
        risk: "Medium" as const,
        change: 0.56,
    },
    {
        name: "SPDR Gold Shares",
        ticker: "GLD",
        allocation: 5.0,
        price: 218.9,
        volatility: 14.1,
        risk: "Low" as const,
        change: 0.92,
    },
    {
        name: "Amazon.com Inc.",
        ticker: "AMZN",
        allocation: 9.2,
        price: 215.63,
        volatility: 22.7,
        risk: "Medium" as const,
        change: -1.15,
    },
    {
        name: "JPMorgan Chase",
        ticker: "JPM",
        allocation: 7.0,
        price: 248.9,
        volatility: 16.3,
        risk: "Medium" as const,
        change: 0.42,
    },
    {
        nameKey: "portfolio.cashEquivalents",
        ticker: "CASH",
        allocation: 6.0,
        price: 1.0,
        volatility: 0.0,
        risk: "Low" as const,
        change: 0.0,
    },
];

type RiskLevel = "High" | "Medium" | "Low";

/* ── Helper: format large numbers ────────────────────────────── */
export default function PortfolioPage() {
    const { t, locale } = useTranslation();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    /* ── Tab state ────────────────────────────────────────────── */
    const TAB_CRYPTO = 4; // index of crypto tab
    const TAB_MY_PORTFOLIO = 5;
    const [activeTab, setActiveTab] = useState(0);

    /* ── Crypto state ─────────────────────────────────────────── */
    const [coins, setCoins] = useState<CryptoCoin[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /* ── Helper: format with locale ────────────────────────────── */
    const formatPrice = (v: number) => {
        if (!mounted) return v.toFixed(2);
        const l = locale === "vi" ? "vi-VN" : "en-US";
        if (v >= 1) return v.toLocaleString(l, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return v.toLocaleString(l, { minimumFractionDigits: 2, maximumFractionDigits: 6 });
    };

    const formatMarketCap = (v: number) => {
        if (!mounted) return `$${(v / 1e9).toFixed(2)}B`;
        const l = locale === "vi" ? "vi-VN" : "en-US";
        if (v >= 1e12) return `$${(v / 1e12).toLocaleString(l, { maximumFractionDigits: 2 })}T`;
        if (v >= 1e9) return `$${(v / 1e9).toLocaleString(l, { maximumFractionDigits: 2 })}B`;
        if (v >= 1e6) return `$${(v / 1e6).toLocaleString(l, { maximumFractionDigits: 2 })}M`;
        return `$${v.toLocaleString(l)}`;
    };

    const PIE_COLORS = ["#38bdf8", "#34d399", "#fbbf24", "#f87171", "#a78bfa", "#fb923c", "#2dd4bf", "#e879f9", "#60a5fa", "#4ade80"];

    /* ── Modal state ───────────────────────────────────────────── */
    const [modalOpen, setModalOpen] = useState(false);

    /* ── My Portfolio state ─────────────────────────────────────── */
    const [holdings, setHoldings] = useState<AggregatedHolding[]>([]);
    const [coinPrices, setCoinPrices] = useState<Map<string, CryptoCoin>>(new Map());
    const [portfolioChart, setPortfolioChart] = useState<{ time: number; value: number }[]>([]);
    const [portfolioLoading, setPortfolioLoading] = useState(false);

    const refreshPortfolio = useCallback(() => {
        const raw = getPortfolio();
        const agg = aggregatePortfolio(raw);
        setHoldings(agg);
    }, []);

    // Fetch coin prices for portfolio holdings
    const fetchPortfolioPrices = useCallback(async (agg: AggregatedHolding[]) => {
        if (agg.length === 0) return;
        setPortfolioLoading(true);
        try {
            const allCoins = await getCoinList(100);
            const priceMap = new Map<string, CryptoCoin>();
            allCoins.forEach((c) => priceMap.set(c.id, c));
            setCoinPrices(priceMap);

            // Fetch chart data for portfolio value over time (top 5 holdings)
            const topHoldings = agg.slice(0, 5);
            const chartPromises = topHoldings.map((h) => getCoinMarketChart(h.coinId, 30));
            const charts = await Promise.all(chartPromises);

            // Combine into portfolio value chart
            if (charts.length > 0) {
                const timePoints = charts[0].prices.map(([ts]) => ts);
                const combined = timePoints.map((ts, idx) => {
                    let value = 0;
                    charts.forEach((chart, ci) => {
                        const price = chart.prices[idx]?.[1] ?? 0;
                        value += price * topHoldings[ci].totalQuantity;
                    });
                    // Add remaining holdings at current price
                    agg.slice(5).forEach((h) => {
                        const cp = priceMap.get(h.coinId);
                        if (cp) value += cp.current_price * h.totalQuantity;
                    });
                    return { time: ts, value };
                });
                setPortfolioChart(combined);
            }
        } catch { /* ignore */ } finally {
            setPortfolioLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === TAB_MY_PORTFOLIO) {
            refreshPortfolio();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === TAB_MY_PORTFOLIO && holdings.length > 0) {
            fetchPortfolioPrices(holdings);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [holdings.length, activeTab]);

    const fetchCoins = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getCoinList(50);
            setCoins(data);
        } catch {
            setError(t("portfolio.error"));
        } finally {
            setLoading(false);
        }
    }, [t]);

    // Fetch when crypto tab is activated
    useEffect(() => {
        if (activeTab === TAB_CRYPTO && coins.length === 0) {
            fetchCoins();
        }
    }, [activeTab, coins.length, fetchCoins, TAB_CRYPTO]);

    /* ── Translations ─────────────────────────────────────────── */
    const riskTranslation: Record<RiskLevel, string> = {
        High: t("portfolio.riskHigh"),
        Medium: t("portfolio.riskMedium"),
        Low: t("portfolio.riskLow"),
    };

    const riskBadge = (level: RiskLevel) => {
        const cls =
            level === "Low"
                ? "badge-low"
                : level === "High"
                    ? "badge-high"
                    : "badge-medium";
        return <span className={`badge ${cls}`}>{riskTranslation[level]}</span>;
    };

    const tabs = [
        t("portfolio.allAssets"),
        t("portfolio.equities"),
        t("portfolio.fixedIncome"),
        t("portfolio.alternatives"),
        t("portfolio.crypto"),
        t("myPortfolio.tab"),
    ];

    const stockHeaders = [
        t("portfolio.asset"),
        t("portfolio.allocation"),
        t("portfolio.currentPrice"),
        t("portfolio.change24h"),
        t("portfolio.volatility"),
        t("portfolio.riskLevel"),
    ];

    const cryptoHeaders = [
        t("portfolio.rank"),
        t("portfolio.asset"),
        t("portfolio.symbol"),
        t("portfolio.currentPrice"),
        t("portfolio.change24h"),
        t("portfolio.marketCap"),
        t("portfolio.volume"),
    ];

    const isCrypto = activeTab === TAB_CRYPTO;
    const isMyPortfolio = activeTab === TAB_MY_PORTFOLIO;

    // Calculate portfolio analytics
    const portfolioAnalytics = (() => {
        if (holdings.length === 0) return null;
        let totalValue = 0;
        let totalInvested = 0;
        let topGainer = { name: "", pnlPct: -Infinity };
        let topLoser = { name: "", pnlPct: Infinity };

        const allocationData: { name: string; value: number; color: string }[] = [];

        holdings.forEach((h, i) => {
            const cp = coinPrices.get(h.coinId);
            const currentPrice = cp?.current_price ?? h.avgBuyPrice;
            const holdingValue = currentPrice * h.totalQuantity;
            const pnlPct = ((currentPrice - h.avgBuyPrice) / h.avgBuyPrice) * 100;

            totalValue += holdingValue;
            totalInvested += h.totalInvested;

            if (pnlPct > topGainer.pnlPct) topGainer = { name: h.symbol.toUpperCase(), pnlPct };
            if (pnlPct < topLoser.pnlPct) topLoser = { name: h.symbol.toUpperCase(), pnlPct };

            allocationData.push({
                name: h.symbol.toUpperCase(),
                value: holdingValue,
                color: PIE_COLORS[i % PIE_COLORS.length],
            });
        });

        const totalPnl = totalValue - totalInvested;
        const totalPnlPct = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;
        const diversScore = Math.min(100, holdings.length * 15 + 10);

        return {
            totalValue, totalInvested, totalPnl, totalPnlPct,
            numAssets: holdings.length,
            topGainer, topLoser,
            diversScore,
            allocationData,
        };
    })();

    return (
        <>
            <AddAssetModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onAdded={() => { refreshPortfolio(); setActiveTab(TAB_MY_PORTFOLIO); }}
            />
            <DashboardLayout
                title={t("portfolio.title")}
                subtitle={t("portfolio.subtitle")}
            >
                {/* Header row */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 20,
                        flexWrap: "wrap",
                        gap: 12,
                    }}
                >
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {tabs.map((tab, i) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(i)}
                                style={{
                                    padding: "7px 16px",
                                    borderRadius: "var(--radius-full)",
                                    border: "1px solid var(--border)",
                                    background:
                                        i === activeTab ? "var(--accent-soft)" : "transparent",
                                    color: i === activeTab ? "var(--accent)" : "var(--fg-secondary)",
                                    fontSize: 13,
                                    fontWeight: 500,
                                    cursor: "pointer",
                                    transition: "all 0.15s",
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        {isCrypto && (
                            <button
                                onClick={fetchCoins}
                                disabled={loading}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                    padding: "8px 14px",
                                    borderRadius: "var(--radius-md)",
                                    border: "1px solid var(--border)",
                                    background: "transparent",
                                    color: "var(--fg-secondary)",
                                    fontSize: 13,
                                    fontWeight: 500,
                                    cursor: loading ? "not-allowed" : "pointer",
                                    opacity: loading ? 0.5 : 1,
                                    transition: "all 0.15s",
                                }}
                            >
                                <RefreshCw
                                    size={14}
                                    style={{
                                        animation: loading ? "spin 1s linear infinite" : "none",
                                    }}
                                />
                                {t("portfolio.retry")}
                            </button>
                        )}
                        <button
                            onClick={() => setModalOpen(true)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "8px 18px",
                                borderRadius: "var(--radius-md)",
                                border: "none",
                                background: "var(--accent)",
                                color: "#fff",
                                fontSize: 13,
                                fontWeight: 600,
                                cursor: "pointer",
                                boxShadow: "0 0 16px rgba(56, 189, 248, 0.25)",
                                transition: "transform 0.15s, box-shadow 0.15s",
                            }}
                        >
                            <Plus size={15} />
                            {t("portfolio.addAsset")}
                        </button>
                    </div>
                </div>

                {/* ── My Portfolio tab ────────────────────────────────── */}
                {isMyPortfolio ? (
                    <>
                        {portfolioLoading && (
                            <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "48px", color: "var(--fg-muted)", fontSize: 14 }}>
                                <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} /> {t("coinDetail.loading")}
                            </div>
                        )}

                        {holdings.length === 0 && !portfolioLoading && (
                            <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "60px 24px" }}>
                                <Wallet size={40} color="var(--fg-dim)" />
                                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--fg-secondary)" }}>{t("myPortfolio.empty")}</div>
                                <button onClick={() => setModalOpen(true)} style={{ padding: "10px 24px", borderRadius: "var(--radius-md)", border: "none", background: "var(--accent)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                                    <Plus size={15} /> {t("myPortfolio.addFirst")}
                                </button>
                            </div>
                        )}

                        {holdings.length > 0 && portfolioAnalytics && !portfolioLoading && (
                            <>
                                {/* Summary cards */}
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 20 }}>
                                    <div className="card" style={{ padding: "18px 20px" }}>
                                        <div style={{ fontSize: 11, color: "var(--fg-muted)", marginBottom: 6, fontWeight: 500 }}>{t("myPortfolio.totalValue")}</div>
                                        <div style={{ fontSize: 22, fontWeight: 800, color: "var(--fg-primary)", fontVariantNumeric: "tabular-nums" }}>${formatPrice(portfolioAnalytics.totalValue)}</div>
                                    </div>
                                    <div className="card" style={{ padding: "18px 20px" }}>
                                        <div style={{ fontSize: 11, color: "var(--fg-muted)", marginBottom: 6, fontWeight: 500 }}>{t("myPortfolio.totalPnL")}</div>
                                        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                                            <span style={{ fontSize: 22, fontWeight: 800, color: portfolioAnalytics.totalPnl >= 0 ? "var(--risk-low)" : "var(--risk-high)", fontVariantNumeric: "tabular-nums" }}>
                                                {portfolioAnalytics.totalPnl >= 0 ? "+" : ""}${formatPrice(Math.abs(portfolioAnalytics.totalPnl))}
                                            </span>
                                            <span style={{ fontSize: 13, fontWeight: 700, color: portfolioAnalytics.totalPnlPct >= 0 ? "var(--risk-low)" : "var(--risk-high)" }}>
                                                {portfolioAnalytics.totalPnlPct >= 0 ? "+" : ""}{portfolioAnalytics.totalPnlPct.toFixed(2)}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="card" style={{ padding: "18px 20px" }}>
                                        <div style={{ fontSize: 11, color: "var(--fg-muted)", marginBottom: 6, fontWeight: 500 }}>{t("myPortfolio.diversification")}</div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <span style={{ fontSize: 22, fontWeight: 800, color: "var(--accent)", fontVariantNumeric: "tabular-nums" }}>{portfolioAnalytics.diversScore}</span>
                                            <div style={{ flex: 1, height: 6, borderRadius: 3, background: "var(--bg-active)", maxWidth: 80 }}>
                                                <div style={{ height: "100%", width: `${portfolioAnalytics.diversScore}%`, borderRadius: 3, background: "var(--accent)" }} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card" style={{ padding: "18px 20px" }}>
                                        <div style={{ fontSize: 11, color: "var(--fg-muted)", marginBottom: 6, fontWeight: 500 }}>{t("myPortfolio.assets")}</div>
                                        <div style={{ fontSize: 22, fontWeight: 800, color: "var(--fg-primary)" }}>{portfolioAnalytics.numAssets}</div>
                                    </div>
                                </div>

                                {/* Charts row */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                                    {/* Portfolio Value Chart */}
                                    <div className="card" style={{ padding: "20px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                                            <BarChart3 size={16} color="var(--accent)" />
                                            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--fg-primary)" }}>{t("myPortfolio.valueChart")}</span>
                                        </div>
                                        {portfolioChart.length > 0 ? (
                                            <div style={{ width: "100%", height: 220 }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={portfolioChart} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                                                        <defs>
                                                            <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.3} />
                                                                <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <XAxis dataKey="time" tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { month: "short", day: "numeric" })} tick={{ fill: "var(--fg-dim)", fontSize: 10 }} axisLine={{ stroke: "var(--border)" }} tickLine={false} minTickGap={40} />
                                                        <YAxis domain={["auto", "auto"]} tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(1) + "k" : v.toFixed(0)}`} tick={{ fill: "var(--fg-dim)", fontSize: 10 }} axisLine={false} tickLine={false} width={55} />
                                                        <Tooltip content={({ active, payload }) => { if (!active || !payload?.[0]) return null; return (<div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-strong)", borderRadius: 8, padding: "8px 12px", fontSize: 12 }}><div style={{ color: "var(--fg-muted)", marginBottom: 2 }}>{new Date(payload[0].payload.time).toLocaleDateString()}</div><div style={{ color: "var(--fg-primary)", fontWeight: 700 }}>${formatPrice(payload[0].payload.value)}</div></div>); }} />
                                                        <Area type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={2} fill="url(#portfolioGradient)" animationDuration={800} />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        ) : (
                                            <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--fg-dim)", fontSize: 13 }}>{t("myPortfolio.noChartData")}</div>
                                        )}
                                    </div>

                                    {/* Allocation Pie Chart */}
                                    <div className="card" style={{ padding: "20px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                                            <PieIcon size={16} color="var(--accent)" />
                                            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--fg-primary)" }}>{t("myPortfolio.allocation")}</span>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                            <div style={{ width: 180, height: 180 }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie data={portfolioAnalytics.allocationData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} animationDuration={600}>
                                                            {portfolioAnalytics.allocationData.map((entry, i) => (
                                                                <Cell key={i} fill={entry.color} stroke="transparent" />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip formatter={(value: number | undefined) => value != null ? `$${formatPrice(value)}` : ""} contentStyle={{ background: "var(--bg-elevated)", border: "1px solid var(--border-strong)", borderRadius: 8, fontSize: 12 }} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                {portfolioAnalytics.allocationData.map((d) => {
                                                    const pct = portfolioAnalytics.totalValue > 0 ? (d.value / portfolioAnalytics.totalValue * 100) : 0;
                                                    return (
                                                        <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                                            <div style={{ width: 10, height: 10, borderRadius: 3, background: d.color, flexShrink: 0 }} />
                                                            <span style={{ fontSize: 12, color: "var(--fg-secondary)", flex: 1 }}>{d.name}</span>
                                                            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--fg-primary)", fontVariantNumeric: "tabular-nums" }}>{pct.toFixed(1)}%</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Analytics row */}
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 20 }}>
                                    <div className="card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
                                        <div style={{ width: 36, height: 36, borderRadius: "var(--radius-md)", background: "var(--risk-low-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <TrendingUp size={18} color="var(--risk-low)" />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 11, color: "var(--fg-muted)", fontWeight: 500 }}>{t("myPortfolio.topGainer")}</div>
                                            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--risk-low)" }}>{portfolioAnalytics.topGainer.name} +{portfolioAnalytics.topGainer.pnlPct.toFixed(1)}%</div>
                                        </div>
                                    </div>
                                    <div className="card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
                                        <div style={{ width: 36, height: 36, borderRadius: "var(--radius-md)", background: "var(--risk-high-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <TrendingDown size={18} color="var(--risk-high)" />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 11, color: "var(--fg-muted)", fontWeight: 500 }}>{t("myPortfolio.topLoser")}</div>
                                            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--risk-high)" }}>{portfolioAnalytics.topLoser.name} {portfolioAnalytics.topLoser.pnlPct.toFixed(1)}%</div>
                                        </div>
                                    </div>
                                    <div className="card" style={{ padding: "16px 20px" }}>
                                        <div style={{ fontSize: 11, color: "var(--fg-muted)", marginBottom: 4, fontWeight: 500 }}>{t("myPortfolio.totalInvested")}</div>
                                        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--fg-primary)", fontVariantNumeric: "tabular-nums" }}>${formatPrice(portfolioAnalytics.totalInvested)}</div>
                                    </div>
                                </div>

                                {/* Holdings table */}
                                <div className="card" style={{ overflow: "hidden", marginBottom: 16 }}>
                                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                                        <thead>
                                            <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-elevated)" }}>
                                                {[t("myPortfolio.coin"), t("myPortfolio.qty"), t("myPortfolio.avgBuy"), t("myPortfolio.currentPrice"), t("myPortfolio.pnl"), t("myPortfolio.allocationPct"), ""].map((h, i) => (
                                                    <th key={i} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 500, color: "var(--fg-muted)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {holdings.map((h, i) => {
                                                const cp = coinPrices.get(h.coinId);
                                                const currentPrice = cp?.current_price ?? h.avgBuyPrice;
                                                const holdingValue = currentPrice * h.totalQuantity;
                                                const pnl = holdingValue - h.totalInvested;
                                                const pnlPct = ((currentPrice - h.avgBuyPrice) / h.avgBuyPrice) * 100;
                                                const allocPct = portfolioAnalytics.totalValue > 0 ? (holdingValue / portfolioAnalytics.totalValue * 100) : 0;
                                                return (
                                                    <tr key={h.coinId} style={{ borderBottom: i < holdings.length - 1 ? "1px solid var(--border)" : "none", transition: "background 0.1s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                                                        <td style={{ padding: "14px 16px" }}>
                                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                                <img src={h.image} alt={h.coinName} width={28} height={28} style={{ borderRadius: "var(--radius-full)" }} />
                                                                <div>
                                                                    <div style={{ fontWeight: 600, color: "var(--fg-primary)" }}>{h.coinName}</div>
                                                                    <div style={{ fontSize: 11, color: "var(--fg-dim)", textTransform: "uppercase" }}>{h.symbol}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: "14px 16px", fontWeight: 600, color: "var(--fg-primary)", fontVariantNumeric: "tabular-nums" }}>{h.totalQuantity.toLocaleString(undefined, { maximumFractionDigits: 6 })}</td>
                                                        <td style={{ padding: "14px 16px", fontWeight: 600, color: "var(--fg-secondary)", fontVariantNumeric: "tabular-nums" }}>${formatPrice(h.avgBuyPrice)}</td>
                                                        <td style={{ padding: "14px 16px", fontWeight: 600, color: "var(--fg-primary)", fontVariantNumeric: "tabular-nums" }}>${formatPrice(currentPrice)}</td>
                                                        <td style={{ padding: "14px 16px" }}>
                                                            <div style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums", color: pnl >= 0 ? "var(--risk-low)" : "var(--risk-high)" }}>
                                                                {pnl >= 0 ? "+" : ""}${formatPrice(Math.abs(pnl))}
                                                            </div>
                                                            <div style={{ fontSize: 11, fontWeight: 600, color: pnlPct >= 0 ? "var(--risk-low)" : "var(--risk-high)" }}>
                                                                {pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(2)}%
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: "14px 16px" }}>
                                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                                <div style={{ flex: 1, height: 4, borderRadius: 2, background: "var(--bg-active)", maxWidth: 60 }}>
                                                                    <div style={{ height: "100%", width: `${Math.min(100, allocPct)}%`, borderRadius: 2, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                                                                </div>
                                                                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--fg-primary)", fontVariantNumeric: "tabular-nums" }}>{allocPct.toFixed(1)}%</span>
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: "14px 16px" }}>
                                                            <button onClick={() => { h.entries.forEach((e) => removeHolding(e.id)); refreshPortfolio(); }} style={{ background: "transparent", border: "none", color: "var(--fg-dim)", cursor: "pointer", padding: 4, borderRadius: "var(--radius-md)" }} title={t("myPortfolio.remove")}>
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </>
                ) : isCrypto ? (
                    <>
                        {loading && (
                            <div
                                className="card"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 10,
                                    padding: "48px 24px",
                                    color: "var(--fg-muted)",
                                    fontSize: 14,
                                }}
                            >
                                <Loader2
                                    size={20}
                                    style={{ animation: "spin 1s linear infinite" }}
                                />
                                {t("portfolio.loading")}
                            </div>
                        )}

                        {error && !loading && (
                            <div
                                className="card"
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 12,
                                    padding: "48px 24px",
                                    color: "var(--risk-high)",
                                    fontSize: 14,
                                }}
                            >
                                <span>{error}</span>
                                <button
                                    onClick={fetchCoins}
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

                        {!loading && !error && coins.length > 0 && (
                            <>
                                <div
                                    className="card"
                                    style={{ overflow: "hidden" }}
                                >
                                    <table
                                        style={{
                                            width: "100%",
                                            borderCollapse: "collapse",
                                            fontSize: 13,
                                        }}
                                    >
                                        <thead>
                                            <tr
                                                style={{
                                                    borderBottom: "1px solid var(--border)",
                                                    background: "var(--bg-elevated)",
                                                }}
                                            >
                                                {cryptoHeaders.map((h) => (
                                                    <th
                                                        key={h}
                                                        style={{
                                                            padding: "12px 16px",
                                                            textAlign: "left",
                                                            fontWeight: 500,
                                                            color: "var(--fg-muted)",
                                                            fontSize: 12,
                                                            textTransform: "uppercase",
                                                            letterSpacing: "0.04em",
                                                            whiteSpace: "nowrap",
                                                            cursor: "pointer",
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                display: "inline-flex",
                                                                alignItems: "center",
                                                                gap: 4,
                                                            }}
                                                        >
                                                            {h}
                                                            <ArrowUpDown
                                                                size={11}
                                                                color="var(--fg-dim)"
                                                            />
                                                        </span>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {coins.map((coin, i) => {
                                                const change = coin.price_change_percentage_24h ?? 0;
                                                return (
                                                    <tr
                                                        key={coin.id}
                                                        onClick={() => router.push(`/dashboard/portfolio/${coin.id}`)}
                                                        style={{
                                                            borderBottom:
                                                                i < coins.length - 1
                                                                    ? "1px solid var(--border)"
                                                                    : "none",
                                                            transition: "background 0.1s",
                                                            cursor: "pointer",
                                                        }}
                                                        onMouseEnter={(e) =>
                                                        (e.currentTarget.style.background =
                                                            "var(--bg-hover)")
                                                        }
                                                        onMouseLeave={(e) =>
                                                        (e.currentTarget.style.background =
                                                            "transparent")
                                                        }
                                                    >
                                                        {/* Rank */}
                                                        <td
                                                            style={{
                                                                padding: "14px 16px",
                                                                fontVariantNumeric: "tabular-nums",
                                                                color: "var(--fg-muted)",
                                                                fontWeight: 500,
                                                            }}
                                                        >
                                                            #{coin.market_cap_rank}
                                                        </td>
                                                        {/* Asset */}
                                                        <td style={{ padding: "14px 16px" }}>
                                                            <div
                                                                style={{
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: 10,
                                                                }}
                                                            >
                                                                <img
                                                                    src={coin.image}
                                                                    alt={coin.name}
                                                                    width={28}
                                                                    height={28}
                                                                    style={{
                                                                        borderRadius: "var(--radius-full)",
                                                                        flexShrink: 0,
                                                                    }}
                                                                />
                                                                <div
                                                                    style={{
                                                                        fontWeight: 600,
                                                                        color: "var(--fg-primary)",
                                                                        fontSize: 13,
                                                                    }}
                                                                >
                                                                    {coin.name}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        {/* Symbol */}
                                                        <td
                                                            style={{
                                                                padding: "14px 16px",
                                                                fontWeight: 600,
                                                                color: "var(--fg-secondary)",
                                                                textTransform: "uppercase",
                                                                fontSize: 12,
                                                            }}
                                                        >
                                                            {coin.symbol}
                                                        </td>
                                                        {/* Price */}
                                                        <td
                                                            style={{
                                                                padding: "14px 16px",
                                                                fontWeight: 600,
                                                                color: "var(--fg-primary)",
                                                                fontVariantNumeric: "tabular-nums",
                                                            }}
                                                        >
                                                            ${formatPrice(coin.current_price)}
                                                        </td>
                                                        {/* 24h Change */}
                                                        <td
                                                            style={{
                                                                padding: "14px 16px",
                                                                fontWeight: 600,
                                                                fontVariantNumeric: "tabular-nums",
                                                                color:
                                                                    change > 0
                                                                        ? "var(--risk-low)"
                                                                        : change < 0
                                                                            ? "var(--risk-high)"
                                                                            : "var(--fg-dim)",
                                                            }}
                                                        >
                                                            {change > 0 ? "+" : ""}
                                                            {change.toFixed(2)}%
                                                        </td>
                                                        {/* Market Cap */}
                                                        <td
                                                            style={{
                                                                padding: "14px 16px",
                                                                fontVariantNumeric: "tabular-nums",
                                                                color: "var(--fg-secondary)",
                                                                fontWeight: 500,
                                                            }}
                                                        >
                                                            {formatMarketCap(coin.market_cap)}
                                                        </td>
                                                        {/* Volume */}
                                                        <td
                                                            style={{
                                                                padding: "14px 16px",
                                                                fontVariantNumeric: "tabular-nums",
                                                                color: "var(--fg-secondary)",
                                                            }}
                                                        >
                                                            {formatMarketCap(coin.total_volume)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Summary */}
                                <div
                                    style={{
                                        display: "flex",
                                        gap: 24,
                                        justifyContent: "flex-end",
                                        marginTop: 16,
                                        fontSize: 12,
                                        color: "var(--fg-muted)",
                                    }}
                                >
                                    <span>
                                        {t("portfolio.totalCoins")}{" "}
                                        <strong style={{ color: "var(--fg-primary)" }}>
                                            {coins.length}
                                        </strong>
                                    </span>
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    /* ── Stock assets tab (original) ─────────────────── */
                    <>
                        <div
                            className="card"
                            style={{ overflow: "hidden" }}
                        >
                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                    fontSize: 13,
                                }}
                            >
                                <thead>
                                    <tr
                                        style={{
                                            borderBottom: "1px solid var(--border)",
                                            background: "var(--bg-elevated)",
                                        }}
                                    >
                                        {stockHeaders.map((h) => (
                                            <th
                                                key={h}
                                                style={{
                                                    padding: "12px 16px",
                                                    textAlign: "left",
                                                    fontWeight: 500,
                                                    color: "var(--fg-muted)",
                                                    fontSize: 12,
                                                    textTransform: "uppercase",
                                                    letterSpacing: "0.04em",
                                                    whiteSpace: "nowrap",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: 4,
                                                    }}
                                                >
                                                    {h}
                                                    <ArrowUpDown size={11} color="var(--fg-dim)" />
                                                </span>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {assets.map((a, i) => (
                                        <tr
                                            key={a.ticker}
                                            style={{
                                                borderBottom:
                                                    i < assets.length - 1
                                                        ? "1px solid var(--border)"
                                                        : "none",
                                                transition: "background 0.1s",
                                                cursor: "pointer",
                                            }}
                                            onMouseEnter={(e) =>
                                                (e.currentTarget.style.background = "var(--bg-hover)")
                                            }
                                            onMouseLeave={(e) =>
                                                (e.currentTarget.style.background = "transparent")
                                            }
                                        >
                                            {/* Asset */}
                                            <td style={{ padding: "14px 16px" }}>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 10,
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            width: 32,
                                                            height: 32,
                                                            borderRadius: "var(--radius-md)",
                                                            background: "var(--bg-active)",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            fontSize: 11,
                                                            fontWeight: 700,
                                                            color: "var(--fg-secondary)",
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        {a.ticker.slice(0, 2)}
                                                    </div>
                                                    <div>
                                                        <div
                                                            style={{
                                                                fontWeight: 600,
                                                                color: "var(--fg-primary)",
                                                                fontSize: 13,
                                                            }}
                                                        >
                                                            {"nameKey" in a
                                                                ? t(
                                                                    (a as { nameKey: string })
                                                                        .nameKey
                                                                )
                                                                : a.name}
                                                        </div>
                                                        <div
                                                            style={{
                                                                fontSize: 11,
                                                                color: "var(--fg-dim)",
                                                                marginTop: 1,
                                                            }}
                                                        >
                                                            {a.ticker}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Allocation */}
                                            <td style={{ padding: "14px 16px" }}>
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 10,
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            flex: 1,
                                                            height: 4,
                                                            borderRadius: 2,
                                                            background: "var(--bg-active)",
                                                            maxWidth: 80,
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                height: "100%",
                                                                width: `${(a.allocation / 30) * 100}%`,
                                                                borderRadius: 2,
                                                                background: "var(--accent)",
                                                                maxWidth: "100%",
                                                            }}
                                                        />
                                                    </div>
                                                    <span
                                                        style={{
                                                            fontWeight: 600,
                                                            color: "var(--fg-primary)",
                                                            fontVariantNumeric: "tabular-nums",
                                                        }}
                                                    >
                                                        {a.allocation}%
                                                    </span>
                                                </div>
                                            </td>
                                            {/* Price */}
                                            <td
                                                style={{
                                                    padding: "14px 16px",
                                                    fontWeight: 600,
                                                    color: "var(--fg-primary)",
                                                    fontVariantNumeric: "tabular-nums",
                                                }}
                                            >
                                                ${formatPrice(a.price)}
                                            </td>
                                            {/* Change */}
                                            <td
                                                style={{
                                                    padding: "14px 16px",
                                                    fontWeight: 600,
                                                    fontVariantNumeric: "tabular-nums",
                                                    color:
                                                        a.change > 0
                                                            ? "var(--risk-low)"
                                                            : a.change < 0
                                                                ? "var(--risk-high)"
                                                                : "var(--fg-dim)",
                                                }}
                                            >
                                                {a.change > 0 ? "+" : ""}
                                                {a.change.toFixed(2)}%
                                            </td>
                                            {/* Volatility */}
                                            <td
                                                style={{
                                                    padding: "14px 16px",
                                                    fontVariantNumeric: "tabular-nums",
                                                    color: "var(--fg-secondary)",
                                                }}
                                            >
                                                {a.volatility}%
                                            </td>
                                            {/* Risk */}
                                            <td style={{ padding: "14px 16px" }}>
                                                {riskBadge(a.risk)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Summary bar */}
                        <div
                            style={{
                                display: "flex",
                                gap: 24,
                                justifyContent: "flex-end",
                                marginTop: 16,
                                fontSize: 12,
                                color: "var(--fg-muted)",
                            }}
                        >
                            <span>
                                {t("portfolio.totalAssets")}{" "}
                                <strong style={{ color: "var(--fg-primary)" }}>10</strong>
                            </span>
                            <span>
                                {t("portfolio.avgVolatility")}{" "}
                                <strong style={{ color: "var(--fg-primary)" }}>16.5%</strong>
                            </span>
                            <span>
                                {t("portfolio.portfolioBeta")}{" "}
                                <strong style={{ color: "var(--fg-primary)" }}>1.12</strong>
                            </span>
                        </div>
                    </>
                )}
            </DashboardLayout>
        </>
    );
}
