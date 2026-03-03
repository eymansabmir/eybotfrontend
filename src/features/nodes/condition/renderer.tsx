import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { GitBranch, Plus, Trash2, ChevronDown } from "lucide-react";
import type { ConditionNodeData, ConditionExpression, Comparator } from "./schema";
import { cn } from "@/lib/utils";
import { useReactFlow } from "@xyflow/react";

const COMPARATORS: { value: Comparator; label: string }[] = [
    { value: "eq", label: "=" },
    { value: "neq", label: "≠" },
    { value: "contains", label: "contains" },
    { value: "not_contains", label: "not contains" },
    { value: "gt", label: ">" },
    { value: "lt", label: "<" },
    { value: "gte", label: ">=" },
    { value: "lte", label: "<=" },
    { value: "exists", label: "exists" },
    { value: "not_exists", label: "not exists" },
    { value: "regex", label: "matches regex" },
];

const NO_VALUE_COMPARATORS = new Set<Comparator>(["exists", "not_exists"]);

function isLeaf(expr: ConditionExpression): expr is { variable: string; comparator: Comparator; value?: any } {
    return "variable" in expr;
}

function LeafEditor({
    expr,
    onChange,
    onRemove,
    depth,
}: {
    expr: { variable: string; comparator: Comparator; value?: any };
    onChange: (e: { variable: string; comparator: Comparator; value?: any }) => void;
    onRemove?: () => void;
    depth: number;
}) {
    return (
        <div className={cn("flex items-center gap-1.5 rounded-lg border border-border/50 bg-background/60 p-1.5", depth > 0 && "ml-3")}>
            <input
                type="text"
                className="w-24 bg-muted/50 rounded-md border border-border/40 px-2 py-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-primary/20"
                value={expr.variable}
                placeholder="{{variable}}"
                onChange={(e) => onChange({ ...expr, variable: e.target.value })}
            />
            <div className="relative">
                <select
                    className="appearance-none bg-muted/50 rounded-md border border-border/40 pl-2 pr-5 py-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-primary/20 cursor-pointer"
                    value={expr.comparator}
                    onChange={(e) => onChange({ ...expr, comparator: e.target.value as Comparator })}
                >
                    {COMPARATORS.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                </select>
                <ChevronDown size={8} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
            </div>
            {!NO_VALUE_COMPARATORS.has(expr.comparator) && (
                <input
                    type="text"
                    className="w-20 bg-muted/50 rounded-md border border-border/40 px-2 py-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-primary/20"
                    value={expr.value ?? ""}
                    placeholder="value"
                    onChange={(e) => onChange({ ...expr, value: e.target.value })}
                />
            )}
            {onRemove && (
                <button onClick={onRemove} className="text-muted-foreground hover:text-destructive transition-colors shrink-0">
                    <Trash2 size={10} />
                </button>
            )}
        </div>
    );
}

function GroupEditor({
    expr,
    onChange,
    onRemove,
    depth,
}: {
    expr: { operator: "AND" | "OR"; rules: ConditionExpression[] };
    onChange: (e: ConditionExpression) => void;
    onRemove?: () => void;
    depth: number;
}) {
    const updateRule = (i: number, updated: ConditionExpression) => {
        const rules = expr.rules.map((r, j) => (j === i ? updated : r));
        onChange({ ...expr, rules });
    };

    const removeRule = (i: number) => {
        const rules = expr.rules.filter((_, j) => j !== i);
        onChange({ ...expr, rules });
    };

    const addLeaf = () => {
        onChange({
            ...expr,
            rules: [...expr.rules, { variable: "", comparator: "eq", value: "" }],
        });
    };

    const addGroup = () => {
        onChange({
            ...expr,
            rules: [...expr.rules, { operator: "AND", rules: [{ variable: "", comparator: "eq", value: "" }] }],
        });
    };

    const toggleOperator = () => {
        onChange({ ...expr, operator: expr.operator === "AND" ? "OR" : "AND" });
    };

    const isAnd = expr.operator === "AND";

    return (
        <div className={cn("rounded-xl border p-2 space-y-1.5", depth === 0 ? "border-border/50 bg-muted/10" : "border-border/30 bg-muted/20 ml-3")}>
            <div className="flex items-center gap-2">
                <button
                    onClick={toggleOperator}
                    className={cn(
                        "rounded-md px-2 py-0.5 text-[9px] font-bold transition-colors",
                        isAnd
                            ? "bg-blue-500/15 text-blue-600 hover:bg-blue-500/25"
                            : "bg-amber-500/15 text-amber-600 hover:bg-amber-500/25"
                    )}
                >
                    {expr.operator}
                </button>
                <span className="text-[9px] text-muted-foreground">
                    {isAnd ? "all conditions must match" : "any condition must match"}
                </span>
                <div className="flex-1" />
                {onRemove && (
                    <button onClick={onRemove} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 size={10} />
                    </button>
                )}
            </div>

            {expr.rules.map((rule, i) => (
                <div key={i}>
                    {isLeaf(rule) ? (
                        <LeafEditor
                            expr={rule}
                            onChange={(updated) => updateRule(i, updated)}
                            onRemove={() => removeRule(i)}
                            depth={depth + 1}
                        />
                    ) : (
                        <GroupEditor
                            expr={rule as { operator: "AND" | "OR"; rules: ConditionExpression[] }}
                            onChange={(updated) => updateRule(i, updated)}
                            onRemove={() => removeRule(i)}
                            depth={depth + 1}
                        />
                    )}
                </div>
            ))}

            <div className="flex items-center gap-2 pt-0.5">
                <button
                    onClick={addLeaf}
                    className="flex items-center gap-1 text-[9px] text-primary hover:text-primary/80 font-medium transition-colors"
                >
                    <Plus size={9} /> Condition
                </button>
                {depth < 2 && (
                    <button
                        onClick={addGroup}
                        className="flex items-center gap-1 text-[9px] text-muted-foreground hover:text-foreground font-medium transition-colors"
                    >
                        <Plus size={9} /> Group
                    </button>
                )}
            </div>
        </div>
    );
}

export function ConditionNodeRenderer({ id, data, selected }: NodeProps & { data: ConditionNodeData }) {
    const { setNodes } = useReactFlow();

    const updateExpression = (expression: ConditionExpression) => {
        setNodes((nds) =>
            nds.map((node) =>
                node.id === id ? { ...node, data: { ...node.data, expression } } : node
            )
        );
    };

    const expr = data.expression;
    const rootIsGroup = expr && !isLeaf(expr);

    return (
        <div
            className={cn(
                "group relative min-w-[300px] rounded-2xl border bg-card p-0 transition-all hover:shadow-xl",
                selected ? "border-primary shadow-lg ring-4 ring-primary/10" : "border-border"
            )}
        >
            <Handle
                type="target"
                position={Position.Top}
                className="h-4 w-4 border-2 border-background bg-muted-foreground shadow-sm hover:scale-125 transition-transform"
            />

            <div className="flex items-center gap-2 border-b border-border/50 bg-muted/30 px-4 py-2.5 rounded-t-2xl">
                <div className="rounded-lg bg-blue-500/10 p-1.5 text-blue-500">
                    <GitBranch size={14} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">
                    Condition
                </span>
                <div className="ml-auto flex items-center gap-2">
                    <span className="rounded-md bg-green-500/10 px-2 py-0.5 text-[9px] font-bold text-green-600">Yes</span>
                    <span className="rounded-md bg-red-500/10 px-2 py-0.5 text-[9px] font-bold text-red-600">No</span>
                </div>
            </div>

            <div className="p-4">
                {expr ? (
                    rootIsGroup ? (
                        <GroupEditor
                            expr={expr as { operator: "AND" | "OR"; rules: ConditionExpression[] }}
                            onChange={updateExpression}
                            depth={0}
                        />
                    ) : (
                        <LeafEditor
                            expr={expr as { variable: string; comparator: Comparator; value?: any }}
                            onChange={updateExpression}
                            depth={0}
                        />
                    )
                ) : (
                    <div className="text-[10px] text-muted-foreground italic text-center py-2">No condition set</div>
                )}
            </div>

            {/* Yes branch */}
            <Handle
                type="source"
                position={Position.Right}
                id="yes"
                style={{ top: "40%" }}
                className="h-4 w-4 border-2 border-background bg-green-500 shadow-sm hover:scale-125 transition-transform"
            />
            {/* No branch */}
            <Handle
                type="source"
                position={Position.Right}
                id="no"
                style={{ top: "60%" }}
                className="h-4 w-4 border-2 border-background bg-red-500 shadow-sm hover:scale-125 transition-transform"
            />

            <div className="absolute inset-y-0 -left-px w-[2px] scale-y-0 bg-blue-500 transition-transform group-hover:scale-y-100 rounded-l-2xl" />
        </div>
    );
}
