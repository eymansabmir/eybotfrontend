import { Plus, Trash2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import type { HttpRequestCredential } from "../domain/http-request.types";
import type {
  HttpRequestConfigDraft,
  HttpRequestKeyValuePair,
  HttpRequestResponseMappingRow,
  HttpRequestVariableTestRow,
} from "../state/http-request-config.state";

interface HttpRequestConfigFormProps {
  draft: HttpRequestConfigDraft;
  credentials: HttpRequestCredential[];
  onDraftChange: (patch: Partial<HttpRequestConfigDraft>) => void;
  onConnectAccount: () => void;
  onTestRequest?: () => void;
  testingRequest?: boolean;
  testResponseText?: string;
  responsePathSuggestions?: string[];
}

const SECTION_LABEL_CLASS = "text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1";

export function HttpRequestConfigForm({
  draft,
  credentials,
  onDraftChange,
  onConnectAccount,
  onTestRequest,
  testingRequest,
  testResponseText,
  responsePathSuggestions,
}: HttpRequestConfigFormProps) {
  const updateKeyValueRow = (
    type: "headers" | "queryParams",
    id: string,
    patch: Partial<Pick<HttpRequestKeyValuePair, "key" | "value">>,
  ) => {
    const rows = draft[type].map((row) => (row.id === id ? { ...row, ...patch } : row));
    onDraftChange({ [type]: rows });
  };

  const addKeyValueRow = (type: "headers" | "queryParams") => {
    const rows = [...draft[type], createKeyValueRow()];
    onDraftChange({ [type]: rows });
  };

  const removeKeyValueRow = (type: "headers" | "queryParams", id: string) => {
    const rows = draft[type].filter((row) => row.id !== id);
    onDraftChange({ [type]: rows });
  };

  const updateResponseMappingRow = (
    id: string,
    patch: Partial<Pick<HttpRequestResponseMappingRow, "jsonPath" | "variableName" | "scope">>,
  ) => {
    const rows = draft.responseMappings.map((row) => (row.id === id ? { ...row, ...patch } : row));
    onDraftChange({ responseMappings: rows });
  };

  const addResponseMappingRow = () => {
    onDraftChange({ responseMappings: [...draft.responseMappings, createResponseMappingRow()] });
  };

  const removeResponseMappingRow = (id: string) => {
    onDraftChange({ responseMappings: draft.responseMappings.filter((row) => row.id !== id) });
  };

  const addResponseMappingFromSuggestion = (path: string) => {
    if (!path.trim()) return;

    const existing = draft.responseMappings.find((row) => row.jsonPath.trim() === path.trim());
    if (existing) return;

    const suggestion = path.trim();
    const variableName = deriveVariableNameFromPath(suggestion);
    onDraftChange({
      responseMappings: [
        ...draft.responseMappings,
        {
          ...createResponseMappingRow(),
          jsonPath: suggestion,
          variableName,
        },
      ],
    });
  };

  const updateVariableTestRow = (
    id: string,
    patch: Partial<Pick<HttpRequestVariableTestRow, "variableName" | "value">>,
  ) => {
    onDraftChange({
      variablesForTest: draft.variablesForTest.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    });
  };

  const addVariableTestRow = () => {
    onDraftChange({ variablesForTest: [...draft.variablesForTest, createVariableTestRow()] });
  };

  const removeVariableTestRow = (id: string) => {
    onDraftChange({ variablesForTest: draft.variablesForTest.filter((row) => row.id !== id) });
  };

  return (
    <div className="flex flex-col gap-5 pt-1">
      {/* URL & Method */}
      <div className="grid grid-cols-4 gap-2">
        <div className="col-span-1 space-y-1.5">
          <Label className={SECTION_LABEL_CLASS}>Method</Label>
          <Select value={draft.method} onValueChange={(val: any) => onDraftChange({ method: val })}>
            <SelectTrigger className="bg-background h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
                  {["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "CONNECT", "OPTIONS", "TRACE"].map((m) => (
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
              <Label className={SECTION_LABEL_CLASS}>Headers</Label>
              <div className="space-y-2">
                {draft.headers.map((row) => (
                  <div key={row.id} className="space-y-2 p-2 border rounded-md relative bg-muted/10">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 h-5 w-5 text-muted-foreground hover:text-destructive"
                      onClick={() => removeKeyValueRow("headers", row.id)}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                    <div className="pr-6 space-y-2">
                      <Input
                        value={row.key}
                        onChange={(e) => updateKeyValueRow("headers", row.id, { key: e.target.value })}
                        placeholder="e.g. Content-Type"
                        className="h-8 text-xs bg-background"
                      />
                      <Input
                        value={row.value}
                        onChange={(e) => updateKeyValueRow("headers", row.id, { value: e.target.value })}
                        placeholder="e.g. application/json"
                        className="h-8 text-xs bg-background"
                      />
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full h-8 text-xs gap-1.5 border-dashed" onClick={() => addKeyValueRow("headers")}>
                  <Plus className="size-3" />
                  Add a value
                </Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className={SECTION_LABEL_CLASS}>Query params</Label>
              <div className="space-y-2">
                {draft.queryParams.map((row) => (
                  <div key={row.id} className="space-y-2 p-2 border rounded-md relative bg-muted/10">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 h-5 w-5 text-muted-foreground hover:text-destructive"
                      onClick={() => removeKeyValueRow("queryParams", row.id)}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                    <div className="pr-6 space-y-2">
                      <Input
                        value={row.key}
                        onChange={(e) => updateKeyValueRow("queryParams", row.id, { key: e.target.value })}
                        placeholder="e.g. email"
                        className="h-8 text-xs bg-background"
                      />
                      <Input
                        value={row.value}
                        onChange={(e) => updateKeyValueRow("queryParams", row.id, { value: e.target.value })}
                        placeholder="e.g. {{Email}}"
                        className="h-8 text-xs bg-background"
                      />
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full h-8 text-xs gap-1.5 border-dashed" onClick={() => addKeyValueRow("queryParams")}>
                  <Plus className="size-3" />
                  Add a param
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {draft.method !== "GET" && draft.method !== "HEAD" && (
          <AccordionItem value="body" className="border rounded-lg bg-background px-4">
            <AccordionTrigger className="py-3 text-sm hover:no-underline font-medium">Body</AccordionTrigger>
            <AccordionContent className="pb-4 space-y-4">
              <Textarea value={draft.body} onChange={(e) => onDraftChange({ body: e.target.value })} placeholder='{"foo": "bar"}' className="font-mono text-xs bg-muted/20" rows={5} />
            </AccordionContent>
          </AccordionItem>
        )}

        <AccordionItem value="advanced" className="border rounded-lg bg-background px-4">
          <AccordionTrigger className="py-3 text-sm hover:no-underline font-medium">Advanced parameters</AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <div className="space-y-1.5">
              <Label className={SECTION_LABEL_CLASS}>Timeout (ms)</Label>
              <Input
                type="number"
                min={1000}
                max={120000}
                step={1000}
                value={draft.timeoutMs ?? 15000}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  onDraftChange({ timeoutMs: Number.isFinite(value) && value > 0 ? value : 15000 });
                }}
                className="h-9 text-sm bg-background"
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="test" className="border rounded-lg bg-background px-4">
          <AccordionTrigger className="py-3 text-sm hover:no-underline font-medium">Variable values for test</AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <div className="space-y-2">
              {draft.variablesForTest.map((row) => (
                <div key={row.id} className="space-y-2 p-2 border rounded-md relative bg-muted/10">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 h-5 w-5 text-muted-foreground hover:text-destructive"
                    onClick={() => removeVariableTestRow(row.id)}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                  <div className="pr-6 space-y-2">
                    <Input
                      value={row.variableName}
                      onChange={(e) => updateVariableTestRow(row.id, { variableName: e.target.value })}
                      placeholder="Variable name"
                      className="h-8 text-xs bg-background"
                    />
                    <Input
                      value={row.value}
                      onChange={(e) => updateVariableTestRow(row.id, { value: e.target.value })}
                      placeholder="Test value"
                      className="h-8 text-xs bg-background"
                    />
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full h-8 text-xs gap-1.5 border-dashed" onClick={addVariableTestRow}>
                <Plus className="size-3" />
                Add an entry
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="mapping" className="border rounded-lg bg-background px-4">
          <AccordionTrigger className="py-3 text-sm hover:no-underline font-medium">Response Mapping</AccordionTrigger>
          <AccordionContent className="pb-4 space-y-4">
            <div className="space-y-1.5">
              <Label className={SECTION_LABEL_CLASS}>Mappings</Label>
              <div className="space-y-2">
                {draft.responseMappings.map((row) => (
                  <div key={row.id} className="space-y-2 p-2 border rounded-md relative bg-muted/10">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 h-5 w-5 text-muted-foreground hover:text-destructive"
                      onClick={() => removeResponseMappingRow(row.id)}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                    <div className="pr-6 grid grid-cols-2 gap-2">
                      <Input
                        value={row.jsonPath}
                        onChange={(e) => updateResponseMappingRow(row.id, { jsonPath: e.target.value })}
                        placeholder="e.g. $.id"
                        list="http-response-path-suggestions"
                        className="h-8 text-xs bg-background"
                      />
                      <Input
                        value={row.variableName}
                        onChange={(e) => updateResponseMappingRow(row.id, { variableName: e.target.value })}
                        placeholder="e.g. id"
                        className="h-8 text-xs bg-background"
                      />
                    </div>
                    <div className="pr-6">
                      <Select
                        value={row.scope}
                        onValueChange={(val: "session" | "contact") => updateResponseMappingRow(row.id, { scope: val })}
                      >
                        <SelectTrigger className="h-8 text-xs bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="session">Session</SelectItem>
                          <SelectItem value="contact">Contact</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full h-8 text-xs gap-1.5 border-dashed" onClick={addResponseMappingRow}>
                  <Plus className="size-3" />
                  Add mapping
                </Button>
                {responsePathSuggestions && responsePathSuggestions.length > 0 && (
                  <datalist id="http-response-path-suggestions">
                    {responsePathSuggestions.map((path) => (
                      <option key={path} value={path} />
                    ))}
                  </datalist>
                )}
              </div>
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

      {onTestRequest && (
        <Button variant="outline" className="h-9" onClick={onTestRequest} disabled={testingRequest || !draft.url.trim()}>
          {testingRequest ? "Testing..." : "Test request"}
        </Button>
      )}

      {testResponseText && (
        <div className="space-y-1.5">
          <Label className={SECTION_LABEL_CLASS}>Test Response</Label>
          <Textarea value={testResponseText} readOnly className="font-mono text-xs bg-muted/20" rows={6} />
        </div>
      )}

      {responsePathSuggestions && responsePathSuggestions.length > 0 && (
        <div className="space-y-1.5">
          <Label className={SECTION_LABEL_CLASS}>Response Paths</Label>
          <div className="max-h-28 overflow-y-auto rounded-md border bg-muted/10 p-2 text-[11px] font-mono text-muted-foreground space-y-1">
            {responsePathSuggestions.map((path) => (
              <button
                key={path}
                type="button"
                className="block w-full text-left hover:text-foreground"
                onClick={() => addResponseMappingFromSuggestion(path)}
                title="Add mapping from this path"
              >
                {path}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function createKeyValueRow(): HttpRequestKeyValuePair {
  return {
    id: `kv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    key: "",
    value: "",
  };
}

function createResponseMappingRow(): HttpRequestResponseMappingRow {
  return {
    id: `map_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    jsonPath: "",
    variableName: "",
    scope: "session",
  };
}

function createVariableTestRow(): HttpRequestVariableTestRow {
  return {
    id: `test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    variableName: "",
    value: "",
  };
}

function deriveVariableNameFromPath(path: string): string {
  const withoutRoot = path.replace(/^\$\.?/, "");
  const withoutIndexes = withoutRoot.replace(/\[\d+\]/g, "");
  const segments = withoutIndexes.split(".").filter(Boolean);
  const candidate = segments.length > 0 ? segments[segments.length - 1] : "value";
  const cleaned = candidate.replace(/[^a-zA-Z0-9_]/g, "_");
  return cleaned || "value";
}
