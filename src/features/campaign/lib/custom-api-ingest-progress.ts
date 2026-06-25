import type { Campaign, CustomApiIngestProgress } from "../types";

/** Derive live CUSTOM_API page-fetch progress from campaign fieldMapping. */
export function getCustomApiIngestProgress(campaign: Campaign): CustomApiIngestProgress | null {
    if (campaign.dataSourceId !== "CUSTOM_API") return null;

    const mapping = campaign.fieldMapping ?? {};
    const startPage = Math.max(1, Number(mapping.__startPage) || 1);
    const endPageRaw = mapping.__endPage;
    const configuredEndPage =
        endPageRaw != null && endPageRaw !== ""
            ? Math.max(startPage, Number(endPageRaw))
            : null;
    const currentPage = Number(mapping.apiCurrentPage) || 0;
    const apiTotalPages =
        mapping.apiTotalPages != null && mapping.apiTotalPages !== ""
            ? Number(mapping.apiTotalPages)
            : null;
    const ingestedThisRun = Number(mapping.apiIngestedInCurrentRun) || 0;
    const maxRecords = Number(mapping.__maxRecords) > 0 ? Number(mapping.__maxRecords) : null;
    const pageSize = Number(mapping.__batchSize) > 0 ? Number(mapping.__batchSize) : null;

    let effectiveEndPage = configuredEndPage;
    if (apiTotalPages != null && apiTotalPages > 0) {
        effectiveEndPage =
            effectiveEndPage != null
                ? Math.min(effectiveEndPage, apiTotalPages)
                : apiTotalPages;
    }

    const pagesInRange =
        effectiveEndPage != null ? Math.max(0, effectiveEndPage - startPage + 1) : null;
    const pagesFetched =
        currentPage >= startPage
            ? Math.min(
                  currentPage - startPage + 1,
                  pagesInRange ?? currentPage - startPage + 1,
              )
            : 0;

    const pageProgressPct =
        pagesInRange != null && pagesInRange > 0
            ? Math.min(100, (pagesFetched / pagesInRange) * 100)
            : null;

    const pagesComplete =
        currentPage > 0 &&
        (effectiveEndPage != null
            ? currentPage >= effectiveEndPage
            : apiTotalPages != null && currentPage >= apiTotalPages);

    const hitMaxRecords = maxRecords != null && ingestedThisRun >= maxRecords;

    let phase: CustomApiIngestProgress["phase"] = "idle";
    if (campaign.status === "running") {
        if (currentPage === 0) {
            phase = "starting";
        } else if (!pagesComplete && !hitMaxRecords) {
            phase = "fetching";
        } else {
            phase = "dispatching";
        }
    } else if (currentPage > 0 || ingestedThisRun > 0) {
        phase = "finished";
    }

    return {
        startPage,
        configuredEndPage,
        effectiveEndPage,
        currentPage,
        apiTotalPages,
        ingestedThisRun,
        maxRecords,
        pageSize,
        pagesFetched,
        pagesInRange,
        pageProgressPct,
        phase,
        isActive: campaign.status === "running",
    };
}
