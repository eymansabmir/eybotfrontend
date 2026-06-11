import axios from "axios";
import { ENV } from "@/config/env";

let cachedCsrfToken: string | null = null;

async function ensureCsrfToken(): Promise<string | null> {
    if (cachedCsrfToken) {
        return cachedCsrfToken;
    }

    const response = await fetch(`${ENV.API_URL}/csrf-token`, {
        credentials: "include",
    });

    if (!response.ok) {
        return null;
    }

    const payload = await response.json().catch(() => null);
    cachedCsrfToken = payload?.csrfToken ?? response.headers.get("X-CSRF-Token");
    return cachedCsrfToken;
}

export const apiClient = axios.create({
    baseURL: ENV.API_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.request.use(async (config) => {
    const method = config.method?.toUpperCase();
    if (method && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
        const csrfToken = await ensureCsrfToken();
        if (csrfToken) {
            config.headers.set("X-CSRF-Token", csrfToken);
        }
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => {
        const csrfToken = response.headers["x-csrf-token"];
        if (typeof csrfToken === "string" && csrfToken.length > 0) {
            cachedCsrfToken = csrfToken;
        }
        return response;
    },
    (error) => {
        const backendMessage = error.response?.data?.message;
        if (backendMessage && typeof backendMessage === "string") {
            error.message = backendMessage;
        }
        return Promise.reject(error);
    },
);
