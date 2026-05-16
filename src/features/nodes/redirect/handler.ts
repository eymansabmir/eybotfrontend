import type { RedirectNodeData } from "./schema";

export const RedirectNodeHandler = async (data: RedirectNodeData) => {
    // Redirect logic is handled on the client-side/engine
    return data;
};
