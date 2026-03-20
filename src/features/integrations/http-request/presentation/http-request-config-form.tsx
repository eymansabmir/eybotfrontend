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

export function HttpRequestConfigForm({
  draft,
  credentials,
  onDraftChange,
  onConnectAccount,
}: HttpRequestConfigFormProps) {
  const hasBody = ["POST", "PUT", "PATCH", "DELETE"].includes(draft.method);

  return (
    <div className="flex flex-col gap-4">
      {/* Account Selection */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Account</Label>
        <Select value={draft.credentialId || "__none"} onValueChange={(value) => onDraftChange({ credentialId: value === "__none" ? "" : value })}>
          <SelectTrigger className="w-full bg-background transition-colors hover:bg-accent/50 h-9">
            <SelectValue placeholder="No Authentication" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none">None (No Authentication)</SelectItem>
            {credentials.map((credential) => (
              <SelectItem key={credential.id} value={credential.id}>{credential.name}</SelectItem>
            ))}
            <div className="p-1 border-t mt-1">
              <Button variant="ghost" size="sm" className="w-full justify-start text-[11px] font-medium text-primary hover:text-primary hover:bg-primary/5 h-8" onClick={(e) => { e.preventDefault(); onConnectAccount(); }}>
                <Plus className="size-3 mr-2" />
                Add New Account
              </Button>
            </div>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 pt-2 border-t">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Request</Label>
        <div className="flex gap-2">
          <Select value={draft.method} onValueChange={(value) => onDraftChange({ method: value as HttpRequestConfigDraft["method"] })}>
            <SelectTrigger className="w-24 bg-background h-9 shrink-0">
               <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["GET", "POST", "PUT", "PATCH", "DELETE"].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input
            value={draft.url}
            onChange={(e) => onDraftChange({ url: e.target.value })}
            placeholder="https://api.example.com"
            className="flex-1 bg-background h-9 text-xs"
          />
        </div>
      </div>

      <Accordion type="multiple" defaultValue={["params"]} className="w-full space-y-1">
        <AccordionItem value="params" className="border rounded-md bg-muted/20 px-3">
          <AccordionTrigger className="py-2.5 text-xs font-semibold hover:no-underline">Query Parameters</AccordionTrigger>
          <AccordionContent className="pb-3 space-y-2">
            <Textarea
              className="font-mono text-[11px] min-h-[80px] bg-background"
              value={draft.queryParamsText}
              onChange={(e) => onDraftChange({ queryParamsText: e.target.value })}
              placeholder={'{\n  "key": "value"\n}'}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="headers" className="border rounded-md bg-muted/20 px-3">
          <AccordionTrigger className="py-2.5 text-xs font-semibold hover:no-underline">Headers</AccordionTrigger>
          <AccordionContent className="pb-3 space-y-2">
            <Textarea
              className="font-mono text-[11px] min-h-[80px] bg-background"
              value={draft.headersText}
              onChange={(e) => onDraftChange({ headersText: e.target.value })}
              placeholder={'{\n  "Content-Type": "application/json"\n}'}
            />
          </AccordionContent>
        </AccordionItem>

        {hasBody && (
          <AccordionItem value="body" className="border rounded-md bg-muted/20 px-3">
            <AccordionTrigger className="py-2.5 text-xs font-semibold hover:no-underline">Body</AccordionTrigger>
            <AccordionContent className="pb-3 space-y-2">
              <Textarea
                className="font-mono text-[11px] min-h-[120px] bg-background"
                value={draft.body}
                onChange={(e) => onDraftChange({ body: e.target.value })}
                placeholder={'{\n  "message": "Hello"\n}'}
              />
            </AccordionContent>
          </AccordionItem>
        )}

        <AccordionItem value="mapping" className="border rounded-md bg-muted/20 px-3">
          <AccordionTrigger className="py-2.5 text-xs font-semibold hover:no-underline">Response Mapping</AccordionTrigger>
          <AccordionContent className="pb-3 space-y-2">
            <Textarea
              className="font-mono text-[11px] min-h-[100px] bg-background"
              value={draft.responseMappingText}
              onChange={(e) => onDraftChange({ responseMappingText: e.target.value })}
              placeholder={'[\n  {\n    "jsonPath": "$.id",\n    "variableName": "res",\n    "scope": "session"\n  }\n]'}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="advanced" className="border-none">
          <AccordionTrigger className="py-2 text-[10px] uppercase font-bold text-muted-foreground hover:no-underline">Advanced</AccordionTrigger>
          <AccordionContent className="space-y-4">
             <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Timeout (ms)</Label>
                <Input
                  type="number"
                  value={draft.timeoutMs ?? ""}
                  onChange={(e) => onDraftChange({ timeoutMs: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="15000"
                  className="bg-background h-8 text-xs"
                />
             </div>
             <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Proxy Credential</Label>
                <Select value={draft.proxyCredentialsId || "__none"} onValueChange={(value) => onDraftChange({ proxyCredentialsId: value === "__none" ? "" : value })}>
                  <SelectTrigger className="w-full bg-background h-8 text-xs">
                    <SelectValue placeholder="Direct" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">None (Direct)</SelectItem>
                    {credentials.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
             </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

