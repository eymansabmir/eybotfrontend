import { create } from "zustand";
import type { NocoDBNodeData } from "../../../nodes/nocodb/schema";

export interface ResponseMapping {
  jsonPath: string;
  variableName: string;
  scope: 'session' | 'contact';
}

export interface NocoDBField {
  key: string;
  value: string;
}

export interface NocoDBConfigDraft {
  credentialId?: string;
  action: 'create_record' | 'update_record' | 'search_records';
  tableId: string;
  viewId: string;
  filter: string;
  filterConditions: Array<{ field: string; operator: string; value: string }>;
  returnType: 'All' | 'First' | 'Last' | 'Random';
  fields: NocoDBField[];
  responseMapping: ResponseMapping[];
  isValid: boolean;
  isDirty: boolean;
}

interface NocoDBConfigState {
  draft: NocoDBConfigDraft;
  init: (data: Partial<NocoDBNodeData>) => void;
  updateDraft: (patch: Partial<NocoDBConfigDraft>) => void;
  getPayload: () => NocoDBNodeData;
}

export const createNocoDBConfigDraft = (data: Partial<NocoDBNodeData>): NocoDBConfigDraft => ({
  credentialId: data.credentialId,
  action: data.action || 'create_record',
  tableId: data.tableId || '',
  viewId: data.viewId || '',
  filter: data.filter || '',
  filterConditions: data.filterConditions?.length ? data.filterConditions : [{ field: '', operator: 'eq', value: '' }],
  returnType: data.returnType || 'All',
  fields: data.fields?.length ? data.fields : [{ key: '', value: '' }],
  responseMapping: data.responseMapping?.length ? data.responseMapping : [{ jsonPath: '', variableName: '', scope: 'session' }],
  isValid: true,
  isDirty: false,
});

export const useNocoDBConfigState = create<NocoDBConfigState>((set, get) => ({
  draft: createNocoDBConfigDraft({}),

  init: (data) => {
    set({
      draft: createNocoDBConfigDraft(data),
    });
  },

  updateDraft: (patch) => {
    set((state) => {
      const next = { ...state.draft, ...patch, isDirty: true };
      
      let isValid = true;
      if (!next.tableId.trim()) isValid = false;
      // In Autobot, search and update need filter if we want records, 
      // but let's keep it simple for now as per their schema which often marks them optional.

      return { draft: { ...next, isValid } };
    });
  },

  getPayload: () => {
    const { draft } = get();
    
    // Filter out empty fields and mappings
    const fields = draft.fields.filter(f => f.key.trim() && f.value.trim());
    const responseMapping = draft.responseMapping.filter(r => r.variableName.trim() && r.jsonPath.trim());
    const filterConditions = draft.filterConditions.filter(c => c.field.trim());

    return {
      credentialId: draft.credentialId,
      action: draft.action,
      tableId: draft.tableId,
      viewId: draft.viewId,
      filter: draft.filter,
      filterConditions,
      returnType: draft.returnType,
      fields,
      responseMapping,
    };
  },
}));
