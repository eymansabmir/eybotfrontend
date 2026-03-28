import { z } from "zod";


export const NocoDBNodeDataSchema = z.object({
  credentialId: z.string().optional(),
  action: z.enum(['create_record', 'update_record', 'search_records']).default('create_record'),
  tableId: z.string().optional(),
  tableName: z.string().optional(),
  viewId: z.string().optional(),
  filter: z.string().optional(),
  filterConditions: z.array(z.object({
    field: z.string(),
    operator: z.string(),
    value: z.string(),
  })).optional(),
  returnType: z.enum(['All', 'First', 'Last', 'Random']).optional(),
  fields: z.array(z.object({
    key: z.string(),
    value: z.string(),
  })).optional(),
  responseMapping: z.array(z.object({
    jsonPath: z.string(),
    variableName: z.string(),
    scope: z.enum(['session', 'contact']).default('session')
  })).optional(),
});

export type NocoDBNodeData = z.infer<typeof NocoDBNodeDataSchema>;
