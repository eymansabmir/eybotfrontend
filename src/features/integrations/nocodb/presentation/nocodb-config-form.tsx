import { Plus, Trash2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { NocoDBCredential } from "../domain/nocodb.types";
import type { NocoDBConfigDraft } from "../state/nocodb-config.state";

interface NocoDBConfigFormProps {
  draft: NocoDBConfigDraft;
  credentials: NocoDBCredential[];
  onDraftChange: (patch: Partial<NocoDBConfigDraft>) => void;
  onConnectAccount: () => void;
}

const SECTION_LABEL_CLASS = "text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1";

const OPERATORS = [
  { label: "Equal to", value: "eq" },
  { label: "Not equal", value: "neq" },
  { label: "Contains", value: "like" },
  { label: "Greater than", value: "gt" },
  { label: "Less than", value: "lt" },
  { label: "Is set", value: "isnotnull" },
  { label: "Is empty", value: "isnull" },
  { label: "Starts with", value: "bw" },
  { label: "Ends with", value: "ew" },
];

export function NocoDBConfigForm({
  draft,
  credentials,
  onDraftChange,
  onConnectAccount,
}: NocoDBConfigFormProps) {
  const handleActionChange = (val: string) => {
    onDraftChange({ action: val as any });
  };

  const addField = () => {
    onDraftChange({ fields: [...draft.fields, { key: "", value: "" }] });
  };

  const removeField = (index: number) => {
    onDraftChange({ fields: draft.fields.filter((_, i) => i !== index) });
  };

  const addMapping = () => {
    onDraftChange({ responseMapping: [...draft.responseMapping, { jsonPath: "", variableName: "", scope: "session" }] });
  };

  const removeMapping = (index: number) => {
    onDraftChange({ responseMapping: draft.responseMapping.filter((_, i) => i !== index) });
  };

  const addCondition = () => {
    onDraftChange({ filterConditions: [...draft.filterConditions, { field: "", operator: "eq", value: "" }] });
  };

  const removeCondition = (index: number) => {
    onDraftChange({ filterConditions: draft.filterConditions.filter((_, i) => i !== index) });
  };

  const updateCondition = (index: number, patch: Partial<{ field: string; operator: string; value: string }>) => {
    const newConditions = [...draft.filterConditions];
    newConditions[index] = { ...newConditions[index], ...patch };
    onDraftChange({ filterConditions: newConditions });
  };

  return (
    <div className="flex flex-col gap-5 pt-1">
      {/* Account Selection */}
      <div className="space-y-1.5">
        <Label className={SECTION_LABEL_CLASS}>Account</Label>
        {credentials.length > 0 ? (
          <Select value={draft.credentialId || "__none"} onValueChange={(value) => onDraftChange({ credentialId: value === "__none" ? "" : value })}>
            <SelectTrigger className="w-full bg-background transition-colors hover:bg-accent/50 h-9 text-sm">
              <SelectValue placeholder="Select NocoDB account" />
            </SelectTrigger>
            <SelectContent>
              {credentials.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
              <div className="p-1 border-t mt-1">
                <Button variant="ghost" size="sm" className="w-full justify-start text-[11px] font-medium text-primary hover:text-primary hover:bg-primary/5 h-8" onClick={(e) => { e.preventDefault(); onConnectAccount(); }}>
                  <Plus className="size-3 mr-2" />
                  Connect new
                </Button>
              </div>
            </SelectContent>
          </Select>
        ) : (
          <Button variant="outline" className="w-full h-9 gap-2 text-xs border-dashed" onClick={(e) => { e.preventDefault(); onConnectAccount(); }}>
            <Plus className="size-3" />
            Connect new account
          </Button>
        )}
      </div>

      {draft.credentialId && (
        <>
          <div className="space-y-1.5">
            <Label className={SECTION_LABEL_CLASS}>Action</Label>
            <Select value={draft.action} onValueChange={handleActionChange}>
              <SelectTrigger className="w-full bg-background h-9 text-sm">
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="create_record">Create record</SelectItem>
                <SelectItem value="update_record">Update record</SelectItem>
                <SelectItem value="search_records">Search records</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className={SECTION_LABEL_CLASS}>Table ID</Label>
            <Input value={draft.tableId} onChange={(e) => onDraftChange({ tableId: e.target.value })} placeholder="m_..." className="bg-background h-9 text-sm" />
          </div>

          {(draft.action === "search_records" || draft.action === "update_record") && (
            <div className="space-y-1.5">
              <Label className={SECTION_LABEL_CLASS}>View ID</Label>
              <Input value={draft.viewId} onChange={(e) => onDraftChange({ viewId: e.target.value })} placeholder="v_..." className="bg-background h-9 text-sm" />
            </div>
          )}

          <Accordion type="multiple" defaultValue={["fields", "selection", "filter" as any]} className="w-full gap-3 flex flex-col">
            {(draft.action === "search_records" || draft.action === "update_record") && (
              <AccordionItem value="filter" className="border rounded-lg bg-background px-4">
                <AccordionTrigger className="py-3 text-sm hover:no-underline font-medium">
                  {draft.action === "update_record" ? "Select Records" : "Filter"}
                </AccordionTrigger>
                <AccordionContent className="pb-4 space-y-3">
                  {draft.action === "search_records" && (
                    <div className="space-y-1.5 mb-4 border-b pb-4">
                      <Label className="text-[10px] font-medium text-muted-foreground uppercase">Return Type</Label>
                      <Select value={draft.returnType} onValueChange={(val: any) => onDraftChange({ returnType: val })}>
                        <SelectTrigger className="h-9 text-sm bg-background"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All">All</SelectItem>
                          <SelectItem value="First">First</SelectItem>
                          <SelectItem value="Last">Last</SelectItem>
                          <SelectItem value="Random">Random</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <Label className="text-[10px] font-medium text-muted-foreground uppercase">Conditions</Label>
                    <div className="space-y-2">
                       {draft.filterConditions.map((condition, index) => (
                         <div key={index} className="space-y-2 p-2 border rounded-md relative bg-muted/10">
                            <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-5 w-5 text-muted-foreground hover:text-destructive" onClick={() => removeCondition(index)}>
                              <Trash2 className="size-3" />
                            </Button>
                            <div className="grid grid-cols-2 gap-2 pr-6">
                              <Input placeholder="Field" value={condition.field} onChange={(e) => updateCondition(index, { field: e.target.value })} className="h-8 text-xs bg-background" />
                              <Select value={condition.operator} onValueChange={(val) => updateCondition(index, { operator: val })}>
                                <SelectTrigger className="h-8 text-[10px] bg-background">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {OPERATORS.map(op => (
                                    <SelectItem key={op.value} value={op.value} className="text-xs">{op.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            {condition.operator !== 'isnotnull' && condition.operator !== 'isnull' && (
                              <Input placeholder="Value" value={condition.value} onChange={(e) => updateCondition(index, { value: e.target.value })} className="h-8 text-xs bg-background w-full" />
                            )}
                         </div>
                       ))}
                       <Button variant="outline" size="sm" className="w-full h-8 text-xs gap-1.5 border-dashed mt-1" onClick={addCondition}>
                        <Plus className="size-3" />
                        Add condition
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            <AccordionItem value="fields" className="border rounded-lg bg-background px-4">
              <AccordionTrigger className="py-3 text-sm hover:no-underline font-medium">
                {draft.action === "update_record" ? "Updates" : "Fields"}
              </AccordionTrigger>
              <AccordionContent className="pb-4 space-y-4">
                <div className="space-y-2">
                  {draft.fields.map((field, index) => (
                    <div key={index} className="flex gap-2 items-start group relative">
                      <Input className="flex-1 overflow-hidden h-9 text-sm" placeholder="Field name" value={field.key} onChange={(e) => { const newFields = [...draft.fields]; newFields[index].key = e.target.value; onDraftChange({ fields: newFields }); }} />
                      <Input className="flex-1 overflow-hidden h-9 text-sm" placeholder="Value" value={field.value} onChange={(e) => { const newFields = [...draft.fields]; newFields[index].value = e.target.value; onDraftChange({ fields: newFields }); }} />
                      <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeField(index)}>
                        <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="w-full h-8 text-xs gap-1.5 border-dashed" onClick={addField}>
                  <Plus className="size-3" />
                  Add {draft.action === "update_record" ? "update" : "field"}
                </Button>
              </AccordionContent>
            </AccordionItem>

            {draft.action === "search_records" && (
              <AccordionItem value="mapping" className="border rounded-lg bg-background px-4">
                <AccordionTrigger className="py-3 text-sm hover:no-underline font-medium">Response Mapping</AccordionTrigger>
                <AccordionContent className="pb-4 space-y-4">
                  {draft.responseMapping.map((mapping, index) => (
                    <div key={index} className="space-y-2 p-3 border rounded-md relative bg-muted/20 pb-4">
                      <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => removeMapping(index)}>
                        <Trash2 className="size-3" />
                      </Button>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] text-foreground uppercase font-bold tracking-tight">Enter a field name</Label>
                        <Input value={mapping.jsonPath} onChange={(e) => { const newMap = [...draft.responseMapping]; newMap[index].jsonPath = e.target.value; onDraftChange({ responseMapping: newMap }); }} placeholder="Field Name" className="h-8 text-xs bg-background font-medium" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1.5">
                          <Label className="text-[10px] text-foreground uppercase font-bold tracking-tight">Select variable</Label>
                          <Input value={mapping.variableName} onChange={(e) => { const newMap = [...draft.responseMapping]; newMap[index].variableName = e.target.value; onDraftChange({ responseMapping: newMap }); }} placeholder="record_id" className="h-8 text-xs bg-background" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[10px] text-foreground uppercase font-bold tracking-tight">Scope</Label>
                          <Select value={mapping.scope} onValueChange={(val: any) => { const newMap = [...draft.responseMapping]; newMap[index].scope = val; onDraftChange({ responseMapping: newMap }); }}>
                            <SelectTrigger className="h-8 text-xs bg-background"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="session">Session</SelectItem>
                              <SelectItem value="contact">Contact</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full h-8 text-xs gap-1.5 border-dashed" onClick={addMapping}>
                    <Plus className="size-3" />
                    Add mapping
                  </Button>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </>
      )}
    </div>
  );
}
