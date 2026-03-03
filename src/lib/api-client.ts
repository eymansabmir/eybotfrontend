import axios from "axios";

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// Add interceptors here (e.g. for auth tokens) if needed
