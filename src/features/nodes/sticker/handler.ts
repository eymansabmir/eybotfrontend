import type { StickerNodeData } from "./schema";
 
export const StickerNodeHandler = async (data: StickerNodeData) => {
    // Current flow engine seems to handle sending based on message type/payload
    // in the backend sender. This handler might be a placeholder for now
    // similar to other media nodes in this project.
    return data;
};
