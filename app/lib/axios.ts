import axios from "axios";

const apiClient = axios.create({
    baseURL: "https://api.coingecko.com/api/v3",
    timeout: 15000,
    headers: {
        "Content-Type": "application/json",
    },
});

// ── Retry interceptor for 429 (rate-limit) ──────────────────────
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 2000; // 2 seconds

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const config = error.config;
        if (!config) return Promise.reject(error);

        config.__retryCount = config.__retryCount || 0;

        // Only retry on 429 (rate limit)
        if (error.response?.status === 429 && config.__retryCount < MAX_RETRIES) {
            config.__retryCount += 1;

            // Use Retry-After header if present, otherwise exponential backoff
            const retryAfter = error.response.headers?.["retry-after"];
            const delay = retryAfter
                ? Number(retryAfter) * 1000
                : BASE_DELAY_MS * Math.pow(2, config.__retryCount - 1);

            console.warn(
                `[CoinGecko] 429 rate-limited – retry ${config.__retryCount}/${MAX_RETRIES} in ${delay}ms`
            );

            await new Promise((resolve) => setTimeout(resolve, delay));
            return apiClient(config);
        }

        return Promise.reject(error);
    }
);

export default apiClient;
