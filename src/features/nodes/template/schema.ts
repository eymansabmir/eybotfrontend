import { z } from "zod";

export const TemplateParameterSchema = z.discriminatedUnion("type", [
    z.object({ type: z.literal("text"), text: z.string() }),
    z.object({
        type: z.literal("currency"),
        currency: z.object({ fallback_value: z.string(), code: z.string(), amount_1000: z.number() })
    }),
    z.object({ type: z.literal("date_time"), date_time: z.object({ fallback_value: z.string() }) }),
    z.object({ type: z.literal("image"), image: z.object({ link: z.string().optional(), id: z.string().optional() }) }),
    z.object({ type: z.literal("document"), document: z.object({ link: z.string().optional(), id: z.string().optional(), filename: z.string().optional() }) }),
    z.object({ type: z.literal("video"), video: z.object({ link: z.string().optional(), id: z.string().optional() }) }),
    z.object({ type: z.literal("location"), location: z.object({ latitude: z.number(), longitude: z.number(), name: z.string().optional(), address: z.string().optional() }) }),
]);

export const TemplateButtonParameterSchema = z.object({
    type: z.enum(["payload", "text", "coupon_code"]),
    payload: z.string().optional(),
    text: z.string().optional(),
    coupon_code: z.string().optional(),
});

export const TemplateComponentSchema = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("header"),
        parameters: z.array(TemplateParameterSchema).optional(),
    }),
    z.object({
        type: z.literal("body"),
        parameters: z.array(TemplateParameterSchema).optional(),
    }),
    z.object({
        type: z.literal("button"),
        sub_type: z.enum(["quick_reply", "url", "button"]),
        index: z.number(),
        parameters: z.array(TemplateButtonParameterSchema),
    }),
]);

export const TemplateNodeSchema = z.object({
    templateName: z.string().min(1, "Template name is required"),
    languageCode: z.string().min(1, "Language code is required").default("en_US"),
    components: z.array(TemplateComponentSchema).optional(),
});

export type TemplateNodeData = z.infer<typeof TemplateNodeSchema>;
export type TemplateComponent = z.infer<typeof TemplateComponentSchema>;
export type TemplateParameter = z.infer<typeof TemplateParameterSchema>;
export type TemplateButtonParameter = z.infer<typeof TemplateButtonParameterSchema>;
