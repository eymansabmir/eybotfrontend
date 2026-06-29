import { describe, expect, it } from "vitest";
import { parseAnalyticsTab, resolveCampaignMetricValues } from "./campaign-analytics-metrics";

describe("parseAnalyticsTab", () => {
    it("returns valid tab values", () => {
        expect(parseAnalyticsTab("runs")).toBe("runs");
        expect(parseAnalyticsTab("follow-ups")).toBe("follow-ups");
    });

    it("defaults to overview for invalid or missing values", () => {
        expect(parseAnalyticsTab(undefined)).toBe("overview");
        expect(parseAnalyticsTab("invalid")).toBe("overview");
    });
});

describe("resolveCampaignMetricValues", () => {
    it("uses raw stats when analyticsSource is not verified", () => {
        const result = resolveCampaignMetricValues({
            total: 100,
            sent: 90,
            delivered: 80,
            opened: 50,
            started: 30,
            completed: 20,
            failed: 5,
            initiated: 0,
            pending: 0,
            queued: 0,
        });

        expect(result.sent).toBe(90);
        expect(result.delivered).toBe(80);
        expect(result.read).toBe(50);
        expect(result.started).toBe(30);
        expect(result.failed).toBe(5);
        expect(result.deliveryRate).toBeCloseTo((80 / 90) * 100);
        expect(result.useVerified).toBe(false);
    });

    it("uses verified funnel when analyticsSource is verified", () => {
        const result = resolveCampaignMetricValues({
            total: 100,
            sent: 90,
            delivered: 80,
            opened: 50,
            started: 30,
            completed: 20,
            failed: 5,
            initiated: 0,
            pending: 0,
            queued: 0,
            analyticsSource: "verified",
            verified: {
                sent: 88,
                delivered: 77,
                read: 44,
                replied: 28,
                failed: 3,
                pending: 0,
                currentSent: 0,
                currentDelivered: 0,
                currentRead: 0,
            },
        });

        expect(result.sent).toBe(88);
        expect(result.delivered).toBe(77);
        expect(result.read).toBe(44);
        expect(result.started).toBe(28);
        expect(result.failed).toBe(3);
        expect(result.useVerified).toBe(true);
    });

    it("uses failure breakdown when recipient failed count is lower", () => {
        const result = resolveCampaignMetricValues({
            total: 100,
            sent: 90,
            delivered: 80,
            opened: 50,
            started: 30,
            completed: 20,
            failed: 0,
            initiated: 0,
            pending: 0,
            queued: 0,
            failureBreakdown: {
                byCategory: { Invalid: 6 },
                byCode: [{ code: "702", category: "Invalid", reason: "Throttled", count: 6 }],
            },
        });

        expect(result.failed).toBe(6);
    });
});
