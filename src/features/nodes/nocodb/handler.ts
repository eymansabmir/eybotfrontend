import type { NocoDBNodeData } from "./schema";
import { NocoDBNodeDataSchema } from "./schema";

export const nocodbHandler = async (data: NocoDBNodeData) => {
  return NocoDBNodeDataSchema.parse(data);
};
