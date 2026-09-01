export type ListenQueryStatus = "active" | "paused" | "draft";

export interface ListenQuery {
  id: string;
  name: string;
  query: string;
  sources: string[];
  markets: string[];
  languages: string[];
  status: ListenQueryStatus;
  mentions24h: number;
  sentiment: number;
  alertThreshold: number;
}

export const MOCK_LISTEN_QUERIES: ListenQuery[] = [
  {
    id: "lq-001",
    name: "EY Managed Services brand",
    query: `"EY Managed Services" OR "EY MS" OR "Ernst & Young managed services"`,
    sources: ["LinkedIn", "X", "News", "Reviews"],
    markets: ["India", "SEA", "UK"],
    languages: ["English", "Hindi"],
    status: "active",
    mentions24h: 184,
    sentiment: 74,
    alertThreshold: 25,
  },
  {
    id: "lq-002",
    name: "FinOps competitor set",
    query: `(FinOps OR "cloud cost") AND (Accenture OR Deloitte OR "PwC")`,
    sources: ["LinkedIn", "X", "News"],
    markets: ["India", "US"],
    languages: ["English"],
    status: "active",
    mentions24h: 96,
    sentiment: 61,
    alertThreshold: 30,
  },
  {
    id: "lq-003",
    name: "GCC setup intent",
    query: `"capability centre" OR GCC OR GIC AND (setup OR launch OR "centre of excellence")`,
    sources: ["LinkedIn", "News"],
    markets: ["India"],
    languages: ["English"],
    status: "paused",
    mentions24h: 41,
    sentiment: 68,
    alertThreshold: 20,
  },
];
