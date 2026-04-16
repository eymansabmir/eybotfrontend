import { useState } from "react";
import { Plus, Trash2, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConditionRow } from "./condition-row";
import type { EntityAttribute, RoutingCondition, LogicalOperator, ConditionLeaf } from "../../../types";
import { cn } from "@/lib/utils";

interface ConditionGroupProps {
  node: { operator: LogicalOperator; children: RoutingCondition[] };
  attributes: EntityAttribute[];
  depth?: number;
  onChange: (updated: { operator: LogicalOperator; children: RoutingCondition[] }) => void;
  onRemove?: () => void;
}

function makeLeaf(): ConditionLeaf {
  return { field: "", operator: "equals", value: "" };
}

function makeGroup(): { operator: LogicalOperator; children: RoutingCondition[] } {
  return { operator: "AND", children: [makeLeaf()] };
}

export function ConditionGroup({
  node,
  attributes,
  depth = 0,
  onChange,
  onRemove,
}: ConditionGroupProps) {
  const [collapsed, setCollapsed] = useState(false);

  const updateChild = (index: number, updated: RoutingCondition) => {
    const children = node.children.map((c, i) => (i === index ? updated : c));
    onChange({ ...node, children });
  };

  const removeChild = (index: number) => {
    if (node.children.length === 1 && !isRoot && onRemove) {
      onRemove();
      return;
    }
    
    if (node.children.length > 1) {
      onChange({ ...node, children: node.children.filter((_, i) => i !== index) });
    }
  };

  const addLeaf = () =>
    onChange({ ...node, children: [...node.children, makeLeaf()] });

  const addGroup = () =>
    onChange({ ...node, children: [...node.children, makeGroup()] });

  const isRoot = depth === 0;

  return (
    <div
      className={cn(
        "rounded-xl border transition-all",
        depth === 0
          ? "border-border bg-background"
          : depth === 1
          ? "border-primary/20 bg-primary/3"
          : "border-violet-500/20 bg-violet-500/3"
      )}
    >
      {/* Group header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/60">
        {/* Collapse toggle */}
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label={collapsed ? "Expand group" : "Collapse group"}
        >
          <ChevronDown
            className={cn("size-4 transition-transform", collapsed && "-rotate-90")}
          />
        </button>

        {/* AND / OR selector */}
        <Select
          value={node.operator}
          onValueChange={(v) => onChange({ ...node, operator: v as LogicalOperator })}
        >
          <SelectTrigger className="h-7 w-20 text-xs font-bold border-none bg-primary/10 text-primary">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AND">AND</SelectItem>
            <SelectItem value="OR">OR</SelectItem>
          </SelectContent>
        </Select>

        <span className="text-xs text-muted-foreground flex-1">
          {isRoot ? "Match all rules in this group" : `Sub-group (depth ${depth})`}
        </span>

        {/* Add buttons */}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs gap-1"
          onClick={addLeaf}
        >
          <Plus className="size-3" /> Condition
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs gap-1"
          onClick={addGroup}
        >
          <Plus className="size-3" /> Group
        </Button>

        {/* Remove group (not root) */}
        {!isRoot && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-1 rounded-md p-1 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
            aria-label="Remove group"
          >
            <Trash2 className="size-3.5" />
          </button>
        )}
      </div>

      {/* Children */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="p-3 space-y-2">
              {node.children.map((child, index) => {
                const isLeaf = "field" in child;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                  >
                    {/* Logical connector label */}
                    {index > 0 && (
                      <div className="flex items-center gap-2 py-1">
                        <div className="h-px flex-1 bg-border" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          {node.operator}
                        </span>
                        <div className="h-px flex-1 bg-border" />
                      </div>
                    )}

                    {isLeaf ? (
                      <ConditionRow
                        leaf={child as ConditionLeaf}
                        attributes={attributes}
                        onChange={(updated) => updateChild(index, updated)}
                        onRemove={() => removeChild(index)}
                        canRemove={node.children.length > 1 || !isRoot}
                      />
                    ) : (
                      <ConditionGroup
                        node={child as { operator: LogicalOperator; children: RoutingCondition[] }}
                        attributes={attributes}
                        depth={depth + 1}
                        onChange={(updated) => updateChild(index, updated)}
                        onRemove={() => removeChild(index)}
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
