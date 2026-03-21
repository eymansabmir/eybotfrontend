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
            <Input value={draft.tableId} onChange={(e) => onDraftChange({ tableId: e.target.value })} placeholder="m_..." className="bg-background" />
          </div>

          <Accordion type="multiple" defaultValue={["fields"]} className="w-full gap-3 flex flex-col">
            {(draft.action === "update_record" || draft.action === "search_records") && (
              <AccordionItem value="selection" className="border rounded-lg bg-background px-4">
                <AccordionTrigger className="py-3 text-sm hover:no-underline font-medium">Record Selection</AccordionTrigger>
                <AccordionContent className="pb-4 space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-medium text-muted-foreground uppercase">Row ID / Query</Label>
                    <Input value={draft.rowId} onChange={(e) => onDraftChange({ rowId: e.target.value })} placeholder={draft.action === "update_record" ? "123" : "where=(Name,eq,John)"} />
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            <AccordionItem value="fields" className="border rounded-lg bg-background px-4">
              <AccordionTrigger className="py-3 text-sm hover:no-underline font-medium">Fields</AccordionTrigger>
              <AccordionContent className="pb-4 space-y-4">
                {draft.fields.map((field, index) => (
                  <div key={index} className="flex gap-2 items-start group relative">
                    <Input className="flex-1 overflow-hidden" placeholder="Field name" value={field.key} onChange={(e) => { const newFields = [...draft.fields]; newFields[index].key = e.target.value; onDraftChange({ fields: newFields }); }} />
                    <Input className="flex-1 overflow-hidden" placeholder="Value" value={field.value} onChange={(e) => { const newFields = [...draft.fields]; newFields[index].value = e.target.value; onDraftChange({ fields: newFields }); }} />
                    <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeField(index)}>
                      <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full h-8 text-xs gap-1.5 border-dashed" onClick={addField}>
                  <Plus className="size-3" />
                  Add field
                </Button>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="mapping" className="border rounded-lg bg-background px-4">
              <AccordionTrigger className="py-3 text-sm hover:no-underline font-medium">Response Mapping</AccordionTrigger>
              <AccordionContent className="pb-4 space-y-4">
                {draft.responseMapping.map((mapping, index) => (
                  <div key={index} className="space-y-2 p-3 border rounded-md relative bg-muted/20 pb-4">
                    <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => removeMapping(index)}>
                      <Trash2 className="size-3" />
                    </Button>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] text-muted-foreground uppercase">JSON Path</Label>
                      <Input value={mapping.jsonPath} onChange={(e) => { const newMap = [...draft.responseMapping]; newMap[index].jsonPath = e.target.value; onDraftChange({ responseMapping: newMap }); }} placeholder="data.id" className="h-8 text-xs bg-background" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] text-muted-foreground uppercase">Variable</Label>
                        <Input value={mapping.variableName} onChange={(e) => { const newMap = [...draft.responseMapping]; newMap[index].variableName = e.target.value; onDraftChange({ responseMapping: newMap }); }} placeholder="record_id" className="h-8 text-xs bg-background" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] text-muted-foreground uppercase">Scope</Label>
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
          </Accordion>
        </>
      )}
    </div>
  );
}
