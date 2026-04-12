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
import { stickerNode } from "./sticker";
import { npsNode } from "./nps";
import { cardsNode } from "./cards";
import { openAINode } from "./openai";
import { elevenLabsNode } from "./elevenlabs";
import { httpRequestNode } from "./http-request";
import { languageNode } from "./language";
import { googleSheetsNode } from "./google-sheets";
import { nocodbNode } from "./nocodb";
import { anthropicNode } from "./anthropic";
import { deepseekNode } from "./deepseek";
import { variableManagerNode } from "./variable-manager";
import { MediaConditionalNode } from "./media-conditional";
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
    [stickerNode.config.type]: stickerNode,
    [npsNode.config.type]: npsNode,
    [cardsNode.config.type]: cardsNode,
    [openAINode.config.type]: openAINode,
    [elevenLabsNode.config.type]: elevenLabsNode,
    [httpRequestNode.config.type]: httpRequestNode,
    [languageNode.config.type]: languageNode,
    [googleSheetsNode.config.type]: googleSheetsNode,
    [nocodbNode.config.type]: nocodbNode,
    [anthropicNode.config.type]: anthropicNode,
    [deepseekNode.config.type]: deepseekNode,
    [variableManagerNode.config.type]: variableManagerNode,
    [MediaConditionalNode.config.type]: MediaConditionalNode,
};

export const nodeTypes = Object.entries(nodeRegistry).reduce(
    (acc, [type, definition]) => ({
        ...acc,
        [type]: definition.renderer,
    }),
    {}
);

export const getNodeDefinition = (type: string) => nodeRegistry[type];
