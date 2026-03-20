import type { LanguageNodeData } from "./schema";

export const LanguageNodeHandler = async (data: LanguageNodeData) => {
    console.log("Processing language node:", data.message);
    return data;
};
