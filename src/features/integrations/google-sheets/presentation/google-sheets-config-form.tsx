import { Plus } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import type { GoogleSheetsCredential, GoogleSheetInfo } from "../domain/google-sheets.types";
import type { GoogleSheetsConfigDraft } from "../state/google-sheets-config.state";
import { TableList } from "./components/table-list";
import { CellWithValueStack, type CellItem } from "./components/cell-value-stack";

interface GoogleSheetsConfigFormProps {
  draft: GoogleSheetsConfigDraft;
  credentials: GoogleSheetsCredential[];
  sheets: GoogleSheetInfo[];
  columns: string[];
  sheetsLoading?: boolean;
  columnsLoading?: boolean;
  onDraftChange: (patch: Partial<GoogleSheetsConfigDraft>) => void;
  onConnectAccount: () => void;
  onPickSpreadsheet: () => void;
  onTestConnection: () => void;
  testingConnection?: boolean;
}

export function GoogleSheetsConfigForm({
  draft,
  credentials,
  sheets,
  columns,
  sheetsLoading,
  columnsLoading,
  onDraftChange,
  onConnectAccount,
  onPickSpreadsheet,
  onTestConnection,
  testingConnection,
}: GoogleSheetsConfigFormProps) {

  return (
    <div className="flex flex-col gap-5 pt-1">
      {/* ── Step 1: Account ── */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">1. Account</Label>
        {credentials.length > 0 ? (
          <div className="flex gap-2">
            <Select
              value={draft.credentialId || "__none"}
              onValueChange={(value) =>
                onDraftChange({
                  credentialId: value === "__none" ? "" : value,
                  spreadsheetId: "",
                  spreadsheetName: "",
                  sheetId: "",
                  sheetName: "",
                })
              }
            >
              <SelectTrigger className="w-full bg-background transition-colors hover:bg-accent/50 h-9 text-sm">
                <SelectValue placeholder="Select Google Account" />
              </SelectTrigger>
              <SelectContent>
                {credentials.map((credential) => (
                  <SelectItem key={credential.id} value={credential.id}>{credential.name}</SelectItem>
                ))}
                <div className="p-1 border-t mt-1">
                  <Button variant="ghost" size="sm" className="w-full justify-start text-[11px] font-medium text-primary hover:text-primary hover:bg-primary/5 h-8" onClick={(e) => { e.preventDefault(); onConnectAccount(); }}>
                    <Plus className="size-3 mr-2" />
                    Connect new
                  </Button>
                </div>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              className="h-9 whitespace-nowrap"
              disabled={!draft.credentialId || draft.credentialId === "__none" || testingConnection}
              onClick={onTestConnection}
            >
              {testingConnection ? "Testing..." : "Test"}
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full h-9 gap-2 text-xs border-dashed"
            onClick={(e) => { e.preventDefault(); onConnectAccount(); }}
          >
            <Plus className="size-3" />
            Connect new account
          </Button>
        )}
      </div>

      {draft.credentialId && (
        <>
          {/* ── Step 2: Action ── */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">2. Action</Label>
            <Select value={draft.action} onValueChange={(value) => onDraftChange({ action: value as GoogleSheetsConfigDraft["action"] })}>
              <SelectTrigger className="w-full bg-background h-9 text-sm">
                <SelectValue placeholder="Select an operation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="insert_row">Insert a row</SelectItem>
                <SelectItem value="update_row">Update a row</SelectItem>
                <SelectItem value="get_row">Get data from sheet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ── Step 3: Spreadsheet (only when action is selected) ── */}
          {draft.action && (
            <div className="space-y-1.5">
              <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">3. Spreadsheet</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 flex-1 justify-start truncate text-left font-normal"
                  onClick={() => onPickSpreadsheet()}
                >
                  {draft.spreadsheetName || draft.spreadsheetId || "Pick spreadsheet"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-9"
                  disabled={!draft.spreadsheetId}
                  onClick={() =>
                    onDraftChange({
                      spreadsheetId: "",
                      spreadsheetName: "",
                      sheetId: "",
                      sheetName: "",
                    })
                  }
                >
                  Clear
                </Button>
              </div>
              {draft.spreadsheetId ? (
                <p className="truncate text-[11px] text-muted-foreground">
                  {draft.spreadsheetName || draft.spreadsheetId}
                </p>
              ) : null}
            </div>
          )}

          {/* ── Step 4: Worksheet (only when spreadsheet is selected) ── */}
          {draft.spreadsheetId && (
            <div className="space-y-1.5">
              <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">4. Worksheet</Label>
              <Select
                value={draft.sheetId}
                onValueChange={(value) => {
                  const selectedSheet = sheets.find(s => s.id === value);
                  onDraftChange({ sheetId: value, sheetName: selectedSheet?.name || "" });
                }}
                disabled={!draft.spreadsheetId || sheetsLoading}
              >
                <SelectTrigger className="w-full bg-background h-9 text-sm">
                  <SelectValue placeholder={sheetsLoading ? "Loading..." : "Select Worksheet"} />
                </SelectTrigger>
                <SelectContent>
                  {sheets.length === 0 ? (
                    <p className="p-2 text-xs text-muted-foreground text-center">No worksheets found</p>
                  ) : (
                    sheets.map((sh) => (
                      <SelectItem key={sh.id} value={sh.id}>{sh.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* ── Step 5: Action-specific options ── */}
          {draft.action && draft.sheetId && (
            <div className="mt-2">
              <ActionOptions
                draft={draft}
                columns={columns}
                columnsLoading={columnsLoading}
                onDraftChange={onDraftChange}
              />

              {/* ── Response Mapping ── */}
              <Accordion type="single" collapsible className="w-full mt-4">
                <AccordionItem value="mapping" className="border rounded-lg bg-background">
                  <AccordionTrigger className="px-4 py-3 text-sm hover:no-underline">Response Mapping</AccordionTrigger>
                  <AccordionContent className="p-4 pt-0 space-y-4">
                    <Textarea
                      className="font-mono text-[11px] min-h-[100px] bg-background"
                      value={draft.responseMappingText}
                      onChange={(e) => onDraftChange({ responseMappingText: e.target.value })}
                      placeholder={'[\n  {\n    "jsonPath": "$.success",\n    "variableName": "res",\n    "scope": "session"\n  }\n]'}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ActionOptions({
  draft,
  columns,
  columnsLoading,
  onDraftChange,
}: {
  draft: GoogleSheetsConfigDraft;
  columns: string[];
  columnsLoading?: boolean;
  onDraftChange: (patch: Partial<GoogleSheetsConfigDraft>) => void;
}) {
  const cols = columnsLoading ? [] : columns;

  switch (draft.action) {
    case "insert_row":
      return (
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Values to insert</Label>
          {columnsLoading ? (
            <p className="text-xs text-muted-foreground animate-pulse">Loading columns...</p>
          ) : (
            <TableList<CellItem>
              items={draft.valuesItems}
              onItemsChange={(items) => onDraftChange({ valuesItems: items })}
              addLabel="Add a value"
            >
              {({ item, onItemChange }) => (
                <CellWithValueStack item={item} onItemChange={onItemChange} columns={cols} />
              )}
            </TableList>
          )}
        </div>
      );

    case "update_row":
      return (
        <Accordion type="multiple" defaultValue={["filter", "cells"]} className="w-full space-y-1">
          <AccordionItem value="filter" className="border rounded-md bg-muted/20 px-3">
            <AccordionTrigger className="py-2.5 text-xs font-semibold hover:no-underline">Row to update</AccordionTrigger>
            <AccordionContent className="pb-3 space-y-3">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Row ID (1-indexed, required)</Label>
                <Input
                  type="number"
                  value={draft.rowId ?? ""}
                  onChange={(e) => onDraftChange({ rowId: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="2"
                  className="bg-background h-8 text-xs"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Update currently targets one explicit row ID. Use "Get data from sheet" first if you need to look up a row before updating.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="cells" className="border rounded-md bg-muted/20 px-3">
            <AccordionTrigger className="py-2.5 text-xs font-semibold hover:no-underline">Cells to update</AccordionTrigger>
            <AccordionContent className="pb-3 space-y-2">
              {columnsLoading ? (
                <p className="text-xs text-muted-foreground animate-pulse">Loading columns...</p>
              ) : (
                <TableList<CellItem>
                  items={draft.valuesItems}
                  onItemsChange={(items) => onDraftChange({ valuesItems: items })}
                  addLabel="Add a value"
                >
                  {({ item, onItemChange }) => (
                    <CellWithValueStack item={item} onItemChange={onItemChange} columns={cols} />
                  )}
                </TableList>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      );

    case "get_row":
      return (
        <Accordion type="multiple" defaultValue={["select"]} className="w-full space-y-1">
          <AccordionItem value="select" className="border rounded-md bg-muted/20 px-3">
            <AccordionTrigger className="py-2.5 text-xs font-semibold hover:no-underline">Select row(s)</AccordionTrigger>
            <AccordionContent className="pb-3 space-y-3">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Row ID (optional)</Label>
                <Input
                  type="number"
                  value={draft.rowId ?? ""}
                  onChange={(e) => onDraftChange({ rowId: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="2"
                  className="bg-background h-8 text-xs"
                />
              </div>
              <Label className="text-xs text-muted-foreground">Or filter:</Label>
              {columnsLoading ? (
                <p className="text-xs text-muted-foreground animate-pulse">Loading columns...</p>
              ) : (
                <TableList<CellItem>
                  items={draft.filterItems}
                  onItemsChange={(items) => onDraftChange({ filterItems: items })}
                  addLabel="Add a filter"
                >
                  {({ item, onItemChange }) => (
                    <CellWithValueStack item={item} onItemChange={onItemChange} columns={cols} />
                  )}
                </TableList>
              )}

            </AccordionContent>
          </AccordionItem>
        </Accordion>
      );

    default:
      return null;
  }
}
