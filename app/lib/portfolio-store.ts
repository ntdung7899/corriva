"use client";

/* ── Portfolio Store — localStorage-based CRUD ───────────────── */

const STORAGE_KEY = "corriva_portfolio";

export interface PortfolioHolding {
    id: string;           // unique per entry
    coinId: string;       // CoinGecko coin id
    coinName: string;
    symbol: string;
    image: string;
    quantity: number;
    buyPrice: number;     // USD price at time of purchase
    addedAt: number;      // timestamp
}

export function getPortfolio(): PortfolioHolding[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function addHolding(holding: Omit<PortfolioHolding, "id" | "addedAt">): PortfolioHolding {
    const portfolio = getPortfolio();
    const newHolding: PortfolioHolding = {
        ...holding,
        id: crypto.randomUUID(),
        addedAt: Date.now(),
    };
    portfolio.push(newHolding);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio));
    return newHolding;
}

export function removeHolding(id: string): void {
    const portfolio = getPortfolio().filter((h) => h.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio));
}

export function clearPortfolio(): void {
    localStorage.removeItem(STORAGE_KEY);
}

/* ── Aggregate holdings by coin ──────────────────────────────── */
export interface AggregatedHolding {
    coinId: string;
    coinName: string;
    symbol: string;
    image: string;
    totalQuantity: number;
    avgBuyPrice: number;      // weighted average
    totalInvested: number;    // sum of qty * buyPrice
    entries: PortfolioHolding[];
}

export function aggregatePortfolio(holdings: PortfolioHolding[]): AggregatedHolding[] {
    const map = new Map<string, AggregatedHolding>();

    for (const h of holdings) {
        const existing = map.get(h.coinId);
        if (existing) {
            existing.totalQuantity += h.quantity;
            existing.totalInvested += h.quantity * h.buyPrice;
            existing.avgBuyPrice = existing.totalInvested / existing.totalQuantity;
            existing.entries.push(h);
        } else {
            map.set(h.coinId, {
                coinId: h.coinId,
                coinName: h.coinName,
                symbol: h.symbol,
                image: h.image,
                totalQuantity: h.quantity,
                avgBuyPrice: h.buyPrice,
                totalInvested: h.quantity * h.buyPrice,
                entries: [h],
            });
        }
    }

    return Array.from(map.values());
}
