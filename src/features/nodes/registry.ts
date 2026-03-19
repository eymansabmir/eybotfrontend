import { textNode } from "./text";
import { imageNode } from "./image";
import { videoNode } from "./video";
import { audioNode } from "./audio";
import { documentNode } from "./document";
import { locationNode } from "./location";
import { locationRequestNode } from "./location-request";
import { buttonsNode } from "./buttons";
import { listNode } from "./list";
import { templateNode } from "./template";
import { conditionNode } from "./condition";
import { setVariableNode } from "./set-variable";
import { randomSplitNode } from "./random-split";
import { startNode } from "./start";
import { inputNode } from "./input";
import { fileNode } from "./file";
import { carouselNode } from "./carousel";
import { endNode } from "./end";
import { openAINode } from "./openai";
import type { NodeDefinition } from "./types";

export const nodeRegistry: Record<string, NodeDefinition> = {
    [startNode.config.type]: startNode,
    [textNode.config.type]: textNode,
    [imageNode.config.type]: imageNode,
    [videoNode.config.type]: videoNode,
    [audioNode.config.type]: audioNode,
    [documentNode.config.type]: documentNode,
    [locationNode.config.type]: locationNode,
    [locationRequestNode.config.type]: locationRequestNode,
    [buttonsNode.config.type]: buttonsNode,
    [listNode.config.type]: listNode,
    [templateNode.config.type]: templateNode,
    [conditionNode.config.type]: conditionNode,
    [setVariableNode.config.type]: setVariableNode,
    [randomSplitNode.config.type]: randomSplitNode,
    [inputNode.config.type]: inputNode,
    [fileNode.config.type]: fileNode,
    [carouselNode.config.type]: carouselNode,
    [endNode.config.type]: endNode,
    [openAINode.config.type]: openAINode,
};

export const nodeTypes = Object.entries(nodeRegistry).reduce(
    (acc, [type, definition]) => ({
        ...acc,
        [type]: definition.renderer,
    }),
    {}
);

export const getNodeDefinition = (type: string) => nodeRegistry[type];
