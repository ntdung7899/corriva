import apiClient from "./axios";

export interface CryptoCoin {
    id: string;
    symbol: string;
    name: string;
    image: string;
    current_price: number;
    market_cap: number;
    market_cap_rank: number;
    price_change_percentage_24h: number | null;
    total_volume: number;
    high_24h: number;
    low_24h: number;
}

export interface MarketChartData {
    prices: [number, number][];
    market_caps: [number, number][];
    total_volumes: [number, number][];
}

export interface CoinDetail {
    id: string;
    symbol: string;
    name: string;
    image: { large: string; small: string; thumb: string };
    market_data: {
        current_price: { usd: number };
        market_cap: { usd: number };
        total_volume: { usd: number };
        high_24h: { usd: number };
        low_24h: { usd: number };
        price_change_percentage_24h: number;
        price_change_percentage_7d: number;
        price_change_percentage_30d: number;
        price_change_percentage_1y: number | null;
        ath: { usd: number };
        atl: { usd: number };
        circulating_supply: number;
        total_supply: number | null;
        max_supply: number | null;
    };
    market_cap_rank: number;
}

export type TrendDirection = "bullish" | "bearish" | "neutral";

export interface TrendAnalysis {
    direction: TrendDirection;
    confidence: number; // 0-100
    priceChange: number; // percentage
    summary: string;
    summaryKey: string; // i18n key
}

export interface MarketAnalysis {
    shortTerm: TrendAnalysis;
    mediumTerm: TrendAnalysis;
    longTerm: TrendAnalysis;
}

export async function getCoinList(
    perPage: number = 50,
    page: number = 1,
    currency: string = "usd"
): Promise<CryptoCoin[]> {
    const { data } = await apiClient.get<CryptoCoin[]>("/coins/markets", {
        params: {
            vs_currency: currency,
            order: "market_cap_desc",
            per_page: perPage,
            page,
            sparkline: false,
        },
    });
    return data;
}

export async function getCoinMarketChart(
    coinId: string,
    days: number = 365,
    currency: string = "usd"
): Promise<MarketChartData> {
    const { data } = await apiClient.get<MarketChartData>(
        `/coins/${coinId}/market_chart`,
        {
            params: {
                vs_currency: currency,
                days,
            },
        }
    );
    return data;
}

export async function getCoinDetail(coinId: string): Promise<CoinDetail> {
    const { data } = await apiClient.get<CoinDetail>(`/coins/${coinId}`, {
        params: {
            localization: false,
            tickers: false,
            market_data: true,
            community_data: false,
            developer_data: false,
            sparkline: false,
        },
    });
    return data;
}

/* ── Helpers for trend analysis ──────────────────────────────── */
function calcSMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1];
    const slice = prices.slice(-period);
    return slice.reduce((a, b) => a + b, 0) / period;
}

function calcPriceChange(prices: number[], period: number): number {
    if (prices.length < period) return 0;
    const recent = prices[prices.length - 1];
    const past = prices[Math.max(0, prices.length - period)];
    return ((recent - past) / past) * 100;
}

function determineTrend(
    priceChange: number,
    smaCross: number, // > 0 = above SMA, < 0 = below SMA
    threshold: number
): { direction: TrendDirection; confidence: number } {
    const momentum = Math.abs(priceChange);
    const crossStrength = Math.abs(smaCross);

    let direction: TrendDirection;
    if (priceChange > threshold && smaCross > 0) {
        direction = "bullish";
    } else if (priceChange < -threshold && smaCross < 0) {
        direction = "bearish";
    } else {
        direction = "neutral";
    }

    // Confidence based on momentum and SMA alignment
    let confidence = Math.min(95, 30 + momentum * 2 + crossStrength * 20);
    if (direction === "neutral") confidence = Math.min(confidence, 50);

    return { direction, confidence: Math.round(confidence) };
}

export function analyzeMarketTrend(
    chartData: MarketChartData,
    coinDetail: CoinDetail
): MarketAnalysis {
    const allPrices = chartData.prices.map(([, p]) => p);
    const currentPrice = allPrices[allPrices.length - 1];

    // Short-term: last 24h data (~24 points for hourly)
    const shortPrices = allPrices.slice(-24);
    const shortChange = calcPriceChange(shortPrices, shortPrices.length);
    const shortSMA = calcSMA(shortPrices, 7);
    const shortCross = (currentPrice - shortSMA) / shortSMA;
    const shortTrend = determineTrend(shortChange, shortCross, 1);

    // Medium-term: last 7 days
    const medPrices = allPrices.slice(-168); // ~7 days of hourly data
    const medChange = coinDetail.market_data.price_change_percentage_7d;
    const medSMA = calcSMA(medPrices, 50);
    const medCross = (currentPrice - medSMA) / medSMA;
    const medTrend = determineTrend(medChange, medCross, 3);

    // Long-term: 30d-1y
    const longChange = coinDetail.market_data.price_change_percentage_30d;
    const longSMA = calcSMA(allPrices, 200);
    const longCross = (currentPrice - longSMA) / longSMA;
    const longTrend = determineTrend(longChange, longCross, 5);

    const getSummaryKey = (
        dir: TrendDirection,
        term: string
    ): string => {
        return `coinDetail.analysis${term}${dir.charAt(0).toUpperCase() + dir.slice(1)}`;
    };

    return {
        shortTerm: {
            direction: shortTrend.direction,
            confidence: shortTrend.confidence,
            priceChange: Number(shortChange.toFixed(2)),
            summary: "",
            summaryKey: getSummaryKey(shortTrend.direction, "Short"),
        },
        mediumTerm: {
            direction: medTrend.direction,
            confidence: medTrend.confidence,
            priceChange: Number(medChange.toFixed(2)),
            summary: "",
            summaryKey: getSummaryKey(medTrend.direction, "Medium"),
        },
        longTerm: {
            direction: longTrend.direction,
            confidence: longTrend.confidence,
            priceChange: Number(longChange.toFixed(2)),
            summary: "",
            summaryKey: getSummaryKey(longTrend.direction, "Long"),
        },
    };
}

/* ── DCA & HOLD Zone Analysis ────────────────────────────────── */
export type DCAGrade = "strongBuy" | "buy" | "hold" | "overvalued";
export type CyclePhase = "accumulation" | "markup" | "distribution" | "markdown";

export interface PriceZone {
    low: number;
    high: number;
    label: string; // i18n key
}

export interface DCAAnalysis {
    currentPrice: number;
    vwap: number;
    support: number;
    resistance: number;
    ath: number;
    atl: number;
    drawdownFromATH: number; // percentage
    cyclePhase: CyclePhase;
    currentGrade: DCAGrade;
    dcaRecommendedPrice: number;
    zones: {
        strongBuy: PriceZone;
        buy: PriceZone;
        hold: PriceZone;
        overvalued: PriceZone;
    };
    volumeAccumulationPrice: number; // price level with highest volume
    gradeConfidence: number; // 0-100
}

/* ── Find local extremes (support / resistance) ──────────────── */
function findLocalMinMax(
    prices: number[],
    windowSize: number = 14
): { mins: number[]; maxes: number[] } {
    const mins: number[] = [];
    const maxes: number[] = [];
    for (let i = windowSize; i < prices.length - windowSize; i++) {
        const window = prices.slice(i - windowSize, i + windowSize + 1);
        const min = Math.min(...window);
        const max = Math.max(...window);
        if (prices[i] === min) mins.push(prices[i]);
        if (prices[i] === max) maxes.push(prices[i]);
    }
    return { mins, maxes };
}

/* ── Calculate VWAP from price+volume data ───────────────────── */
function calcVWAP(
    prices: [number, number][],
    volumes: [number, number][]
): number {
    let sumPV = 0;
    let sumV = 0;
    const len = Math.min(prices.length, volumes.length);
    for (let i = 0; i < len; i++) {
        const price = prices[i][1];
        const volume = volumes[i][1];
        sumPV += price * volume;
        sumV += volume;
    }
    return sumV > 0 ? sumPV / sumV : prices[prices.length - 1][1];
}

/* ── Volume Profile: find price with highest cumulative volume ─ */
function calcVolumeProfile(
    prices: [number, number][],
    volumes: [number, number][],
    buckets: number = 50
): number {
    const allPrices = prices.map(([, p]) => p);
    const minP = Math.min(...allPrices);
    const maxP = Math.max(...allPrices);
    const range = maxP - minP;
    if (range === 0) return minP;

    const bucketSize = range / buckets;
    const volumeByBucket = new Array(buckets).fill(0);

    const len = Math.min(prices.length, volumes.length);
    for (let i = 0; i < len; i++) {
        const idx = Math.min(
            buckets - 1,
            Math.floor((prices[i][1] - minP) / bucketSize)
        );
        volumeByBucket[idx] += volumes[i][1];
    }

    let maxVol = 0;
    let maxIdx = 0;
    for (let i = 0; i < buckets; i++) {
        if (volumeByBucket[i] > maxVol) {
            maxVol = volumeByBucket[i];
            maxIdx = i;
        }
    }

    return minP + (maxIdx + 0.5) * bucketSize;
}

/* ── Determine cycle phase ───────────────────────────────────── */
function determineCyclePhase(
    drawdown: number,
    priceVsSMA200: number,
    recentMomentum: number
): CyclePhase {
    // drawdown is negative (e.g. -30 means 30% below ATH)
    const dd = Math.abs(drawdown);

    if (dd > 50 && priceVsSMA200 < 0) return "accumulation";
    if (dd < 20 && priceVsSMA200 > 0 && recentMomentum > 0) return "distribution";
    if (priceVsSMA200 > 0 && recentMomentum > 0) return "markup";
    if (priceVsSMA200 < 0 && recentMomentum < 0) return "markdown";

    // Edge cases
    if (dd > 35) return "accumulation";
    if (dd < 15) return "distribution";
    return priceVsSMA200 > 0 ? "markup" : "markdown";
}

/* ── Determine DCA grade ─────────────────────────────────────── */
function determineDCAGrade(
    currentPrice: number,
    vwap: number,
    support: number,
    resistance: number,
    drawdown: number,
    volumeAccPrice: number
): { grade: DCAGrade; confidence: number } {
    const dd = Math.abs(drawdown);
    const priceVsVWAP = ((currentPrice - vwap) / vwap) * 100;
    const priceVsSupport = ((currentPrice - support) / support) * 100;
    const priceVsVolAcc = ((currentPrice - volumeAccPrice) / volumeAccPrice) * 100;

    let score = 50; // neutral baseline

    // Drawdown from ATH: bigger drawdown = better buy
    if (dd > 60) score += 30;
    else if (dd > 40) score += 20;
    else if (dd > 25) score += 10;
    else if (dd < 10) score -= 20;
    else if (dd < 15) score -= 10;

    // Price vs VWAP: below VWAP = better
    if (priceVsVWAP < -15) score += 15;
    else if (priceVsVWAP < -5) score += 8;
    else if (priceVsVWAP > 15) score -= 15;
    else if (priceVsVWAP > 5) score -= 8;

    // Price vs Support: close to support = better
    if (priceVsSupport < 5) score += 12;
    else if (priceVsSupport < 15) score += 5;

    // Price vs volume accumulation zone
    if (priceVsVolAcc < -5) score += 8;
    else if (priceVsVolAcc > 10) score -= 5;

    // Map score to grade
    let grade: DCAGrade;
    if (score >= 75) grade = "strongBuy";
    else if (score >= 55) grade = "buy";
    else if (score >= 35) grade = "hold";
    else grade = "overvalued";

    const confidence = Math.min(95, Math.max(20, Math.abs(score - 50) * 2 + 30));

    return { grade, confidence: Math.round(confidence) };
}

export function analyzeDCAZones(
    chartData: MarketChartData,
    coinDetail: CoinDetail
): DCAAnalysis {
    const allPrices = chartData.prices.map(([, p]) => p);
    const currentPrice = allPrices[allPrices.length - 1];
    const ath = coinDetail.market_data.ath.usd;
    const atl = coinDetail.market_data.atl.usd;
    const drawdownFromATH = ((currentPrice - ath) / ath) * 100;

    // VWAP
    const vwap = calcVWAP(chartData.prices, chartData.total_volumes);

    // Support & Resistance from local extremes
    const { mins, maxes } = findLocalMinMax(allPrices, 14);
    const support = mins.length > 0
        ? mins.sort((a, b) => b - a).find((m) => m < currentPrice) ?? Math.min(...allPrices)
        : Math.min(...allPrices);
    const resistance = maxes.length > 0
        ? maxes.sort((a, b) => a - b).find((m) => m > currentPrice) ?? Math.max(...allPrices)
        : Math.max(...allPrices);

    // Volume profile
    const volumeAccumulationPrice = calcVolumeProfile(
        chartData.prices,
        chartData.total_volumes
    );

    // SMA 200 for cycle analysis
    const sma200 = calcSMA(allPrices, 200);
    const priceVsSMA200 = ((currentPrice - sma200) / sma200) * 100;
    const recentMomentum = coinDetail.market_data.price_change_percentage_30d;

    // Cycle phase
    const cyclePhase = determineCyclePhase(
        drawdownFromATH,
        priceVsSMA200,
        recentMomentum
    );

    // DCA grade
    const { grade, confidence } = determineDCAGrade(
        currentPrice,
        vwap,
        support,
        resistance,
        drawdownFromATH,
        volumeAccumulationPrice
    );

    // Calculate price zones
    const yearLow = Math.min(...allPrices);
    const yearHigh = Math.max(...allPrices);
    const priceRange = yearHigh - yearLow;

    const zones = {
        strongBuy: {
            low: yearLow,
            high: yearLow + priceRange * 0.2,
            label: "dca.zoneStrongBuy",
        },
        buy: {
            low: yearLow + priceRange * 0.2,
            high: vwap,
            label: "dca.zoneBuy",
        },
        hold: {
            low: vwap,
            high: vwap + priceRange * 0.25,
            label: "dca.zoneHold",
        },
        overvalued: {
            low: vwap + priceRange * 0.25,
            high: yearHigh,
            label: "dca.zoneOvervalued",
        },
    };

    // DCA recommended price = weighted average of VWAP, support, and volume accumulation
    const dcaRecommendedPrice = (vwap * 0.4 + support * 0.35 + volumeAccumulationPrice * 0.25);

    return {
        currentPrice,
        vwap,
        support,
        resistance,
        ath,
        atl,
        drawdownFromATH: Number(drawdownFromATH.toFixed(2)),
        cyclePhase,
        currentGrade: grade,
        dcaRecommendedPrice: Number(dcaRecommendedPrice.toFixed(2)),
        zones,
        volumeAccumulationPrice: Number(volumeAccumulationPrice.toFixed(2)),
        gradeConfidence: confidence,
    };
}
