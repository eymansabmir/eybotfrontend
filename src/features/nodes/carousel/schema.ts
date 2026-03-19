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

export const CarouselNodeSchema = z.object({
  bodyText: z.string().max(1024).optional(),
  cards: z.array(
    z.object({
      headerType: z.enum(['image', 'video']),
      url: z.string().url("Must be a valid URL"),
      bodyText: z.string().max(160, "Card body text must be 160 characters or less").optional(),
      buttonType: z.enum(['cta_url', 'quick_reply']).optional(),
      ctaUrlButton: z.object({
        displayText: z.string().max(20, "Display text must be 20 characters or less"),
        url: z.string().url("Must be a valid URL"),
      }).optional(),
      quickReplyButtons: z.array(
        z.object({
          id: z.string(),
          title: z.string().max(20, "Button title must be 20 characters or less"),
        })
      ).max(2, "Max 2 quick reply buttons per card").optional(),
    })
  ).min(1, "At least one card is required").max(10, "Max 10 cards allowed"),
  interaction: NodeInteractionSchema.optional(),
});

export type CarouselNodeData = z.infer<typeof CarouselNodeSchema>;
