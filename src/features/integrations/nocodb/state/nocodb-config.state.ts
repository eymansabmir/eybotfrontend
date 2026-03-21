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
  rowId: string; // Used for "Select Records" or exact Row ID
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
  rowId: data.rowId || '',
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
      if (next.action === 'update_record' && !next.rowId.trim()) isValid = false;

      return { draft: { ...next, isValid } };
    });
  },

  getPayload: () => {
    const { draft } = get();
    
    // Filter out empty fields and mappings
    const fields = draft.fields.filter(f => f.key.trim() && f.value.trim());
    const responseMapping = draft.responseMapping.filter(r => r.variableName.trim() && r.jsonPath.trim());

    return {
      credentialId: draft.credentialId,
      action: draft.action,
      tableId: draft.tableId,
      rowId: draft.rowId,
      fields,
      responseMapping,
    };
  },
}));
