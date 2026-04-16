import { Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { ConditionLeaf, EntityAttribute } from "../../../types";
import { OPERATOR_LABELS } from "../../../types";

interface ConditionRowProps {
  leaf: ConditionLeaf;
  attributes: EntityAttribute[];
  onChange: (updated: ConditionLeaf) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export function ConditionRow({
  leaf,
  attributes,
  onChange,
  onRemove,
  canRemove,
}: ConditionRowProps) {
  const selectedAttr = attributes.find((a) => a.key === leaf.field);

  const handleFieldChange = (key: string) => {
    const attr = attributes.find((a) => a.key === key);
    onChange({
      field: key,
      operator: attr?.operators[0] ?? "equals",
      value: attr?.type === "boolean" ? "true" : "",
    });
  };

  const handleOperatorChange = (op: string) => {
    onChange({ ...leaf, operator: op, value: "" });
  };

  const handleValueChange = (val: unknown) => {
    onChange({ ...leaf, value: val });
  };

  const operators = selectedAttr?.operators ?? ["equals", "not_equals"];
  const attrType = selectedAttr?.type ?? "string";

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
      {/* Field selector */}
      <Select value={leaf.field} onValueChange={handleFieldChange}>
        <SelectTrigger className="h-8 min-w-[130px] text-xs">
          <SelectValue placeholder="Select attribute" />
        </SelectTrigger>
        <SelectContent>
          {attributes.map((attr) => (
            <SelectItem key={attr.key} value={attr.key} className="text-xs">
              {attr.key}
              <span className="ml-2 text-muted-foreground uppercase text-[10px]">
                {attr.type}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Operator selector */}
      <Select
        value={leaf.operator}
        onValueChange={handleOperatorChange}
        disabled={!leaf.field}
      >
        <SelectTrigger className="h-8 min-w-[110px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {operators.map((op) => (
            <SelectItem key={op} value={op} className="text-xs">
              {OPERATOR_LABELS[op] ?? op}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Value input — adapts to attribute type */}
      <div className="flex-1">
        {attrType === "boolean" ? (
          <Select
            value={String(leaf.value)}
            onValueChange={handleValueChange}
            disabled={!leaf.field}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">True</SelectItem>
              <SelectItem value="false">False</SelectItem>
            </SelectContent>
          </Select>
        ) : attrType === "enum" && selectedAttr?.values?.length ? (
          <Select
            value={String(leaf.value)}
            onValueChange={handleValueChange}
            disabled={!leaf.field}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select value" />
            </SelectTrigger>
            <SelectContent>
              {selectedAttr.values.map((v) => (
                <SelectItem key={v} value={v} className="text-xs">
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : attrType === "date" ? (
          <Input
            type="date"
            className="h-8 text-xs"
            value={String(leaf.value ?? "")}
            onChange={(e) => handleValueChange(e.target.value)}
            disabled={!leaf.field}
          />
        ) : attrType === "number" ? (
          <Input
            type="number"
            className="h-8 text-xs"
            placeholder="Enter value"
            value={String(leaf.value ?? "")}
            onChange={(e) => handleValueChange(e.target.value)}
            disabled={!leaf.field}
          />
        ) : (
          <Input
            type="text"
            className="h-8 text-xs"
            placeholder={
              ["in", "not_in"].includes(leaf.operator)
                ? "value1, value2, …"
                : "Enter value"
            }
            value={String(leaf.value ?? "")}
            onChange={(e) => handleValueChange(e.target.value)}
            disabled={!leaf.field}
          />
        )}
      </div>

      {/* Remove button */}
      <button
        type="button"
        onClick={onRemove}
        disabled={!canRemove}
        aria-label="Remove condition"
        className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}
