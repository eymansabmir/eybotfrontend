import axios from "axios";

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
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
