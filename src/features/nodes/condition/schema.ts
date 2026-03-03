import { z } from "zod";

export type ConditionExpression =
    | { variable: string; comparator: Comparator; value?: any }
    | { operator: "AND" | "OR"; rules: ConditionExpression[] };

export type Comparator =
    | "eq" | "neq" | "contains" | "not_contains"
    | "gt" | "lt" | "gte" | "lte"
    | "exists" | "not_exists" | "regex";

export const ComparatorSchema = z.enum([
    "eq", "neq", "contains", "not_contains",
    "gt", "lt", "gte", "lte",
    "exists", "not_exists", "regex",
]);

export const LeafRuleSchema = z.object({
    variable: z.string().min(1, "Variable is required"),
    comparator: ComparatorSchema,
    value: z.any().optional(),
});

export const ConditionExpressionSchema: z.ZodType<ConditionExpression> = z.lazy(() =>
    z.union([
        LeafRuleSchema,
        z.object({
            operator: z.enum(["AND", "OR"]),
            rules: z.array(ConditionExpressionSchema),
        }),
    ])
);

export const ConditionNodeSchema = z.object({
    expression: ConditionExpressionSchema,
});

export type ConditionNodeData = z.infer<typeof ConditionNodeSchema>;
