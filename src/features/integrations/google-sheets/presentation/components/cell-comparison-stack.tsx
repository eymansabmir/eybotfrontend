import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { TableListItemProps } from "./table-list";

export type ComparisonItem = {
  id: string;
  column?: string;
  comparisonOperator?: string;
  value?: string;
};

const OPERATORS = [
  "Equal to",
  "Not equal",
  "Contains",
  "Does not contain",
  "Greater than",
  "Greater or equal to",
  "Less than",
  "Less or equal to",
  "Is set",
  "Is empty"
];

export const CellComparisonStack = ({
  item,
  onItemChange,
  columns,
}: TableListItemProps<ComparisonItem> & { columns: string[] }) => {
  const handleColumnSelect = (column: string) => {
    if (item.column === column) return;
    onItemChange({ ...item, column });
  };

  const handleOperatorSelect = (comparisonOperator: string) => {
    if (item.comparisonOperator === comparisonOperator) return;
    onItemChange({ ...item, comparisonOperator });
  };

  const handleValueChange = (value: string) => {
    if (item.value === value) return;
    onItemChange({ ...item, value });
  };

  const showValueInput = item.comparisonOperator !== "Is set" && item.comparisonOperator !== "Is empty";

  return (
    <div className="flex flex-col gap-2 p-3 rounded-md flex-1 border bg-card w-full relative">
      <Select value={item.column || ""} onValueChange={handleColumnSelect}>
        <SelectTrigger className="w-full bg-background h-8 text-xs font-semibold">
          <SelectValue placeholder="Select a column" />
        </SelectTrigger>
        <SelectContent>
          {columns.length === 0 ? (
            <SelectItem value="__none" disabled>No columns found</SelectItem>
          ) : (
            columns.map((col) => (
              <SelectItem key={col} value={col}>
                {col}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      <Select value={item.comparisonOperator || ""} onValueChange={handleOperatorSelect}>
        <SelectTrigger className="w-full bg-background h-8 text-xs font-semibold">
          <SelectValue placeholder="Select an operator" />
        </SelectTrigger>
        <SelectContent>
          {OPERATORS.map((op) => (
            <SelectItem key={op} value={op}>
              {op}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showValueInput && (
        <Input
          value={item.value ?? ""}
          onChange={(e) => handleValueChange(e.target.value)}
          placeholder="Type a value..."
          className="bg-background h-8 text-xs"
        />
      )}
    </div>
  );
};
