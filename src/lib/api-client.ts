import axios, { type InternalAxiosRequestConfig } from "axios";
import { ENV } from "@/config/env";

const STATE_CHANGING_METHODS = new Set(["post", "put", "patch", "delete"]);
const CSRF_RETRY_FLAG = "_csrfRetried";

let csrfToken: string | null = null;
let csrfFetchPromise: Promise<string> | null = null;

export const apiClient = axios.create({
    baseURL: ENV.API_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

async function fetchCsrfToken(force = false): Promise<string> {
    if (csrfToken && !force) {
        return csrfToken;
    }

    if (csrfFetchPromise && !force) {
        return csrfFetchPromise;
    }

    csrfFetchPromise = (async () => {
        const { data, headers } = await apiClient.get<{ csrfToken: string }>("/csrf-token");
        const token = data.csrfToken ?? (headers["x-csrf-token"] as string | undefined);
        if (!token) {
            throw new Error("Failed to obtain CSRF token");
        }
        csrfToken = token;
        return token;
    })();

    try {
        return await csrfFetchPromise;
    } finally {
        csrfFetchPromise = null;
    }
}

export async function ensureCsrfToken(force = false): Promise<string> {
    return fetchCsrfToken(force);
}

function setCsrfHeader(config: InternalAxiosRequestConfig, token: string): void {
    config.headers.set("X-CSRF-Token", token);
}

apiClient.interceptors.request.use(async (config) => {
    const method = config.method?.toLowerCase();
    if (method && STATE_CHANGING_METHODS.has(method)) {
        const token = await fetchCsrfToken();
        setCsrfHeader(config, token);
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

        const config = error.config as (InternalAxiosRequestConfig & { [CSRF_RETRY_FLAG]?: boolean }) | undefined;
        const method = config?.method?.toLowerCase();
        const isStateChanging = method && STATE_CHANGING_METHODS.has(method);
        const isCsrfFailure =
            error.response?.status === 403 &&
            typeof backendMessage === "string" &&
            backendMessage.toLowerCase().includes("csrf");

        if (isStateChanging && isCsrfFailure && config && !config[CSRF_RETRY_FLAG]) {
            config[CSRF_RETRY_FLAG] = true;
            csrfToken = null;
            const freshToken = await fetchCsrfToken(true);
            setCsrfHeader(config, freshToken);
            return apiClient(config);
        }

        return Promise.reject(error);
    },
);
