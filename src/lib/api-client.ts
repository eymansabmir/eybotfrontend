import axios from "axios";
import { ENV } from "@/config/env";

export const apiClient = axios.create({
    baseURL: ENV.API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Extract backend error messages so callers see meaningful text instead of
// the generic "Request failed with status code 400" from Axios.
apiClient.interceptors.response.use(undefined, (error) => {
    const backendMessage = error.response?.data?.message;
    if (backendMessage && typeof backendMessage === "string") {
        error.message = backendMessage;
    }
    return Promise.reject(error);
});
