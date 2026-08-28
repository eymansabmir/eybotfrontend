import type { SocialCampaign, SocialPlatform } from "../types";

const platformLabels: Record<SocialPlatform, string> = {
  linkedin: "LinkedIn",
  x: "X",
  facebook: "Facebook",
  instagram: "Instagram",
};

export { platformLabels };

function buildPosts(campaignId: string, platforms: SocialPlatform[], count: number) {
  const captions = [
    "Transform your IT operations with EY Managed Services. 30% cost reduction, guaranteed SLAs.",
    "Is your cloud bill out of control? EY FinOps helps enterprises optimize spend without sacrificing performance.",
    "Building a GCC? EY has helped 50+ organizations design, launch, and operate capability centres.",
    "Cyber threats are evolving. EY SOC services provide 24/7 monitoring with AI-powered detection.",
    "Digital tax is the future. See how EY helps finance teams close faster with fewer errors.",
  ];
  return Array.from({ length: count }, (_, i) => ({
    id: `${campaignId}-post-${i}`,
    platform: platforms[i % platforms.length],
    caption: captions[i % captions.length],
    scheduledAt: new Date(Date.now() - (count - i) * 86400000).toISOString(),
    status: (i < count - 2 ? "published" : "scheduled") as "published" | "scheduled",
    likes: 120 + Math.floor(Math.random() * 800),
    comments: 8 + Math.floor(Math.random() * 60),
    shares: 5 + Math.floor(Math.random() * 40),
    reach: 5000 + Math.floor(Math.random() * 25000),
    engagementRate: 1.5 + Math.random() * 3,
  }));
}

function buildCalendar() {
  const dates: SocialCampaign["calendar"] = [];
  for (let d = 0; d < 28; d++) {
    const date = new Date(2026, 1, 1 + d);
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    const postCount = Math.random() > 0.6 ? 2 : 1;
    dates.push({
      date: date.toISOString().slice(0, 10),
      posts: Array.from({ length: postCount }, (_, i) => ({
        platform: (["linkedin", "x", "instagram", "facebook"] as SocialPlatform[])[i % 4],
        status: d < 20 ? "published" : "scheduled",
      })),
    });
  }
  return dates;
}

export const MOCK_SOCIAL_CAMPAIGNS: SocialCampaign[] = [
  {
    id: "social-001",
    name: "Managed Services Thought Leadership",
    objective: "awareness",
    platforms: ["linkedin", "x"],
    postsCount: 18,
    status: "running",
    reach: 245000,
    impressions: 412000,
    engagementRate: 3.8,
    followerGrowth: 1240,
    stats: { likes: 8920, comments: 456, shares: 312, saves: 189, clicks: 2340 },
    platformStats: [
      { platform: "linkedin", reach: 168000, engagement: 4.2, posts: 12 },
      { platform: "x", reach: 77000, engagement: 2.9, posts: 6 },
    ],
    posts: buildPosts("social-001", ["linkedin", "x"], 18),
    engagementTrend: Array.from({ length: 14 }, (_, i) => ({
      date: new Date(Date.now() - (13 - i) * 86400000).toISOString().slice(0, 10),
      likes: 400 + Math.floor(Math.random() * 300),
      comments: 20 + Math.floor(Math.random() * 40),
      shares: 10 + Math.floor(Math.random() * 25),
    })),
    demographics: {
      age: [
        { range: "25-34", percentage: 28 },
        { range: "35-44", percentage: 35 },
        { range: "45-54", percentage: 24 },
        { range: "55+", percentage: 13 },
      ],
      gender: [
        { label: "Male", percentage: 62 },
        { label: "Female", percentage: 36 },
        { label: "Other", percentage: 2 },
      ],
      locations: [
        { city: "Mumbai", percentage: 22 },
        { city: "Bengaluru", percentage: 20 },
        { city: "Delhi NCR", percentage: 18 },
        { city: "Hyderabad", percentage: 12 },
        { city: "Chennai", percentage: 10 },
      ],
    },
    hashtags: [
      { tag: "#ManagedServices", uses: 45, reach: 89000 },
      { tag: "#DigitalTransformation", uses: 38, reach: 72000 },
      { tag: "#EY", uses: 52, reach: 112000 },
      { tag: "#ITOperations", uses: 22, reach: 34000 },
      { tag: "#FinOps", uses: 18, reach: 28000 },
    ],
    calendar: buildCalendar(),
  },
  {
    id: "social-002",
    name: "FinOps Cloud Cost Series",
    objective: "engagement",
    platforms: ["linkedin", "x", "instagram"],
    postsCount: 15,
    status: "completed",
    reach: 189000,
    impressions: 298000,
    engagementRate: 4.1,
    followerGrowth: 890,
    stats: { likes: 6780, comments: 389, shares: 267, saves: 145, clicks: 1890 },
    platformStats: [
      { platform: "linkedin", reach: 98000, engagement: 4.5, posts: 8 },
      { platform: "x", reach: 52000, engagement: 3.2, posts: 4 },
      { platform: "instagram", reach: 39000, engagement: 4.8, posts: 3 },
    ],
    posts: buildPosts("social-002", ["linkedin", "x", "instagram"], 15),
    engagementTrend: Array.from({ length: 14 }, (_, i) => ({
      date: new Date(Date.now() - (13 - i) * 86400000).toISOString().slice(0, 10),
      likes: 350 + Math.floor(Math.random() * 250),
      comments: 18 + Math.floor(Math.random() * 35),
      shares: 8 + Math.floor(Math.random() * 20),
    })),
    demographics: {
      age: [
        { range: "25-34", percentage: 32 },
        { range: "35-44", percentage: 38 },
        { range: "45-54", percentage: 22 },
        { range: "55+", percentage: 8 },
      ],
      gender: [
        { label: "Male", percentage: 68 },
        { label: "Female", percentage: 30 },
        { label: "Other", percentage: 2 },
      ],
      locations: [
        { city: "Bengaluru", percentage: 25 },
        { city: "Mumbai", percentage: 18 },
        { city: "Pune", percentage: 14 },
        { city: "Hyderabad", percentage: 12 },
        { city: "Chennai", percentage: 10 },
      ],
    },
    hashtags: [
      { tag: "#FinOps", uses: 32, reach: 56000 },
      { tag: "#CloudCost", uses: 28, reach: 48000 },
      { tag: "#CloudOptimization", uses: 19, reach: 31000 },
    ],
    calendar: buildCalendar(),
  },
  {
    id: "social-003",
    name: "Cyber Security Awareness Month",
    objective: "traffic",
    platforms: ["linkedin", "facebook", "x"],
    postsCount: 20,
    status: "completed",
    reach: 312000,
    impressions: 520000,
    engagementRate: 2.9,
    followerGrowth: 1560,
    stats: { likes: 9450, comments: 512, shares: 389, saves: 210, clicks: 4560 },
    platformStats: [
      { platform: "linkedin", reach: 145000, engagement: 3.2, posts: 10 },
      { platform: "facebook", reach: 98000, engagement: 2.4, posts: 6 },
      { platform: "x", reach: 69000, engagement: 2.8, posts: 4 },
    ],
    posts: buildPosts("social-003", ["linkedin", "facebook", "x"], 20),
    engagementTrend: Array.from({ length: 14 }, (_, i) => ({
      date: new Date(Date.now() - (13 - i) * 86400000).toISOString().slice(0, 10),
      likes: 500 + Math.floor(Math.random() * 400),
      comments: 25 + Math.floor(Math.random() * 50),
      shares: 15 + Math.floor(Math.random() * 30),
    })),
    demographics: {
      age: [
        { range: "25-34", percentage: 30 },
        { range: "35-44", percentage: 32 },
        { range: "45-54", percentage: 26 },
        { range: "55+", percentage: 12 },
      ],
      gender: [
        { label: "Male", percentage: 70 },
        { label: "Female", percentage: 28 },
        { label: "Other", percentage: 2 },
      ],
      locations: [
        { city: "Mumbai", percentage: 20 },
        { city: "Delhi NCR", percentage: 19 },
        { city: "Bengaluru", percentage: 17 },
        { city: "Kolkata", percentage: 11 },
        { city: "Pune", percentage: 9 },
      ],
    },
    hashtags: [
      { tag: "#CyberSecurity", uses: 48, reach: 95000 },
      { tag: "#InfoSec", uses: 35, reach: 68000 },
      { tag: "#ZeroTrust", uses: 22, reach: 42000 },
    ],
    calendar: buildCalendar(),
  },
  {
    id: "social-004",
    name: "GCC Launch Campaign",
    objective: "leads",
    platforms: ["linkedin", "instagram"],
    postsCount: 12,
    status: "scheduled",
    reach: 0,
    impressions: 0,
    engagementRate: 0,
    followerGrowth: 0,
    stats: { likes: 0, comments: 0, shares: 0, saves: 0, clicks: 0 },
    platformStats: [
      { platform: "linkedin", reach: 0, engagement: 0, posts: 8 },
      { platform: "instagram", reach: 0, engagement: 0, posts: 4 },
    ],
    posts: buildPosts("social-004", ["linkedin", "instagram"], 12),
    engagementTrend: [],
    demographics: { age: [], gender: [], locations: [] },
    hashtags: [{ tag: "#GCC", uses: 0, reach: 0 }],
    calendar: buildCalendar(),
  },
  {
    id: "social-005",
    name: "HR & Payroll Modernization",
    objective: "awareness",
    platforms: ["linkedin", "x", "facebook", "instagram"],
    postsCount: 16,
    status: "paused",
    reach: 98000,
    impressions: 156000,
    engagementRate: 2.2,
    followerGrowth: 340,
    stats: { likes: 2340, comments: 145, shares: 89, saves: 56, clicks: 890 },
    platformStats: [
      { platform: "linkedin", reach: 52000, engagement: 2.8, posts: 8 },
      { platform: "x", reach: 18000, engagement: 1.6, posts: 3 },
      { platform: "facebook", reach: 16000, engagement: 1.9, posts: 3 },
      { platform: "instagram", reach: 12000, engagement: 2.4, posts: 2 },
    ],
    posts: buildPosts("social-005", ["linkedin", "x", "facebook", "instagram"], 16),
    engagementTrend: Array.from({ length: 14 }, (_, i) => ({
      date: new Date(Date.now() - (13 - i) * 86400000).toISOString().slice(0, 10),
      likes: 120 + Math.floor(Math.random() * 100),
      comments: 8 + Math.floor(Math.random() * 15),
      shares: 4 + Math.floor(Math.random() * 10),
    })),
    demographics: {
      age: [
        { range: "25-34", percentage: 26 },
        { range: "35-44", percentage: 40 },
        { range: "45-54", percentage: 24 },
        { range: "55+", percentage: 10 },
      ],
      gender: [
        { label: "Male", percentage: 55 },
        { label: "Female", percentage: 43 },
        { label: "Other", percentage: 2 },
      ],
      locations: [
        { city: "Mumbai", percentage: 21 },
        { city: "Bengaluru", percentage: 19 },
        { city: "Delhi NCR", percentage: 16 },
      ],
    },
    hashtags: [
      { tag: "#HRTech", uses: 18, reach: 28000 },
      { tag: "#Payroll", uses: 14, reach: 22000 },
    ],
    calendar: buildCalendar(),
  },
];

export function getSocialCampaignById(id: string): SocialCampaign | undefined {
  return MOCK_SOCIAL_CAMPAIGNS.find((c) => c.id === id);
}

export const SOCIAL_LIST_SUMMARY = {
  totalReach: 844000,
  engagementRate: 3.2,
  scheduledPosts: 24,
  activeCampaigns: 2,
};
