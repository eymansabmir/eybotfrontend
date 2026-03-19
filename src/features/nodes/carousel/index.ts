import type { NodeDefinition } from "../types";
import { CarouselNodeConfig } from "./config";
import type { CarouselNodeData } from "./schema";
import { CarouselNodeSchema } from "./schema";
import { CarouselNodeRenderer } from "./renderer";
import { CarouselNodeHandler } from "./handler";

export const carouselNode: NodeDefinition<CarouselNodeData> = {
    config: CarouselNodeConfig,
    schema: CarouselNodeSchema,
    renderer: CarouselNodeRenderer,
    handler: CarouselNodeHandler,
    defaultData: {
        bodyText: 'Choose an option below:',
        cards: [
            {
                headerType: 'image' as const,
                url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop',
                bodyText: 'Check out our first option!',
                buttonType: 'cta_url' as const,
                ctaUrlButton: {
                    displayText: 'Visit Site',
                    url: 'https://example.com'
                }
            },
            {
                headerType: 'image' as const,
                url: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=1000&auto=format&fit=crop',
                bodyText: 'Check out our second option!',
                buttonType: 'cta_url' as const,
                ctaUrlButton: {
                    displayText: 'Visit Site',
                    url: 'https://example.com'
                }
            }
        ],
        interaction: {
            mode: 'input',
            input: {
                type: 'choice',
                timeoutSeconds: 3600,
            },
        },
    },
    defaultBranches: [
        { key: 'timeout', label: 'Timeout' },
    ],
};

export * from "./schema";
export * from "./config";
