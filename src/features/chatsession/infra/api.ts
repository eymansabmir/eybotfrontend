/**
 * Infra layer for Chat Session feature.
 * Use this module to talk to HTTP APIs (axios, fetch, etc.).
 */
import axios from "axios"

const client = axios.create({
  baseURL: "/api",
})

export const chatSessionApi = {
  async listSummary() {
    // TODO: Replace mock with real endpoint
    const { data } = await client.get("/chat-sessions/summary")
    return data
  },
}
