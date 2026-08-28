import type { SentimentOverview } from "../types";

function buildTrend() {
  const trend = [];
  for (let d = 29; d >= 0; d--) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    const base = 68 + Math.sin(d / 5) * 8 + (Math.random() - 0.5) * 6;
    trend.push({
      date: date.toISOString().slice(0, 10),
      score: Math.round(base),
      positive: Math.round(55 + Math.random() * 15),
      neutral: Math.round(20 + Math.random() * 10),
      negative: Math.round(8 + Math.random() * 10),
    });
  }
  return trend;
}

function buildSourceTrend() {
  const trend = [];
  for (let d = 29; d >= 0; d--) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    trend.push({
      date: date.toISOString().slice(0, 10),
      social: 120 + Math.floor(Math.random() * 80),
      email: 45 + Math.floor(Math.random() * 30),
      sms: 20 + Math.floor(Math.random() * 15),
      whatsapp: 180 + Math.floor(Math.random() * 100),
      reviews: 35 + Math.floor(Math.random() * 25),
    });
  }
  return trend;
}

export const MOCK_SENTIMENT: SentimentOverview = {
  score: 72,
  positive: 62,
  neutral: 25,
  negative: 13,
  trend: buildTrend(),
  alerts: [
    {
      id: "alert-1",
      type: "negative_spike",
      title: "Negative sentiment spike detected",
      detail: "Support response time mentions increased 34% in the last 6 hours on WhatsApp and social channels.",
      timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
      severity: "high",
    },
    {
      id: "alert-2",
      type: "topic_alert",
      title: "Pricing concerns trending",
      detail: "Topic 'Pricing' sentiment dropped from 68 to 42. Volume up 28% across email replies and reviews.",
      timestamp: new Date(Date.now() - 8 * 3600000).toISOString(),
      severity: "medium",
    },
    {
      id: "alert-3",
      type: "volume_drop",
      title: "SMS channel volume drop",
      detail: "SMS mention volume down 45% vs 7-day average. May indicate delivery or engagement issues.",
      timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
      severity: "low",
    },
    {
      id: "alert-4",
      type: "negative_spike",
      title: "Delivery complaints on social",
      detail: "3 negative posts about project delivery timelines on LinkedIn in the last 12 hours.",
      timestamp: new Date(Date.now() - 12 * 3600000).toISOString(),
      severity: "medium",
    },
  ],
  sources: [
    { channel: "WhatsApp Chat", volume: 4280, sentiment: 74 },
    { channel: "Social Media", volume: 3120, sentiment: 68 },
    { channel: "Email Replies", volume: 890, sentiment: 71 },
    { channel: "Reviews", volume: 560, sentiment: 58 },
    { channel: "SMS Replies", volume: 340, sentiment: 65 },
  ],
  sourceTrend: buildSourceTrend(),
  topics: [
    { id: "t1", name: "Managed Services", sentiment: 78, volume: 1240, trend: "up" },
    { id: "t2", name: "Pricing", sentiment: 42, volume: 680, trend: "down" },
    { id: "t3", name: "Support", sentiment: 55, volume: 520, trend: "down" },
    { id: "t4", name: "Delivery", sentiment: 61, volume: 410, trend: "stable" },
    { id: "t5", name: "FinOps", sentiment: 82, volume: 380, trend: "up" },
    { id: "t6", name: "Cyber Security", sentiment: 75, volume: 290, trend: "up" },
    { id: "t7", name: "GCC Setup", sentiment: 70, volume: 245, trend: "stable" },
    { id: "t8", name: "Onboarding", sentiment: 68, volume: 198, trend: "stable" },
    { id: "t9", name: "SLA Performance", sentiment: 48, volume: 156, trend: "down" },
    { id: "t10", name: "Innovation", sentiment: 85, volume: 134, trend: "up" },
  ],
  wordFrequency: [
    { word: "managed services", count: 892 },
    { word: "cost reduction", count: 456 },
    { word: "support", count: 389 },
    { word: "pricing", count: 312 },
    { word: "cloud", count: 278 },
    { word: "delivery", count: 245 },
    { word: "transformation", count: 198 },
    { word: "SLA", count: 167 },
    { word: "automation", count: 145 },
    { word: "consultation", count: 123 },
  ],
  geography: [
    { region: "India — West", sentiment: 74, volume: 1890 },
    { region: "India — South", sentiment: 71, volume: 1650 },
    { region: "India — North", sentiment: 68, volume: 1420 },
    { region: "India — East", sentiment: 65, volume: 680 },
    { region: "APAC (excl. India)", sentiment: 72, volume: 890 },
    { region: "EMEA", sentiment: 69, volume: 560 },
    { region: "Americas", sentiment: 75, volume: 420 },
  ],
  mentions: [
    {
      id: "m1",
      source: "WhatsApp Chat",
      snippet: "The managed services team has been incredibly responsive. Our ticket resolution time dropped by 40%.",
      sentiment: "positive",
      score: 0.89,
      timestamp: new Date(Date.now() - 1 * 3600000).toISOString(),
      topic: "Managed Services",
    },
    {
      id: "m2",
      source: "LinkedIn",
      snippet: "Disappointed with the pricing model for the GCC setup. Expected more transparency in the proposal.",
      sentiment: "negative",
      score: -0.72,
      timestamp: new Date(Date.now() - 3 * 3600000).toISOString(),
      topic: "Pricing",
    },
    {
      id: "m3",
      source: "Email Reply",
      snippet: "Thanks for the FinOps assessment. The recommendations look actionable and well-structured.",
      sentiment: "positive",
      score: 0.81,
      timestamp: new Date(Date.now() - 5 * 3600000).toISOString(),
      topic: "FinOps",
    },
    {
      id: "m4",
      source: "Google Review",
      snippet: "Average experience. Support tickets take too long to resolve during peak hours.",
      sentiment: "negative",
      score: -0.55,
      timestamp: new Date(Date.now() - 7 * 3600000).toISOString(),
      topic: "Support",
    },
    {
      id: "m5",
      source: "WhatsApp Chat",
      snippet: "Can someone clarify the SLA terms for the cyber monitoring service? The documentation is unclear.",
      sentiment: "neutral",
      score: -0.08,
      timestamp: new Date(Date.now() - 9 * 3600000).toISOString(),
      topic: "SLA Performance",
    },
    {
      id: "m6",
      source: "X (Twitter)",
      snippet: "EY's managed services approach to cloud cost optimization is genuinely innovative. Impressed.",
      sentiment: "positive",
      score: 0.92,
      timestamp: new Date(Date.now() - 11 * 3600000).toISOString(),
      topic: "FinOps",
    },
    {
      id: "m7",
      source: "SMS Reply",
      snippet: "STOP",
      sentiment: "neutral",
      score: 0,
      timestamp: new Date(Date.now() - 14 * 3600000).toISOString(),
    },
    {
      id: "m8",
      source: "Facebook",
      snippet: "Great webinar on digital tax transformation. Looking forward to the follow-up consultation.",
      sentiment: "positive",
      score: 0.78,
      timestamp: new Date(Date.now() - 18 * 3600000).toISOString(),
      topic: "Innovation",
    },
  ],
  thresholds: { negativeSpike: 15, volumeDrop: 30 },
};
