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
