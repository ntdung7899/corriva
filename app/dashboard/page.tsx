"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../components/DashboardLayout";
import CircularProgress from "../components/CircularProgress";
import MetricCard from "../components/MetricCard";
import PerformanceChart from "../components/PerformanceChart";
import AllocationChart from "../components/AllocationChart";
import AddAssetModal from "../components/AddAssetModal";
import {
  DollarSign,
  Activity,
  GitBranch,
  BrainCircuit,
  TrendingUp,
  TrendingDown,
  Plus,
  Wallet,
  ArrowRight,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { useTranslation } from "../i18n/LanguageContext";
import {
  getPortfolio,
  aggregatePortfolio,
  type AggregatedHolding,
} from "../lib/portfolio-store";
import {
  getCoinList,
  getCoinMarketChart,
  getCoinDetail,
  type CryptoCoin,
  type MarketChartData,
  type CoinDetail,
} from "../lib/crypto-api";
import {
  analyzePortfolioRisk,
  type PortfolioCoinInput,
  type PortfolioRiskSummary,
} from "../lib/risk-engine";

export default function OverviewPage() {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  /* ── Portfolio state ────────────────────────────────────────── */
  const [holdings, setHoldings] = useState<AggregatedHolding[]>([]);
  const [coinPrices, setCoinPrices] = useState<Map<string, CryptoCoin>>(
    new Map()
  );
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  /* ── Risk analysis state ────────────────────────────────────── */
  const [riskSummary, setRiskSummary] = useState<PortfolioRiskSummary | null>(
    null
  );
  const [riskLoading, setRiskLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  /* ── Load portfolio from localStorage ──────────────────────── */
  const refreshPortfolio = useCallback(() => {
    const raw = getPortfolio();
    const agg = aggregatePortfolio(raw);
    setHoldings(agg);
    return agg;
  }, []);

  /* ── Fetch live prices for portfolio coins ─────────────────── */
  const fetchPrices = useCallback(async (agg: AggregatedHolding[]) => {
    if (agg.length === 0) {
      setPortfolioLoading(false);
      return;
    }
    try {
      const allCoins = await getCoinList(100);
      const priceMap = new Map<string, CryptoCoin>();
      allCoins.forEach((c) => priceMap.set(c.id, c));
      setCoinPrices(priceMap);
    } catch {
      /* silent */
    } finally {
      setPortfolioLoading(false);
    }
  }, []);

  /* ── In-memory cache for chart/detail data (avoid re-fetching) ── */
  const chartCacheRef = React.useRef<
    Map<string, { chartData: MarketChartData; coinDetail: CoinDetail }>
  >(new Map());

  /* ── Full portfolio risk analysis ──────────────────────────── */
  const runRiskAnalysis = useCallback(
    async (agg: AggregatedHolding[], priceMap: Map<string, CryptoCoin>) => {
      if (agg.length === 0) {
        setRiskSummary(null);
        return;
      }
      setRiskLoading(true);
      try {
        const DELAY_BETWEEN_COINS = 1500; // ms between API calls to avoid 429
        const cache = chartCacheRef.current;

        // Fetch chart data + coin detail SEQUENTIALLY with delay
        const coinDataResults: {
          holding: AggregatedHolding;
          chartData: MarketChartData;
          coinDetail: CoinDetail;
        }[] = [];

        for (let i = 0; i < agg.length; i++) {
          const h = agg[i];

          // Check cache first
          if (cache.has(h.coinId)) {
            const cached = cache.get(h.coinId)!;
            coinDataResults.push({
              holding: h,
              chartData: cached.chartData,
              coinDetail: cached.coinDetail,
            });
            continue;
          }

          // Add delay between API calls (not before the first one)
          if (i > 0) {
            await new Promise((r) => setTimeout(r, DELAY_BETWEEN_COINS));
          }

          const [chartData, coinDetail] = await Promise.all([
            getCoinMarketChart(h.coinId, 365),
            getCoinDetail(h.coinId),
          ]);

          // Store in cache
          cache.set(h.coinId, { chartData, coinDetail });
          coinDataResults.push({ holding: h, chartData, coinDetail });
        }

        // Calculate total portfolio value
        const totalValue = coinDataResults.reduce((sum, cd) => {
          const cp =
            priceMap.get(cd.holding.coinId)?.current_price ??
            cd.coinDetail.market_data.current_price.usd;
          return sum + cp * cd.holding.totalQuantity;
        }, 0);

        // Build inputs for risk engine
        const inputs: PortfolioCoinInput[] = coinDataResults.map((cd) => {
          const cp =
            priceMap.get(cd.holding.coinId)?.current_price ??
            cd.coinDetail.market_data.current_price.usd;
          const holdingValue = cp * cd.holding.totalQuantity;
          return {
            coinId: cd.holding.coinId,
            coinName: cd.holding.coinName,
            symbol: cd.holding.symbol,
            image: cd.holding.image,
            weight: totalValue > 0 ? holdingValue / totalValue : 0,
            holdingValue,
            chartData: cd.chartData,
            coinDetail: cd.coinDetail,
          };
        });

        const summary = analyzePortfolioRisk(inputs);
        setRiskSummary(summary);
      } catch (err) {
        console.error("Portfolio risk analysis failed:", err);
      } finally {
        setRiskLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const init = async () => {
      const agg = refreshPortfolio();
      await fetchPrices(agg);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Run risk analysis after prices are loaded
  useEffect(() => {
    if (!portfolioLoading && holdings.length > 0 && coinPrices.size > 0) {
      runRiskAnalysis(holdings, coinPrices);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portfolioLoading, holdings.length, coinPrices.size]);

  /* ── Format helpers ─────────────────────────────────────────── */
  const formatPrice = (v: number) => {
    if (!mounted) return v.toFixed(2);
    const l = locale === "vi" ? "vi-VN" : "en-US";
    if (v >= 1)
      return v.toLocaleString(l, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    return v.toLocaleString(l, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  };

  /* ── Calculate portfolio totals ─────────────────────────────── */
  const portfolioStats = (() => {
    if (holdings.length === 0) return null;
    let totalValue = 0;
    let totalInvested = 0;

    holdings.forEach((h) => {
      const cp = coinPrices.get(h.coinId);
      const currentPrice = cp?.current_price ?? h.avgBuyPrice;
      totalValue += currentPrice * h.totalQuantity;
      totalInvested += h.totalInvested;
    });

    const totalPnl = totalValue - totalInvested;
    const totalPnlPct =
      totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

    return { totalValue, totalInvested, totalPnl, totalPnlPct };
  })();

  /* ── Chart data for PerformanceChart ────────────────────────── */
  const perfChartData =
    riskSummary?.valueChart.map((pt) => ({
      label: new Date(pt.time).toLocaleDateString(
        locale === "vi" ? "vi-VN" : "en-US",
        { day: "2-digit", month: "short" }
      ),
      value: Number(pt.value.toFixed(2)),
    })) ?? [];

  /* ── Risk level i18n ────────────────────────────────────────── */
  const riskLevelLabel = riskSummary
    ? t(`riskEngine.level${riskSummary.riskLevel.charAt(0).toUpperCase() + riskSummary.riskLevel.slice(1)}`)
    : t("riskEngine.levelLow");

  /* ── AI Risk description builder ────────────────────────────── */
  const buildAIDescription = () => {
    if (!riskSummary || !portfolioStats) return t("overview.aiDescription");

    const coinNames = holdings.map((h) => h.coinName).join(", ");
    const riskColor =
      riskSummary.riskLevel === "low"
        ? "var(--risk-low)"
        : riskSummary.riskLevel === "moderate"
          ? "var(--risk-medium)"
          : "var(--risk-high)";

    if (locale === "vi") {
      return `Danh mục gồm <strong style="color: var(--fg-primary)">${coinNames}</strong> với tổng giá trị <strong>$${formatPrice(portfolioStats.totalValue)}</strong>. Mức rủi ro hiện tại: <strong style="color: ${riskColor}">${riskLevelLabel}</strong> (${riskSummary.riskScore}/100). Biến động trung bình hàng năm <strong>${riskSummary.volatility.toFixed(1)}%</strong>, VaR 95% là <strong>${riskSummary.var95.toFixed(2)}%</strong> mỗi ngày. ${riskSummary.correlation > 0.5
        ? `Tương quan giữa các coin khá cao (<strong style="color: var(--risk-high)">${riskSummary.correlation.toFixed(2)}</strong>), làm giảm hiệu quả đa dạng hóa.`
        : `Tương quan giữa các coin ở mức thấp (<strong style="color: var(--risk-low)">${riskSummary.correlation.toFixed(2)}</strong>), danh mục được đa dạng hóa tốt.`
        } Tỷ lệ Sharpe: <strong>${riskSummary.sharpe}</strong>. ${riskSummary.sharpe >= 1
          ? "Lợi nhuận điều chỉnh rủi ro đang ở mức thuận lợi."
          : riskSummary.sharpe >= 0
            ? "Lợi nhuận tạm ổn, nên theo dõi thêm."
            : "Lợi nhuận chưa bù đắp rủi ro, cân nhắc tái cân bằng."
        }`;
    }

    return `Portfolio consists of <strong style="color: var(--fg-primary)">${coinNames}</strong> with total value <strong>$${formatPrice(portfolioStats.totalValue)}</strong>. Current risk level: <strong style="color: ${riskColor}">${riskLevelLabel}</strong> (${riskSummary.riskScore}/100). Annualized volatility is <strong>${riskSummary.volatility.toFixed(1)}%</strong>, daily VaR (95%) at <strong>${riskSummary.var95.toFixed(2)}%</strong>. ${riskSummary.correlation > 0.5
      ? `Pairwise correlation is high (<strong style="color: var(--risk-high)">${riskSummary.correlation.toFixed(2)}</strong>), reducing diversification benefit.`
      : `Pairwise correlation is low (<strong style="color: var(--risk-low)">${riskSummary.correlation.toFixed(2)}</strong>), portfolio is well diversified.`
      } Sharpe ratio: <strong>${riskSummary.sharpe}</strong>. ${riskSummary.sharpe >= 1
        ? "Risk-adjusted returns are favorable."
        : riskSummary.sharpe >= 0
          ? "Returns are acceptable, continue monitoring."
          : "Returns do not compensate for risk. Consider rebalancing."
      }`;
  };

  return (
    <>
      <AddAssetModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdded={() => {
          const agg = refreshPortfolio();
          fetchPrices(agg);
        }}
      />

      <DashboardLayout
        title={t("overview.title")}
        subtitle={t("overview.subtitle")}
      >
        {/* ── My Portfolio Section ─────────────────────────────── */}
        <div
          className="card-glow"
          style={{
            padding: "24px 28px",
            marginBottom: 24,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
                <Wallet size={18} color="var(--accent)" />
              </div>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "var(--fg-primary)",
                }}
              >
                {t("overview.myPortfolioTitle")}
              </span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setModalOpen(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
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
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateY(-1px)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
              >
                <Plus size={15} />
                {t("overview.addCoin")}
              </button>
              {holdings.length > 0 && (
                <button
                  onClick={() => router.push("/dashboard/portfolio")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 16px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border)",
                    background: "transparent",
                    color: "var(--fg-secondary)",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--accent)";
                    e.currentTarget.style.color = "var(--accent)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.color = "var(--fg-secondary)";
                  }}
                >
                  {t("overview.viewAll")}
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Loading state */}
          {portfolioLoading && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                padding: "40px",
                color: "var(--fg-muted)",
                fontSize: 14,
              }}
            >
              <Loader2
                size={18}
                style={{ animation: "spin 1s linear infinite" }}
              />
              {t("overview.loadingPortfolio")}
            </div>
          )}

          {/* Empty state */}
          {!portfolioLoading && holdings.length === 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "40px 20px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "var(--radius-full)",
                  background:
                    "linear-gradient(135deg, rgba(56,189,248,0.15), rgba(99,102,241,0.15))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Wallet size={28} color="var(--fg-dim)" strokeWidth={1.5} />
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "var(--fg-secondary)",
                  marginBottom: 6,
                }}
              >
                {t("overview.emptyPortfolio")}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--fg-muted)",
                  marginBottom: 20,
                  maxWidth: 340,
                  lineHeight: 1.6,
                }}
              >
                {t("overview.emptyPortfolioDesc")}
              </div>
              <button
                onClick={() => setModalOpen(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 28px",
                  borderRadius: "var(--radius-md)",
                  border: "none",
                  background:
                    "linear-gradient(135deg, var(--accent), #6366f1)",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow:
                    "0 0 24px rgba(56, 189, 248, 0.3), 0 4px 16px rgba(0,0,0,0.2)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 0 32px rgba(56, 189, 248, 0.4), 0 6px 20px rgba(0,0,0,0.25)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 0 24px rgba(56, 189, 248, 0.3), 0 4px 16px rgba(0,0,0,0.2)";
                }}
              >
                <Plus size={16} />
                {t("overview.addFirstCoin")}
              </button>
            </div>
          )}

          {/* Portfolio with holdings */}
          {!portfolioLoading && holdings.length > 0 && (
            <>
              {/* Summary stats row */}
              {portfolioStats && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 14,
                    marginBottom: 20,
                  }}
                >
                  {/* Total Value */}
                  <div
                    style={{
                      padding: "14px 18px",
                      background: "var(--bg-elevated)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--fg-muted)",
                        marginBottom: 6,
                        fontWeight: 500,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {t("overview.totalValue")}
                    </div>
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 800,
                        color: "var(--fg-primary)",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      ${formatPrice(portfolioStats.totalValue)}
                    </div>
                  </div>

                  {/* P&L */}
                  <div
                    style={{
                      padding: "14px 18px",
                      background: "var(--bg-elevated)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--fg-muted)",
                        marginBottom: 6,
                        fontWeight: 500,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {t("overview.totalPnL")}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 20,
                          fontWeight: 800,
                          fontVariantNumeric: "tabular-nums",
                          color:
                            portfolioStats.totalPnl >= 0
                              ? "var(--risk-low)"
                              : "var(--risk-high)",
                        }}
                      >
                        {portfolioStats.totalPnl >= 0 ? "+" : ""}$
                        {formatPrice(Math.abs(portfolioStats.totalPnl))}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color:
                            portfolioStats.totalPnlPct >= 0
                              ? "var(--risk-low)"
                              : "var(--risk-high)",
                        }}
                      >
                        {portfolioStats.totalPnlPct >= 0 ? "+" : ""}
                        {portfolioStats.totalPnlPct.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  {/* Number of coins */}
                  <div
                    style={{
                      padding: "14px 18px",
                      background: "var(--bg-elevated)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--fg-muted)",
                        marginBottom: 6,
                        fontWeight: 500,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {t("overview.numCoins")}
                    </div>
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: 800,
                        color: "var(--accent)",
                      }}
                    >
                      {holdings.length}
                    </div>
                  </div>
                </div>
              )}

              {/* Holdings list */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 0 }}
              >
                {holdings.slice(0, 5).map((h, i) => {
                  const cp = coinPrices.get(h.coinId);
                  const currentPrice = cp?.current_price ?? h.avgBuyPrice;
                  const holdingValue = currentPrice * h.totalQuantity;
                  const pnlPct =
                    ((currentPrice - h.avgBuyPrice) / h.avgBuyPrice) * 100;
                  const change24h = cp?.price_change_percentage_24h ?? 0;

                  return (
                    <div
                      key={h.coinId}
                      onClick={() =>
                        router.push(`/dashboard/portfolio/${h.coinId}`)
                      }
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "12px 4px",
                        borderBottom:
                          i < Math.min(holdings.length, 5) - 1
                            ? "1px solid var(--border)"
                            : "none",
                        cursor: "pointer",
                        borderRadius: "var(--radius-sm)",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "var(--bg-hover)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      {/* Coin icon + name */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <img
                          src={h.image}
                          alt={h.coinName}
                          width={32}
                          height={32}
                          style={{
                            borderRadius: "var(--radius-full)",
                            flexShrink: 0,
                          }}
                        />
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: 600,
                              color: "var(--fg-primary)",
                              fontSize: 14,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {h.coinName}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--fg-dim)",
                              textTransform: "uppercase",
                              fontWeight: 500,
                            }}
                          >
                            {h.symbol}
                          </div>
                        </div>
                      </div>

                      {/* Current price + 24h change */}
                      <div
                        style={{
                          textAlign: "right",
                          minWidth: 110,
                          paddingRight: 20,
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 600,
                            color: "var(--fg-primary)",
                            fontSize: 14,
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          ${formatPrice(currentPrice)}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color:
                              change24h >= 0
                                ? "var(--risk-low)"
                                : "var(--risk-high)",
                          }}
                        >
                          {change24h >= 0 ? "+" : ""}
                          {change24h.toFixed(2)}%
                        </div>
                      </div>

                      {/* Holding value + PnL */}
                      <div style={{ textAlign: "right", minWidth: 120 }}>
                        <div
                          style={{
                            fontWeight: 700,
                            color: "var(--fg-primary)",
                            fontSize: 14,
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          ${formatPrice(holdingValue)}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color:
                              pnlPct >= 0
                                ? "var(--risk-low)"
                                : "var(--risk-high)",
                          }}
                        >
                          {pnlPct >= 0 ? (
                            <TrendingUp
                              size={10}
                              style={{
                                display: "inline",
                                marginRight: 3,
                                verticalAlign: "middle",
                              }}
                            />
                          ) : (
                            <TrendingDown
                              size={10}
                              style={{
                                display: "inline",
                                marginRight: 3,
                                verticalAlign: "middle",
                              }}
                            />
                          )}
                          {pnlPct >= 0 ? "+" : ""}
                          {pnlPct.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Show more indicator */}
                {holdings.length > 5 && (
                  <div
                    onClick={() => router.push("/dashboard/portfolio")}
                    style={{
                      textAlign: "center",
                      padding: "12px",
                      color: "var(--accent)",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      borderTop: "1px solid var(--border)",
                      marginTop: 4,
                    }}
                  >
                    +{holdings.length - 5} more →
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Top Cards Grid ───────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gap: 20,
            marginBottom: 24,
          }}
        >
          {/* Risk Score Card */}
          <div
            className="card-glow"
            style={{
              padding: "28px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gridRow: "1 / 3",
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "var(--fg-secondary)",
                marginBottom: 20,
                alignSelf: "flex-start",
              }}
            >
              {t("overview.overallRiskScore")}
              {riskLoading && (
                <Loader2
                  size={12}
                  style={{
                    display: "inline-block",
                    marginLeft: 8,
                    animation: "spin 1s linear infinite",
                    verticalAlign: "middle",
                  }}
                />
              )}
            </div>
            <CircularProgress
              value={riskSummary?.riskScore ?? 0}
              label="/ 100"
              sublabel={riskSummary ? riskLevelLabel : "—"}
              size={170}
              strokeWidth={12}
            />
            <div
              style={{
                display: "flex",
                gap: 12,
                marginTop: 20,
                width: "100%",
              }}
            >
              {[
                {
                  label: "VaR 95%",
                  value: riskSummary
                    ? `${riskSummary.var95.toFixed(1)}%`
                    : "—",
                  color: "var(--risk-high)",
                },
                {
                  label: "Sharpe",
                  value: riskSummary ? `${riskSummary.sharpe}` : "—",
                  color: "var(--accent)",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    background: "var(--bg-elevated)",
                    borderRadius: "var(--radius-md)",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      color: "var(--fg-muted)",
                      marginBottom: 2,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: item.color,
                    }}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Metric Cards */}
          <MetricCard
            icon={DollarSign}
            title={t("overview.portfolioValue")}
            value={
              portfolioStats
                ? `$${formatPrice(portfolioStats.totalValue)}`
                : "$0.00"
            }
            change={
              portfolioStats
                ? `${portfolioStats.totalPnlPct >= 0 ? "+" : ""}${portfolioStats.totalPnlPct.toFixed(1)}%`
                : "0.0%"
            }
            changeType={
              portfolioStats
                ? portfolioStats.totalPnlPct >= 0
                  ? "positive"
                  : "negative"
                : "neutral"
            }
            accentColor="var(--accent)"
          />
          <MetricCard
            icon={Activity}
            title={t("overview.volatilityAnn")}
            value={
              riskSummary ? `${riskSummary.volatility.toFixed(1)}%` : "—"
            }
            change={
              riskSummary
                ? riskSummary.volatility > 50
                  ? locale === "vi"
                    ? "Biến động cao"
                    : "High volatility"
                  : locale === "vi"
                    ? "Biến động trung bình"
                    : "Moderate volatility"
                : "—"
            }
            changeType={
              riskSummary
                ? riskSummary.volatility > 50
                  ? "negative"
                  : "neutral"
                : "neutral"
            }
            accentColor="var(--warning)"
          />
          <MetricCard
            icon={GitBranch}
            title={t("overview.correlationConc")}
            value={
              riskSummary ? riskSummary.correlation.toFixed(2) : "—"
            }
            change={
              riskSummary
                ? riskSummary.correlation > 0.6
                  ? locale === "vi"
                    ? "Tương quan cao"
                    : "High correlation"
                  : locale === "vi"
                    ? "Đa dạng hóa tốt"
                    : "Well diversified"
                : "—"
            }
            changeType={
              riskSummary
                ? riskSummary.correlation > 0.6
                  ? "negative"
                  : "positive"
                : "neutral"
            }
            accentColor="#6366f1"
          />

          {/* AI Explanation block — spans 3 columns, second row */}
          <div
            className="card"
            style={{
              gridColumn: "2 / 5",
              padding: "20px 24px",
              display: "flex",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "var(--radius-md)",
                background: riskSummary
                  ? "var(--accent-soft)"
                  : "var(--bg-elevated)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {riskLoading ? (
                <Loader2
                  size={18}
                  color="var(--fg-dim)"
                  style={{ animation: "spin 1s linear infinite" }}
                />
              ) : riskSummary ? (
                <BrainCircuit
                  size={18}
                  color="var(--accent)"
                  strokeWidth={2}
                />
              ) : (
                <ShieldAlert size={18} color="var(--fg-dim)" />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--fg-primary)",
                  }}
                >
                  {t("overview.aiRiskAnalysis")}
                </span>
                {riskSummary && (
                  <span className="badge badge-accent">
                    {t("overview.live")}
                  </span>
                )}
              </div>
              <p
                style={{
                  fontSize: 13,
                  lineHeight: 1.65,
                  color: "var(--fg-secondary)",
                  margin: 0,
                }}
                dangerouslySetInnerHTML={{
                  __html: riskLoading
                    ? locale === "vi"
                      ? "Đang phân tích rủi ro danh mục..."
                      : "Analyzing portfolio risk..."
                    : buildAIDescription(),
                }}
              />
            </div>
          </div>
        </div>

        {/* ── Charts Row ───────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: 20,
          }}
        >
          <PerformanceChart
            data={perfChartData}
            title={
              locale === "vi"
                ? "Hiệu suất Danh mục (30 ngày)"
                : "Portfolio Performance (30d)"
            }
            subtitle={
              locale === "vi"
                ? "Giá trị danh mục theo thời gian"
                : "Portfolio value over time"
            }
          />
          <AllocationChart
            data={riskSummary?.allocation}
          />
        </div>
      </DashboardLayout>
    </>
  );
}
