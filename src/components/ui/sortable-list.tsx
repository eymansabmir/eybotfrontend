import React from "react";
import { Reorder, useDragControls } from "framer-motion";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface SortableListProps<T> {
    items: T[];
    onReorder: (items: T[]) => void;
    renderItem: (item: T, index: number) => React.ReactNode;
    keyExtractor: (item: T, index: number) => string;
    className?: string;
    itemClassName?: string;
}

export function SortableList<T>({
    items,
    onReorder,
    renderItem,
    keyExtractor,
    className,
    itemClassName,
}: SortableListProps<T>) {
    return (
        <Reorder.Group
            axis="y"
            values={items}
            onReorder={onReorder}
            className={cn("flex flex-col gap-2 nodrag", className)}
        >
            {items.map((item, index) => (
                <SortableItem
                    key={keyExtractor(item, index)}
                    value={item}
                    index={index}
                    renderItem={renderItem}
                    className={itemClassName}
                />
            ))}
        </Reorder.Group>
    );
}

interface SortableItemProps<T> {
    value: T;
    index: number;
    renderItem: (item: T, index: number) => React.ReactNode;
    className?: string;
}

function SortableItem<T>({ value, index, renderItem, className }: SortableItemProps<T>) {
    const controls = useDragControls();

    return (
        <Reorder.Item
            value={value}
            dragListener={false}
            dragControls={controls}
            className={cn(
                "relative flex items-center gap-2 group/sortable nodrag",
                className
            )}
        >
            <div
                onPointerDown={(e) => {
                    e.stopPropagation();
                    controls.start(e);
                }}
                className="cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors shrink-0 p-1"
            >
                <GripVertical size={14} />
            </div>
            <div className="flex-1 min-w-0">
                {renderItem(value, index)}
            </div>
        </Reorder.Item>
    );
}
