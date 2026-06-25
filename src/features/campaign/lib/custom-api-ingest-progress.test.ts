import { describe, expect, it } from "vitest";
import { getCustomApiIngestProgress } from "./custom-api-ingest-progress";
import type { Campaign } from "../types";

const baseCampaign: Campaign = {
    id: "c1",
    orgId: "o1",
    name: "Test",
    flowId: "f1",
    scheduleTime: null,
    status: "running",
    activeVersionId: "v1",
    dataSourceId: "CUSTOM_API",
    createdAt: "",
    updatedAt: "",
};

describe("getCustomApiIngestProgress", () => {
    it("returns null for non custom api campaigns", () => {
        expect(getCustomApiIngestProgress({ ...baseCampaign, dataSourceId: "CSV" })).toBeNull();
    });

    it("reports starting phase before first page fetch", () => {
        const progress = getCustomApiIngestProgress({
            ...baseCampaign,
            fieldMapping: { __startPage: "5", __endPage: "10", __batchSize: "1000" },
        });
        expect(progress?.phase).toBe("starting");
        expect(progress?.startPage).toBe(5);
        expect(progress?.currentPage).toBe(0);
    });

    it("reports current page and range progress", () => {
        const progress = getCustomApiIngestProgress({
            ...baseCampaign,
            fieldMapping: {
                __startPage: "1",
                __endPage: "10",
                apiCurrentPage: 4,
                apiTotalPages: 50,
                apiIngestedInCurrentRun: 3200,
                __batchSize: "1000",
            },
        });
        expect(progress?.phase).toBe("fetching");
        expect(progress?.currentPage).toBe(4);
        expect(progress?.pagesFetched).toBe(4);
        expect(progress?.pagesInRange).toBe(10);
        expect(progress?.pageProgressPct).toBe(40);
    });
});
