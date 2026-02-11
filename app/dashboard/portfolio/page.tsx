"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Plus, ArrowUpDown, RefreshCw, Loader2 } from "lucide-react";
import { useTranslation } from "../../i18n/LanguageContext";
import { getCoinList, type CryptoCoin } from "../../lib/crypto-api";

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
function formatMarketCap(value: number): string {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toLocaleString()}`;
}

export default function PortfolioPage() {
    const { t } = useTranslation();

    /* ── Tab state ────────────────────────────────────────────── */
    const TAB_CRYPTO = 4; // index of crypto tab
    const [activeTab, setActiveTab] = useState(0);

    /* ── Crypto state ─────────────────────────────────────────── */
    const [coins, setCoins] = useState<CryptoCoin[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    return (
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

            {/* ── Crypto tab ──────────────────────────────────────── */}
            {isCrypto ? (
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
                                                        $
                                                        {coin.current_price.toLocaleString(
                                                            undefined,
                                                            {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 6,
                                                            }
                                                        )}
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
                                            $
                                            {a.price.toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                            })}
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
    );
}
