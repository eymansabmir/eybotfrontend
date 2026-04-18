import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { GitBranch, Plus, Trash2, ChevronDown } from "lucide-react";

import type { ConditionNodeData, ConditionExpression, Comparator } from "./schema";
import { cn } from "@/lib/utils";
import { useReactFlow } from "@xyflow/react";
import { NodeFrame } from "@/features/nodes/presentation/components/node-frame";

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
        <div className={cn("flex items-center gap-1.5 rounded-lg border border-[var(--border-dim)] bg-background p-1.5 my-1.5", depth > 0 && "ml-3")}>
            <input
                type="text"
                className="flex-1 bg-muted/30 rounded border border-[var(--border-dim)] px-2 py-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)]"
                value={expr.variable}
                placeholder="{{variable}}"
                onChange={(e) => onChange({ ...expr, variable: e.target.value })}
            />
            <div className="relative w-24">
                <select
                    className="w-full appearance-none bg-muted/30 rounded border border-[var(--border-dim)] pl-2 pr-5 py-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)] cursor-pointer truncate"
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
                    className="flex-1 bg-muted/30 rounded border border-[var(--border-dim)] px-2 py-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-[var(--ey-yellow)]"
                    value={expr.value ?? ""}
                    placeholder="value"
                    onChange={(e) => onChange({ ...expr, value: e.target.value })}
                />
            )}
            {onRemove && (
                <button onClick={onRemove} className="text-muted-foreground hover:text-destructive transition-colors shrink-0 p-0.5">
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
        <div className={cn("rounded-lg border p-2 space-y-1 my-1.5", depth === 0 ? "border-[var(--border-dim)] bg-muted/5" : "border-[var(--border-dim)] bg-muted/10 ml-3")}>
            <div className="flex items-center gap-2 mb-1.5">
                <button
                    onClick={toggleOperator}
                    className={cn(
                        "rounded px-2 py-0.5 text-[9px] font-bold transition-colors select-none",
                        isAnd
                            ? "bg-zinc-500/10 text-zinc-600 dark:text-zinc-300 hover:bg-blue-500/20"
                            : "bg-zinc-500/10 text-zinc-600 dark:text-zinc-300 hover:bg-amber-500/20"
                    )}
                >
                    {expr.operator}
                </button>
                <span className="text-[9px] text-muted-foreground italic">
                    {isAnd ? "all must match" : "any can match"}
                </span>
                <div className="flex-1" />
                {onRemove && (
                    <button onClick={onRemove} className="text-muted-foreground hover:text-destructive transition-colors p-0.5">
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

            <div className="flex items-center gap-3 pt-1 pl-1">
                <button
                    onClick={addLeaf}
                    className="flex items-center gap-1 text-[9px] text-[var(--ey-yellow)] hover:underline font-bold transition-colors"
                >
                    <Plus size={8} /> Condition
                </button>
                {depth < 2 && (
                    <button
                        onClick={addGroup}
                        className="flex items-center gap-1 text-[9px] text-muted-foreground hover:text-foreground font-medium transition-colors"
                    >
                        <Plus size={8} /> Group
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

    const ensureCondition = () => {
        if (!expr) {
            updateExpression({ operator: "AND", rules: [{ variable: "", comparator: "eq", value: "" }] });
        }
    };

    return (
        <NodeFrame
            selected={selected}
            icon={<GitBranch size={16} />}
            title="Condition Logic"
            popoverTitle="Configure Condition"
            summary={expr ? "Condition rules configured" : "No condition configured"}
            showPopover={selected}
            showBottomHandle={false}
            popoverClassName="w-[360px]"
            compactBody={
                <div className="flex flex-col gap-1.5 w-full">
                    <div className="relative bg-background rounded px-2 py-1 text-[10px] font-bold text-foreground border border-[var(--border-dim)] shadow-sm flex items-center">
                        <div className="w-1.5 h-1.5 rounded bg-green-500 mr-2" />
                        <span className="truncate pr-2">Condition Met</span>
                        <Handle
                            type="source"
                            id="yes"
                            position={Position.Right}
                            className="right-[-18px] top-1/2 -translate-y-1/2 h-3 w-3 bg-muted-foreground border-2 border-background hover:bg-green-500 transition-colors"
                        />
                    </div>
                    <div className="relative bg-muted/10 rounded px-2 py-1 flex items-center">
                        <div className="w-1.5 h-1.5 rounded bg-red-500/50 mr-2" />
                        <span className="truncate text-[9px] text-muted-foreground/80 font-medium">Otherwise / No</span>
                        <Handle
                            type="source"
                            id="no"
                            position={Position.Right}
                            className="right-[-18px] top-1/2 -translate-y-1/2 h-3 w-3 bg-muted-foreground/30 border-2 border-background border-dashed hover:bg-red-500 transition-colors"
                        />
                    </div>
                </div>
            }
            popoverBody={
                <>
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
                        <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-[var(--border-dim)] rounded-lg bg-muted/10">
                            <span className="text-[10px] text-muted-foreground mb-3">No condition configured</span>
                            <button
                                onClick={ensureCondition}
                                className="px-3 py-1.5 rounded-md bg-[var(--ey-yellow)] text-black text-[10px] font-bold hover:brightness-95 transition-all"
                            >
                                Add Condition
                            </button>
                        </div>
                    )}

                    <div className="pt-2 border-t border-[var(--border-dim)]">
                        <p className="text-[9px] text-muted-foreground leading-relaxed pr-2">
                            When a user hits this node, if the condition evaluates to <span className="text-green-500 font-bold">True</span>, they follow the <b>Condition Met</b> path. Otherwise, they follow the <b>Otherwise</b> path.
                        </p>
                    </div>
                </>
            }
        />
    );
}
