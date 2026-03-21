import { z } from "zod";

export const StickerNodeSchema = z.object({
    url: z.string().min(1, "Sticker file path or URL is required"),
    mediaId: z.string().optional(),
});

export type StickerNodeData = z.infer<typeof StickerNodeSchema>;
