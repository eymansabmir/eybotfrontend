import { z } from "zod";

const InteractionModeSchema = z.enum(["output", "input"]);

const NodeInteractionInputSchema = z.object({
  type: z.enum(["text", "choice"]),
  variableName: z.string().optional(),
  variableScope: z.enum(["session", "contact"]).optional(),
  timeoutSeconds: z.number().optional(),
  options: z
    .array(
      z.object({
        id: z.string(),
        label: z.string().optional(),
        branchKey: z.string(),
      })
    )
    .optional(),
  defaultBranchKey: z.string().optional(),
});

const NodeInteractionSchema = z.object({
  mode: InteractionModeSchema,
  input: NodeInteractionInputSchema.optional(),
});

export const ButtonsNodeSchema = z.object({
  label: z.string().optional(),
  body: z.string().min(1, "Body text is required"),
  footer: z.string().optional(),
  buttons: z
    .array(
      z.object({
        id: z.string(),
        title: z.string().min(1, "Button title is required"),
      })
    )
    .max(3, "WhatsApp supports up to 3 buttons")
    .min(1, "At least one button is required"),
  interaction: NodeInteractionSchema.optional(),
});

export type NodeInteraction = z.infer<typeof NodeInteractionSchema>;
export type ButtonsNodeData = z.infer<typeof ButtonsNodeSchema>;
