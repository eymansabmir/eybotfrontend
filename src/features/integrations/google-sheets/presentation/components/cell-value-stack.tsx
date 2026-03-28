import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { TableListItemProps } from "./table-list";

export type CellItem = {
  id: string;
  column?: string;
  value?: string;
};

export const CellWithValueStack = ({
  item,
  onItemChange,
  columns,
}: TableListItemProps<CellItem> & { columns: string[] }) => {
  const handleColumnSelect = (column: string) => {
    if (item.column === column) return;
    onItemChange({ ...item, column });
  };
  
  const handleValueChange = (value: string) => {
    if (item.value === value) return;
    onItemChange({ ...item, value });
  };

  return (
    <div className="flex flex-col gap-2 p-3 rounded-md flex-1 border bg-card w-full relative">
      <Select value={item.column || ""} onValueChange={handleColumnSelect}>
        <SelectTrigger className="w-full bg-background h-8 text-xs font-semibold">
          <SelectValue placeholder="Select a column" />
        </SelectTrigger>
        <SelectContent>
          {columns.map((col) => (
            <SelectItem key={col} value={col}>
              {col}
            </SelectItem>
          ))}
          {/* Allow custom column if not in list somehow, but we'll strictly bind to columns */}
        </SelectContent>
      </Select>
      <Input
        value={item.value ?? ""}
        onChange={(e) => handleValueChange(e.target.value)}
        placeholder="Type a value..."
        className="bg-background h-8 text-xs"
      />
    </div>
  );
};
