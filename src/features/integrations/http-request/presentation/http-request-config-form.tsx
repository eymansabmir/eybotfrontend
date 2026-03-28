import { Plus } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import type { HttpRequestCredential } from "../domain/http-request.types";
import type { HttpRequestConfigDraft } from "../state/http-request-config.state";

interface HttpRequestConfigFormProps {
  draft: HttpRequestConfigDraft;
  credentials: HttpRequestCredential[];
  onDraftChange: (patch: Partial<HttpRequestConfigDraft>) => void;
  onConnectAccount: () => void;
}

const SECTION_LABEL_CLASS = "text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1";

export function HttpRequestConfigForm({
  draft,
  credentials,
  onDraftChange,
  onConnectAccount,
}: HttpRequestConfigFormProps) {
  return (
    <div className="flex flex-col gap-5 pt-1">
      {/* URL & Method */}
      <div className="grid grid-cols-4 gap-2">
        <div className="col-span-1 space-y-1.5">
          <Label className={SECTION_LABEL_CLASS}>Method</Label>
          <Select value={draft.method} onValueChange={(val: any) => onDraftChange({ method: val })}>
            <SelectTrigger className="bg-background h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-3 space-y-1.5">
          <Label className={SECTION_LABEL_CLASS}>URL</Label>
          <Input value={draft.url} onChange={(e) => onDraftChange({ url: e.target.value })} placeholder="https://api.example.com" className="bg-background" />
        </div>
      </div>

      {/* Account & Proxy */}
      <Accordion type="multiple" className="w-full gap-3 flex flex-col">
        <AccordionItem value="auth" className="border rounded-lg bg-background px-4">
          <AccordionTrigger className="py-3 text-sm hover:no-underline font-medium">Authentication</AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <div className="space-y-1.5">
              <Label className={SECTION_LABEL_CLASS}>Account</Label>
              {credentials.length > 0 ? (
                <Select value={draft.credentialId || "__none"} onValueChange={(val) => onDraftChange({ credentialId: val === "__none" ? "" : val })}>
                  <SelectTrigger className="bg-background h-9 text-sm"><SelectValue placeholder="No auth" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">No auth</SelectItem>
                    {credentials.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                    <div className="p-1 border-t mt-1">
                      <Button variant="ghost" size="sm" className="w-full justify-start text-[11px] font-medium text-primary hover:text-primary h-8" onClick={(e) => { e.preventDefault(); onConnectAccount(); }}>
                        <Plus className="size-3 mr-2" />
                        Connect new
                      </Button>
                    </div>
                  </SelectContent>
                </Select>
              ) : (
                <Button variant="outline" className="w-full h-9 gap-2 text-xs border-dashed" onClick={(e) => { e.preventDefault(); onConnectAccount(); }}>
                  <Plus className="size-3" />
                  Connect new
                </Button>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="headers" className="border rounded-lg bg-background px-4">
          <AccordionTrigger className="py-3 text-sm hover:no-underline font-medium">Headers & Params</AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <div className="space-y-1.5">
              <Label className={SECTION_LABEL_CLASS}>Headers (JSON)</Label>
              <Textarea value={draft.headersText} onChange={(e) => onDraftChange({ headersText: e.target.value })} placeholder='{"Authorization": "Bearer ..."}' className="font-mono text-xs bg-muted/20" rows={3} />
            </div>
            <div className="space-y-1.5">
              <Label className={SECTION_LABEL_CLASS}>Query Params (JSON)</Label>
              <Textarea value={draft.queryParamsText} onChange={(e) => onDraftChange({ queryParamsText: e.target.value })} placeholder='{"id": "123"}' className="font-mono text-xs bg-muted/20" rows={2} />
            </div>
          </AccordionContent>
        </AccordionItem>

        {draft.method !== "GET" && (
          <AccordionItem value="body" className="border rounded-lg bg-background px-4">
            <AccordionTrigger className="py-3 text-sm hover:no-underline font-medium">Body</AccordionTrigger>
            <AccordionContent className="pb-4 space-y-4">
              <Textarea value={draft.body} onChange={(e) => onDraftChange({ body: e.target.value })} placeholder='{"foo": "bar"}' className="font-mono text-xs bg-muted/20" rows={5} />
            </AccordionContent>
          </AccordionItem>
        )}

        <AccordionItem value="mapping" className="border rounded-lg bg-background px-4">
          <AccordionTrigger className="py-3 text-sm hover:no-underline font-medium">Response Mapping</AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <div className="space-y-1.5">
              <Label className={SECTION_LABEL_CLASS}>Mappings (JSON Array)</Label>
              <Textarea value={draft.responseMappingText} onChange={(e) => onDraftChange({ responseMappingText: e.target.value })} placeholder='[{"jsonPath": "data.id", "variableName": "id", "scope": "session"}]' className="font-mono text-xs bg-muted/20" rows={3} />
            </div>
            <div className="space-y-1.5">
              <Label className={SECTION_LABEL_CLASS}>Fallback Text (Optional)</Label>
              <Input
                value={draft.fallbackText}
                onChange={(e) => onDraftChange({ fallbackText: e.target.value })}
                placeholder="Continue flow when request fails"
                className="bg-background"
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
