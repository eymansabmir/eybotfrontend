import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VariableSelect } from "../../../../variables/components/variable-select";
import type { TableListItemProps } from "./table-list";

export type ExtractItem = {
  id: string;
  column?: string;
  variableName?: string;
};

export const CellWithVariableSelectStack = ({
  item,
  onItemChange,
  columns,
}: TableListItemProps<ExtractItem> & { columns: string[] }) => {
  const handleColumnSelect = (column: string) => {
    if (item.column === column) return;
    onItemChange({ ...item, column });
  };
  
  const handleVariableChange = (variableName: string) => {
    if (item.variableName === variableName) return;
    onItemChange({ ...item, variableName });
  };

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
      <VariableSelect
        value={item.variableName || ""}
        onValueChange={handleVariableChange}
        placeholder="Select a variable"
      />
    </div>
  );
};
