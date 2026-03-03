import type { TextNodeData } from "./schema";

export const TextNodeHandler = async (data: TextNodeData) => {
    // Logic to process text before sending (e.g. variable validation)
    console.log("Processing text node:", data.message);
    return data;
};
