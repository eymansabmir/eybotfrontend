import { z } from "zod";

export const VariableAssignmentSchema = z.object({
    variable: z.string().min(1, "Variable name is required"),
    type: z.enum([
        "value", 
        "variable", 
        "system", 
        "clear", 
        "random_number", 
        "random_string", 
        "date", 
        "expression"
    ]).default("value"),
    value: z.string().optional(),
    systemVariable: z.string().optional(),
    scope: z.enum(["session", "contact"]).default("session"),
});

export const SetVariableNodeSchema = z.object({
    assignments: z.array(VariableAssignmentSchema).min(1, "At least one assignment is required"),
});

export type VariableAssignment = z.infer<typeof VariableAssignmentSchema>;
export type SetVariableNodeData = z.infer<typeof SetVariableNodeSchema>;
