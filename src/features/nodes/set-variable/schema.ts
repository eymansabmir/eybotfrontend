import { z } from "zod";

export const VariableAssignmentSchema = z.object({
    variable: z.string().min(1, "Variable name is required"),
    value: z.string().min(1, "Value is required"),
    scope: z.enum(["session", "contact"]),
});

export const SetVariableNodeSchema = z.object({
    assignments: z.array(VariableAssignmentSchema).min(1, "At least one assignment is required"),
});

export type VariableAssignment = z.infer<typeof VariableAssignmentSchema>;
export type SetVariableNodeData = z.infer<typeof SetVariableNodeSchema>;
