import { Plus, Globe, Key, ArrowRightLeft, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

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

  const methodColors: Record<string, string> = {
    GET: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
    POST: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    PUT: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    PATCH: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    DELETE: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  };

  return (
    <div className="space-y-8">
      {/* Step 1: Account Management */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-base font-semibold">1. Account Configuration</Label>
            <p className="text-xs text-muted-foreground">Select credentials for authentication (Optional)</p>
          </div>
          <Button variant="outline" size="sm" onClick={onConnectAccount} className="h-8 gap-1.5">
            <Plus className="size-3.5" />
            Add Credential
          </Button>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Key className="size-3.5" />
                Request Credential
              </Label>
              <Select value={draft.credentialId || "__none"} onValueChange={(value) => onDraftChange({ credentialId: value === "__none" ? "" : value })}>
                <SelectTrigger className="w-full bg-background transition-colors hover:bg-accent/50">
                  <SelectValue placeholder="Select credential" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">None (No Authentication)</SelectItem>
                  {credentials.map((credential) => (
                    <SelectItem key={credential.id} value={credential.id}>
                      {credential.name}
                    </SelectItem>
                  ))}
                  <div className="p-2 border-t mt-1">
                    <Button 
                       variant="ghost" 
                       size="sm" 
                       className="w-full justify-start text-xs font-medium text-primary hover:text-primary hover:bg-primary/5" 
                       onClick={(e) => {
                         e.preventDefault();
                         onConnectAccount();
                       }}
                    >
                      <Plus className="size-3 mr-2" />
                      Add New Credential
                    </Button>
                  </div>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Globe className="size-3.5" />
                Proxy Credential
              </Label>
              <Select value={draft.proxyCredentialsId || "__none"} onValueChange={(value) => onDraftChange({ proxyCredentialsId: value === "__none" ? "" : value })}>
                <SelectTrigger className="w-full bg-background transition-colors hover:bg-accent/50">
                  <SelectValue placeholder="Select proxy credential" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">None (Direct Connection)</SelectItem>
                  {credentials.map((credential) => (
                    <SelectItem key={credential.id} value={credential.id}>
                      {credential.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Step 2: Request */}
      <div className="space-y-4">
        <div className="space-y-1">
          <Label className="text-base font-semibold">2. Request Details</Label>
          <p className="text-xs text-muted-foreground">Configure the endpoint, headers, and payload</p>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="p-1.5 bg-muted/40 border-b flex items-center">
             <div className="flex-shrink-0 w-32 p-1 relative">
                <Select value={draft.method} onValueChange={(value) => onDraftChange({ method: value as HttpRequestConfigDraft["method"] })}>
                  <SelectTrigger className={`w-full font-medium h-9 border focus:ring-0 focus:ring-offset-0 ${methodColors[draft.method] || ""}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET" className="font-medium text-green-600 dark:text-green-400">GET</SelectItem>
                    <SelectItem value="POST" className="font-medium text-blue-600 dark:text-blue-400">POST</SelectItem>
                    <SelectItem value="PUT" className="font-medium text-orange-600 dark:text-orange-400">PUT</SelectItem>
                    <SelectItem value="PATCH" className="font-medium text-orange-600 dark:text-orange-400">PATCH</SelectItem>
                    <SelectItem value="DELETE" className="font-medium text-red-600 dark:text-red-400">DELETE</SelectItem>
                  </SelectContent>
                </Select>
             </div>
             <div className="flex-1 p-1">
                <Input
                  value={draft.url}
                  onChange={(e) => onDraftChange({ url: e.target.value })}
                  placeholder="https://api.example.com/v1/resource"
                  className="h-9 border-0 shadow-none focus-visible:ring-1 focus-visible:ring-primary/30 bg-transparent font-mono text-sm"
                />
             </div>
          </div>

          <div className="p-4">
             <Tabs defaultValue="query" className="w-full">
               <TabsList className="mb-4">
                 <TabsTrigger value="query">Query Params</TabsTrigger>
                 <TabsTrigger value="headers">Headers</TabsTrigger>
                 {hasBody && <TabsTrigger value="body">Body</TabsTrigger>}
               </TabsList>
               <TabsContent value="query" className="space-y-3 mt-0">
                  <div className="flex items-center justify-between">
                     <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Query Parameters (JSON)</Label>
                  </div>
                  <Textarea
                    className="font-mono text-sm min-h-[120px] bg-muted/30"
                    value={draft.queryParamsText}
                    onChange={(e) => onDraftChange({ queryParamsText: e.target.value })}
                    placeholder={'{\n  "contactId": "{{contact.id}}"\n}'}
                  />
               </TabsContent>
               <TabsContent value="headers" className="space-y-3 mt-0">
                  <div className="flex items-center justify-between">
                     <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Headers (JSON)</Label>
                  </div>
                  <Textarea
                    className="font-mono text-sm min-h-[120px] bg-muted/30"
                    value={draft.headersText}
                    onChange={(e) => onDraftChange({ headersText: e.target.value })}
                    placeholder={'{\n  "Content-Type": "application/json",\n  "X-Custom-Header": "Value"\n}'}
                  />
               </TabsContent>
               {hasBody && (
                 <TabsContent value="body" className="space-y-3 mt-0">
                    <div className="flex items-center justify-between">
                       <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Request Body (Raw Data)</Label>
                       <Badge variant="outline" className="font-normal text-[10px]">JSON / Text / XML</Badge>
                    </div>
                    <Textarea
                      className="font-mono text-sm min-h-[160px] bg-muted/30"
                      value={draft.body}
                      onChange={(e) => onDraftChange({ body: e.target.value })}
                      placeholder={'{\n  "message": "Hello {{contact.name}}"\n}'}
                    />
                 </TabsContent>
               )}
             </Tabs>
          </div>
        </div>
      </div>

      <Separator />

      {/* Step 3: Response & Configuration */}
      <div className="space-y-4">
        <div className="space-y-1">
          <Label className="text-base font-semibold">3. Response & Handling</Label>
          <p className="text-xs text-muted-foreground">Map data from response and set limits</p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
           <div className="md:col-span-2 rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                 <ArrowRightLeft className="size-3.5" />
                 Response Mapping (JSON Array)
              </Label>
              <Textarea
                className="font-mono text-sm min-h-[120px] bg-muted/30"
                value={draft.responseMappingText}
                onChange={(e) => onDraftChange({ responseMappingText: e.target.value })}
                placeholder={'[\n  {\n    "jsonPath": "$.data.id",\n    "variableName": "ticketId",\n    "scope": "session"\n  }\n]'}
              />
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                 Use <strong className="font-medium text-foreground">jsonPath</strong> to extract a value from the response body and map it to a bot variable.
              </p>
           </div>
           
           <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3 h-fit flex flex-col justify-center">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                 <Clock className="size-3.5" />
                 Request Timeout
              </Label>
              <div className="relative border-b">
                 <Input
                   type="number"
                   min={1}
                   value={draft.timeoutMs ?? ""}
                   onChange={(e) => onDraftChange({ timeoutMs: e.target.value ? Number(e.target.value) : undefined })}
                   placeholder="15000"
                   className="pl-3 pr-10 border-0 shadow-none focus-visible:ring-0 px-0 rounded-none bg-transparent"
                 />
                 <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">ms</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                 Maximum allowed time for the request to complete before failing.
              </p>
           </div>
        </div>
      </div>
      
    </div>
  );
}
