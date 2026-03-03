export interface ChatSessionSummary {
  active: number
  waiting: number
  completedToday: number
  avgResponseTime: number
}

export interface NodeStat {
  id: string
  label: string
  conversionRate: number
  dropOffRate: number
}
