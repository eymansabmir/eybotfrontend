import { z } from "zod";

export const LocationNodeSchema = z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    name: z.string().optional(),
    address: z.string().optional(),
});

export type LocationNodeData = z.infer<typeof LocationNodeSchema>;
