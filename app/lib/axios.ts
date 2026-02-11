import axios from "axios";

const apiClient = axios.create({
    baseURL: "https://api.coingecko.com/api/v3",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

export default apiClient;
