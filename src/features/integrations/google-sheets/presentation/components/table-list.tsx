import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export type TableListItemProps<T> = {
  item: T;
  onItemChange: (item: T) => void;
};

type Props<T extends object> = {
  items: T[];
  onItemsChange: (items: T[]) => void;
  addLabel?: string;
  newItemDefaultProps?: Partial<T>;
  children: (props: TableListItemProps<T>) => React.ReactNode;
};

export const TableList = <T extends object>({
  items,
  onItemsChange,
  addLabel = "Add a value",
  newItemDefaultProps,
  children,
}: Props<T>) => {
  const [showDeleteIndex, setShowDeleteIndex] = useState<number | null>(null);

  const createItem = () => {
    const newItem = { id: crypto.randomUUID(), ...newItemDefaultProps } as unknown as T;
    onItemsChange([...items, newItem]);
  };

  const updateItem = (itemIndex: number, updates: Partial<T>) => {
    const newItems = items.map((item, idx) =>
      idx === itemIndex ? { ...item, ...updates } : item
    );
    onItemsChange(newItems);
  };

  const deleteItem = (itemIndex: number) => () => {
    const newItems = [...items];
    newItems.splice(itemIndex, 1);
    onItemsChange([...newItems]);
  };

  return (
    <div className="flex flex-col gap-2">
      {items.map((item, itemIndex) => (
        <div
          key={"id" in item ? (item as any).id : itemIndex}
          className="relative flex items-center justify-center pt-2 pb-2"
          onMouseEnter={() => setShowDeleteIndex(itemIndex)}
          onMouseLeave={() => setShowDeleteIndex(null)}
        >
          {children({ item, onItemChange: (updated) => updateItem(itemIndex, updated) })}
          
          {showDeleteIndex === itemIndex && (
            <Button
              size="icon"
              aria-label="Remove cell"
              onClick={deleteItem(itemIndex)}
              variant="destructive"
              className="absolute -left-2 -top-2 size-6 rounded-full shadow-md z-10"
            >
              <Trash2 className="size-3" />
            </Button>
          )}
        </div>
      ))}
      <Button 
        onClick={(e) => { e.preventDefault(); createItem(); }} 
        className="shrink-0 w-full gap-2 mt-2" 
        variant="secondary"
        size="sm"
      >
        <Plus className="size-3" />
        {addLabel}
      </Button>
    </div>
  );
};
