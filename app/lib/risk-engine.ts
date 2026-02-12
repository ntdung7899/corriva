/**
 * Risk Engine – comprehensive quantitative risk analysis for crypto assets.
 *
 * Calculates: daily returns, annualized volatility, max drawdown, VaR 95%,
 * correlation risk, portfolio volatility, composite risk score (0–100),
 * risk level, RSI(14), SMA50/200, momentum, signal, and confidence.
 */

import type { MarketChartData, CoinDetail } from "./crypto-api";

/* ── Public types ──────────────────────────────────────────────── */

export type RiskLevel = "low" | "moderate" | "high" | "extreme";

export type Signal =
    | "buy"
    | "hold"
    | "sell"
    | "accumulate"
    | "reduceRisk";

export interface TechnicalIndicators {
    rsi14: number;           // 0–100
    sma50: number;
    sma200: number;
    momentum30d: number;     // percentage
    currentPrice: number;
}

export interface RiskMetrics {
    dailyReturns: number[];
    annualizedVolatility: number;   // percentage
    maxDrawdown: number;            // percentage (negative)
    var95: number;                  // percentage (negative)
    correlationRisk: number;        // 0–1 (placeholder for single asset)
    portfolioVolatility: number;    // same as annualizedVolatility for single asset
}

export interface RiskAnalysis {
    metrics: RiskMetrics;
    riskScore: number;              // 0–100
    riskLevel: RiskLevel;
    technicals: TechnicalIndicators;
    signal: Signal;
    signalReason: string;           // i18n key explaining the signal
    confidence: number;             // 0–100%
}

/* ── Internal helpers ──────────────────────────────────────────── */

/** Compute daily returns from a price series */
function calcDailyReturns(prices: number[]): number[] {
    const returns: number[] = [];
    for (let i = 1; i < prices.length; i++) {
        if (prices[i - 1] !== 0) {
            returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
        }
    }
    return returns;
}

/** Standard deviation of an array */
function stdDev(arr: number[]): number {
    if (arr.length < 2) return 0;
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    const variance = arr.reduce((sum, v) => sum + (v - mean) ** 2, 0) / (arr.length - 1);
    return Math.sqrt(variance);
}

/** Mean of an array */
function mean(arr: number[]): number {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/** Annualized volatility (crypto = 365 trading days) */
function annualizedVol(dailyReturns: number[]): number {
    return stdDev(dailyReturns) * Math.sqrt(365) * 100; // as percentage
}

/** Maximum Drawdown – worst peak-to-trough decline */
function maxDrawdown(prices: number[]): number {
    if (prices.length < 2) return 0;
    let peak = prices[0];
    let worstDD = 0;
    for (const p of prices) {
        if (p > peak) peak = p;
        const dd = (p - peak) / peak;
        if (dd < worstDD) worstDD = dd;
    }
    return worstDD * 100; // as percentage (negative)
}

/** Value at Risk (95%) assuming normal distribution */
function valueAtRisk95(dailyReturns: number[]): number {
    const m = mean(dailyReturns);
    const s = stdDev(dailyReturns);
    return (m - 1.65 * s) * 100; // as percentage (negative expected)
}

/** RSI (Relative Strength Index) with given period */
function calcRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) return 50; // neutral fallback

    let avgGain = 0;
    let avgLoss = 0;

    // Initial SMA for gains and losses
    for (let i = 1; i <= period; i++) {
        const change = prices[i] - prices[i - 1];
        if (change > 0) avgGain += change;
        else avgLoss += Math.abs(change);
    }
    avgGain /= period;
    avgLoss /= period;

    // Smooth using Wilder's EMA
    for (let i = period + 1; i < prices.length; i++) {
        const change = prices[i] - prices[i - 1];
        if (change > 0) {
            avgGain = (avgGain * (period - 1) + change) / period;
            avgLoss = (avgLoss * (period - 1)) / period;
        } else {
            avgGain = (avgGain * (period - 1)) / period;
            avgLoss = (avgLoss * (period - 1) + Math.abs(change)) / period;
        }
    }

    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - 100 / (1 + rs);
}

/** Simple Moving Average */
function calcSMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1] ?? 0;
    const slice = prices.slice(-period);
    return slice.reduce((a, b) => a + b, 0) / period;
}

/** Normalize a value into 0–1 given min/max bounds */
function normalize(value: number, minVal: number, maxVal: number): number {
    if (maxVal === minVal) return 0.5;
    return Math.max(0, Math.min(1, (value - minVal) / (maxVal - minVal)));
}

/* ── Signal determination ──────────────────────────────────────── */

function determineSignal(
    rsi: number,
    price: number,
    sma50: number,
    sma200: number,
    volatility: number,
    prevVolatility: number
): { signal: Signal; reasonKey: string } {
    const volatilityRising = volatility > prevVolatility;

    // Rule 1: RSI < 35 AND price < SMA50 → Accumulate
    if (rsi < 35 && price < sma50) {
        return { signal: "accumulate", reasonKey: "riskEngine.signalAccumulateReason" };
    }

    // Rule 2: RSI > 70 AND volatility rising → Reduce Risk
    if (rsi > 70 && volatilityRising) {
        return { signal: "reduceRisk", reasonKey: "riskEngine.signalReduceRiskReason" };
    }

    // Rule 3: SMA50 > SMA200 → Bullish Trend (Buy)
    if (sma50 > sma200) {
        // But if RSI is very high, suggest hold instead
        if (rsi > 65) {
            return { signal: "hold", reasonKey: "riskEngine.signalHoldOverboughtReason" };
        }
        return { signal: "buy", reasonKey: "riskEngine.signalBuyReason" };
    }

    // Rule 4: SMA50 < SMA200 AND RSI > 50 → Hold
    if (sma50 < sma200 && rsi > 50) {
        return { signal: "hold", reasonKey: "riskEngine.signalHoldReason" };
    }

    // Rule 5: SMA50 < SMA200 AND RSI < 50 → Sell
    if (sma50 < sma200 && rsi <= 50) {
        // But if RSI is very low, might be oversold – accumulate instead
        if (rsi < 30) {
            return { signal: "accumulate", reasonKey: "riskEngine.signalAccumulateOversoldReason" };
        }
        return { signal: "sell", reasonKey: "riskEngine.signalSellReason" };
    }

    return { signal: "hold", reasonKey: "riskEngine.signalHoldDefaultReason" };
}

/* ── Risk Level classification ─────────────────────────────────── */

function classifyRiskLevel(score: number): RiskLevel {
    if (score <= 30) return "low";
    if (score <= 60) return "moderate";
    if (score <= 80) return "high";
    return "extreme";
}

/* ── Main export ───────────────────────────────────────────────── */

export function analyzeRisk(
    chartData: MarketChartData,
    coinDetail: CoinDetail
): RiskAnalysis {
    const allPrices = chartData.prices.map(([, p]) => p);
    const currentPrice = allPrices[allPrices.length - 1];

    // 1. Daily Returns
    const dailyReturns = calcDailyReturns(allPrices);

    // 2. Annualized Volatility
    const vol = annualizedVol(dailyReturns);

    // 3. Maximum Drawdown
    const mdd = maxDrawdown(allPrices);

    // 4. Value at Risk (95%)
    const var95 = valueAtRisk95(dailyReturns);

    // 5. Correlation Risk (single asset → 0, placeholder)
    //    For a single coin page we don't have multi-asset data.
    //    We approximate concentration risk from how correlated the coin
    //    is to its own recent trend (auto-correlation proxy).
    const halfLen = Math.floor(dailyReturns.length / 2);
    const firstHalf = dailyReturns.slice(0, halfLen);
    const secondHalf = dailyReturns.slice(halfLen, halfLen * 2);
    let correlationRisk = 0;
    if (firstHalf.length > 2 && secondHalf.length > 2) {
        const m1 = mean(firstHalf);
        const m2 = mean(secondHalf);
        let cov = 0, s1 = 0, s2 = 0;
        const len = Math.min(firstHalf.length, secondHalf.length);
        for (let i = 0; i < len; i++) {
            cov += (firstHalf[i] - m1) * (secondHalf[i] - m2);
            s1 += (firstHalf[i] - m1) ** 2;
            s2 += (secondHalf[i] - m2) ** 2;
        }
        const denom = Math.sqrt(s1 * s2);
        correlationRisk = denom > 0 ? Math.abs(cov / denom) : 0;
    }

    // 6. Portfolio Volatility (single asset = annualized vol)
    const portfolioVolatility = vol;

    // 7. Risk Score (0–100)
    //    Normalize each component then combine with weights
    //    Volatility: 0–200% range → normalized
    const volNorm = normalize(vol, 0, 200);
    //    Max Drawdown: 0 to -100% → we use absolute value, range 0–100
    const mddNorm = normalize(Math.abs(mdd), 0, 100);
    //    Correlation risk: already 0–1
    const corrNorm = correlationRisk;
    //    VaR: 0 to -20% daily → normalize absolute
    const varNorm = normalize(Math.abs(var95), 0, 20);

    const riskScore = Math.round(
        volNorm * 40 +
        mddNorm * 30 +
        corrNorm * 20 +
        varNorm * 10
    );
    const clampedScore = Math.max(0, Math.min(100, riskScore));

    // 8. Risk Level
    const riskLevel = classifyRiskLevel(clampedScore);

    // 9. Technical Indicators
    const rsi14 = Number(calcRSI(allPrices, 14).toFixed(1));
    const sma50 = calcSMA(allPrices, 50);
    const sma200 = calcSMA(allPrices, 200);
    const momentum30d =
        allPrices.length >= 30
            ? Number(
                (
                    ((currentPrice - allPrices[allPrices.length - 30]) /
                        allPrices[allPrices.length - 30]) *
                    100
                ).toFixed(2)
            )
            : 0;

    // Previous volatility (first half) for "volatility rising" check
    const prevVol = firstHalf.length > 2 ? annualizedVol(firstHalf) : vol;

    // Signal
    const { signal, reasonKey } = determineSignal(
        rsi14,
        currentPrice,
        sma50,
        sma200,
        vol,
        prevVol
    );

    // 10. Confidence
    const confidence = Math.round(Math.max(0, Math.min(100, 100 - volNorm * 100)));

    return {
        metrics: {
            dailyReturns,
            annualizedVolatility: Number(vol.toFixed(2)),
            maxDrawdown: Number(mdd.toFixed(2)),
            var95: Number(var95.toFixed(2)),
            correlationRisk: Number(correlationRisk.toFixed(3)),
            portfolioVolatility: Number(portfolioVolatility.toFixed(2)),
        },
        riskScore: clampedScore,
        riskLevel,
        technicals: {
            rsi14,
            sma50: Number(sma50.toFixed(2)),
            sma200: Number(sma200.toFixed(2)),
            momentum30d,
            currentPrice,
        },
        signal,
        signalReason: reasonKey,
        confidence,
    };
}

/* ── Portfolio-level Risk Analysis ─────────────────────────────── */

export interface PortfolioCoinInput {
    coinId: string;
    coinName: string;
    symbol: string;
    image: string;
    weight: number;            // fraction (0-1) of total portfolio
    holdingValue: number;      // current USD value of this holding
    chartData: MarketChartData;
    coinDetail: CoinDetail;
}

export interface PortfolioRiskSummary {
    riskScore: number;            // 0–100
    riskLevel: RiskLevel;
    volatility: number;           // weighted annualised %
    var95: number;                // weighted daily VaR %
    sharpe: number;               // annualised Sharpe ratio
    maxDrawdown: number;          // worst drawdown %
    correlation: number;          // avg pairwise correlation
    confidence: number;           // 0–100
    /** 30-day portfolio value history (timestamp, value) */
    valueChart: { time: number; value: number }[];
    /** Per-coin allocation for pie chart */
    allocation: { name: string; symbol: string; value: number; pct: number; color: string }[];
}

const ALLOC_COLORS = [
    "#38bdf8", "#6366f1", "#34d399", "#fbbf24",
    "#f87171", "#a78bfa", "#fb923c", "#2dd4bf",
    "#e879f9", "#60a5fa", "#4ade80", "#facc15",
];

/** Pearson correlation between two equal-length return arrays */
function pearsonCorrelation(a: number[], b: number[]): number {
    const len = Math.min(a.length, b.length);
    if (len < 3) return 0;
    const ma = mean(a.slice(0, len));
    const mb = mean(b.slice(0, len));
    let cov = 0, sa = 0, sb = 0;
    for (let i = 0; i < len; i++) {
        cov += (a[i] - ma) * (b[i] - mb);
        sa += (a[i] - ma) ** 2;
        sb += (b[i] - mb) ** 2;
    }
    const denom = Math.sqrt(sa * sb);
    return denom > 0 ? cov / denom : 0;
}

export function analyzePortfolioRisk(
    coins: PortfolioCoinInput[]
): PortfolioRiskSummary {
    if (coins.length === 0) {
        return {
            riskScore: 0, riskLevel: "low",
            volatility: 0, var95: 0, sharpe: 0,
            maxDrawdown: 0, correlation: 0, confidence: 0,
            valueChart: [], allocation: [],
        };
    }

    const totalValue = coins.reduce((s, c) => s + c.holdingValue, 0);

    // Per-coin analysis
    const analyses = coins.map(c => ({
        ...c,
        risk: analyzeRisk(c.chartData, c.coinDetail),
        dailyReturns: calcDailyReturns(c.chartData.prices.map(([, p]) => p)),
    }));

    // 1. Weighted volatility
    const weightedVol = analyses.reduce(
        (s, a) => s + a.weight * a.risk.metrics.annualizedVolatility, 0
    );

    // 2. Weighted VaR
    const weightedVar = analyses.reduce(
        (s, a) => s + a.weight * a.risk.metrics.var95, 0
    );

    // 3. Worst max drawdown across coins (weighted)
    const weightedMDD = analyses.reduce(
        (s, a) => Math.min(s, a.risk.metrics.maxDrawdown), 0
    );

    // 4. Average pairwise correlation
    let totalCorr = 0;
    let pairCount = 0;
    for (let i = 0; i < analyses.length; i++) {
        for (let j = i + 1; j < analyses.length; j++) {
            totalCorr += Math.abs(
                pearsonCorrelation(analyses[i].dailyReturns, analyses[j].dailyReturns)
            );
            pairCount++;
        }
    }
    const avgCorrelation = pairCount > 0 ? totalCorr / pairCount : 0;

    // 5. Sharpe ratio (annualised, risk-free rate ~ 4.5%)
    const riskFreeRate = 0.045;
    const weightedDailyReturn = analyses.reduce((s, a) => {
        const avgDailyRet = a.dailyReturns.length > 0
            ? a.dailyReturns.reduce((x, y) => x + y, 0) / a.dailyReturns.length
            : 0;
        return s + a.weight * avgDailyRet;
    }, 0);
    const annualReturn = weightedDailyReturn * 365;
    const annualVol = (weightedVol / 100) || 0.001;
    const sharpe = Number(((annualReturn - riskFreeRate) / annualVol).toFixed(2));

    // 6. Risk score (0-100)
    const volNorm = normalize(weightedVol, 0, 200);
    const mddNorm = normalize(Math.abs(weightedMDD), 0, 100);
    const corrNorm = avgCorrelation;
    const varNorm = normalize(Math.abs(weightedVar), 0, 20);

    const rawScore = Math.round(volNorm * 40 + mddNorm * 30 + corrNorm * 20 + varNorm * 10);
    const riskScore = Math.max(0, Math.min(100, rawScore));
    const riskLevel = classifyRiskLevel(riskScore);
    const confidence = Math.round(Math.max(0, Math.min(100, 100 - volNorm * 100)));

    // 7. Portfolio value chart (last 30d × combined)
    const valueChart: { time: number; value: number }[] = [];
    if (analyses.length > 0 && analyses[0].chartData.prices.length > 0) {
        // Use last 30 data points (or fewer)
        const maxPoints = Math.min(30, ...analyses.map(a => a.chartData.prices.length));
        for (let idx = 0; idx < maxPoints; idx++) {
            const dataIdx = analyses[0].chartData.prices.length - maxPoints + idx;
            let totalVal = 0;
            let ts = 0;
            for (const a of analyses) {
                const priceIdx = a.chartData.prices.length - maxPoints + idx;
                if (priceIdx >= 0 && priceIdx < a.chartData.prices.length) {
                    const price = a.chartData.prices[priceIdx][1];
                    const currentPrice = a.chartData.prices[a.chartData.prices.length - 1][1];
                    // Scale: holdingValue is at currentPrice, so value at priceIdx = holdingValue * (price / currentPrice)
                    totalVal += a.holdingValue * (price / currentPrice);
                    ts = a.chartData.prices[priceIdx][0];
                }
            }
            valueChart.push({ time: ts, value: totalVal });
        }
    }

    // 8. Allocation data
    const allocation = coins.map((c, i) => ({
        name: c.coinName,
        symbol: c.symbol.toUpperCase(),
        value: c.holdingValue,
        pct: totalValue > 0 ? Number(((c.holdingValue / totalValue) * 100).toFixed(1)) : 0,
        color: ALLOC_COLORS[i % ALLOC_COLORS.length],
    }));

    return {
        riskScore,
        riskLevel,
        volatility: Number(weightedVol.toFixed(2)),
        var95: Number(weightedVar.toFixed(2)),
        sharpe,
        maxDrawdown: Number(weightedMDD.toFixed(2)),
        correlation: Number(avgCorrelation.toFixed(3)),
        confidence,
        valueChart,
        allocation,
    };
}
