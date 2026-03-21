import type { NodeHandler } from "../types";
import { NocoDBNodeDataSchema } from "./schema";

export const nocodbHandler: NodeHandler = {
  isValid: (data: any) => NocoDBNodeDataSchema.safeParse(data).success,
  isExecutable: (data: any) => {
    const parsed = NocoDBNodeDataSchema.safeParse(data);
    if (!parsed.success) return false;
    
    // Check if essential configurations are present
    const nodeData = parsed.data;
    if (!nodeData.credentialId) return false;
    if (!nodeData.tableId) return false;
    
    // Require Row ID for updates
    if (nodeData.action === 'update_record' && !nodeData.rowId) return false;
    
    return true;
  },
};
