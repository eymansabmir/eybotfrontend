import axios, { type InternalAxiosRequestConfig } from "axios";
import { ENV } from "@/config/env";

const STATE_CHANGING_METHODS = new Set(["post", "put", "patch", "delete"]);
const retriedCsrfConfigs = new WeakSet<InternalAxiosRequestConfig>();
let csrfToken: string | null = null;

export const apiClient = axios.create({
    baseURL: ENV.API_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

export async function ensureCsrfToken(): Promise<string> {
    const { data, headers } = await apiClient.get<{ csrfToken: string }>("/csrf-token");
    const token = data.csrfToken ?? (headers["x-csrf-token"] as string | undefined);
    if (!token) {
        throw new Error("Failed to obtain CSRF token");
    }
    csrfToken = token;
    return token;
}

apiClient.interceptors.request.use((config) => {
    const method = config.method?.toLowerCase();
    if (method && STATE_CHANGING_METHODS.has(method) && csrfToken) {
        config.headers.set("X-CSRF-Token", csrfToken);
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => {
        const token = response.headers["x-csrf-token"];
        if (typeof token === "string" && token.length > 0) {
            csrfToken = token;
        }
        return response;
    },
    async (error) => {
        const backendMessage = error.response?.data?.message;
        if (backendMessage && typeof backendMessage === "string") {
            error.message = backendMessage;
        }

        const config = error.config;
        const method = config?.method?.toLowerCase();
        const isStateChanging = method && STATE_CHANGING_METHODS.has(method);
        const isCsrfFailure =
            error.response?.status === 403 &&
            typeof backendMessage === "string" &&
            backendMessage.toLowerCase().includes("csrf");

        if (isStateChanging && isCsrfFailure && config && !retriedCsrfConfigs.has(config)) {
            retriedCsrfConfigs.add(config);
            await ensureCsrfToken();
            return apiClient(config);
        }

        return Promise.reject(error);
    },
);
