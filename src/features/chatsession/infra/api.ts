/**
 * Infra layer for Chat Session feature.
 * Use this module to talk to HTTP APIs (axios, fetch, etc.).
 */
import { apiClient } from "@/lib/api-client"

export const chatSessionApi = {
  async listSummary() {
    // TODO: Replace mock with real endpoint
    const { data } = await apiClient.get("/chat-sessions/summary")
    return data
  },
}
