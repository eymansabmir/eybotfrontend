import type { Node } from "@xyflow/react";

import { NodeType } from "@/features/nodes/node-types.constants";
import { hasValidOpenAIChatCompletionInput } from "@/features/integrations/openai/domain/chat-completion-validation";
import { isValidAssistantThreadIdInput } from "@/features/integrations/openai/domain/assistant-thread-id-validation";

const NODE_LABELS: Record<string, string> = {
    [NodeType.SEND_TEXT]: "Text",
    [NodeType.SEND_IMAGE]: "Image",
    [NodeType.SEND_VIDEO]: "Video",
    [NodeType.SEND_AUDIO]: "Audio",
    [NodeType.SEND_DOCUMENT]: "Document",
    [NodeType.SEND_LOCATION]: "Location",
    [NodeType.SEND_BUTTONS]: "Buttons",
    [NodeType.SEND_LIST]: "List",
    [NodeType.SEND_TEMPLATE]: "Template",
    [NodeType.SEND_STICKER]: "Sticker",
    [NodeType.SEND_CAROUSEL]: "Carousel",
    [NodeType.LOCATION_REQUEST]: "Location Request",
    [NodeType.ASK_QUESTION]: "Question",
    [NodeType.ASK_FILE]: "File Request",
    [NodeType.NPS]: "Rating",
    [NodeType.SEND_CARDS]: "Cards",
    [NodeType.SEND_REACTION]: "Reaction",
    [NodeType.CONDITION]: "Condition",
    [NodeType.SET_VARIABLE]: "Set Variable",
    [NodeType.RANDOM_SPLIT]: "Random Split",
    [NodeType.START]: "Start",
    [NodeType.END]: "End",
    [NodeType.JUMP_TO_FLOW]: "Jump to Flow",
    [NodeType.HUMAN_HANDOFF]: "Human Handoff",
    [NodeType.WEBHOOK]: "Webhook",
    [NodeType.HTTP_REQUEST]: "HTTP Request",
    [NodeType.GOOGLE_SHEETS]: "Google Sheets",
    [NodeType.NOCODB]: "NocoDB",
    [NodeType.LANGUAGE]: "Language",
    [NodeType.OPENAI]: "OpenAI",
    [NodeType.ELEVENLABS]: "ElevenLabs",
    [NodeType.ANTHROPIC]: "Anthropic",
    [NodeType.DEEPSEEK]: "DeepSeek",
    [NodeType.VARIABLE_MANAGER]: "Variable Manager",
    [NodeType.MEDIA_CONDITIONAL]: "Media Conditional",
};

const isPlaceholderUrl = (url: string) => {
    const normalized = url.trim().toLowerCase();
    return normalized === "https://api.example.com"
        || normalized === "http://api.example.com"
        || normalized === "https://example.com"
        || normalized === "http://example.com"
        || normalized.includes("example.com");
};

const isNonEmptyString = (val: unknown) => typeof val === "string" && val.trim().length > 0;

const hasItems = (val: unknown) => Array.isArray(val) && val.length > 0;

const hasPromptOrMessages = (data: Record<string, unknown>) => {
    if (isNonEmptyString(data["prompt"])) return true;
    const messages = data["messages"] as Array<{ content?: string }> | undefined;
    return Array.isArray(messages) && messages.some((m) => isNonEmptyString(m?.content));
};

const isValidUrlOrVariable = (val: unknown) => {
    if (!isNonEmptyString(val)) return false;
    const str = (val as string).trim();
    if (str.includes("{{") && str.includes("}}")) return true;
    try {
        new URL(str);
        return true;
    } catch {
        // Allow relative storage paths (e.g. "uploads/abc.pdf")
        return str.includes("/") && !str.includes(" ");
    }
};

export const getFlowValidationErrors = (nodes: Node[]): string[] => {
    const errors: string[] = [];

    for (const node of nodes) {
        const nodeData = node.data as Record<string, unknown>;
        const nodeTitle = typeof nodeData["label"] === "string" && nodeData["label"].trim().length > 0
            ? nodeData["label"].trim()
            : NODE_LABELS[node.type ?? ""] ?? "Node";
        let hasNodeError = false;
        const pushNodeError = (message: string) => {
            if (hasNodeError) return;
            errors.push(message);
            hasNodeError = true;
        };

        // Check for specific validation errors persisted in the node data (e.g. from media URL checks)
        if (typeof nodeData["validationError"] === "string" && nodeData["validationError"].length > 0) {
            pushNodeError(`${nodeTitle} node: ${nodeData["validationError"]}`);
        }

        if (node.type === NodeType.SEND_TEXT) {
            const message = typeof nodeData["message"] === "string" ? nodeData["message"].trim() : "";
            if (!message) {
                pushNodeError(`${nodeTitle} node: message cannot be empty.`);
            }
        }

        if (
            node.type === NodeType.SEND_IMAGE
            || node.type === NodeType.SEND_VIDEO
            || node.type === NodeType.SEND_AUDIO
            || node.type === NodeType.SEND_DOCUMENT
            || node.type === NodeType.SEND_STICKER
        ) {
            const url = nodeData["url"];
            const mediaId = nodeData["mediaId"];
            if (!isValidUrlOrVariable(url) && !isNonEmptyString(mediaId)) {
                pushNodeError(`${nodeTitle} node: provide a valid URL, variable, or uploaded media.`);
            }
        }

        if (node.type === NodeType.SEND_BUTTONS) {
            const body = nodeData["body"];
            const buttons = nodeData["buttons"];
            if (!isNonEmptyString(body)) {
                pushNodeError(`${nodeTitle} node: add button text.`);
            }
            if (!hasItems(buttons)) {
                pushNodeError(`${nodeTitle} node: add at least one button.`);
            }
        }

        if (node.type === NodeType.SEND_LIST) {
            const body = nodeData["body"];
            const buttonTitle = nodeData["buttonTitle"];
            const sections = nodeData["sections"] as Array<{ rows?: Array<{ id: string }> }> | undefined;
            const hasRows = Array.isArray(sections)
                && sections.some((section) => Array.isArray(section.rows) && section.rows.length > 0);

            if (!isNonEmptyString(body)) {
                pushNodeError(`${nodeTitle} node: add list message text.`);
            }
            if (!isNonEmptyString(buttonTitle)) {
                pushNodeError(`${nodeTitle} node: add a list button title.`);
            }
            if (!hasRows) {
                pushNodeError(`${nodeTitle} node: add at least one list option.`);
            }
        }

        if (node.type === NodeType.SEND_CARDS) {
            const items = nodeData["items"] as Array<{ title?: string; description?: string; imageUrl?: string; buttons?: Array<{ text?: string }> }> | undefined;
            if (!hasItems(items)) {
                pushNodeError(`${nodeTitle} node: add at least one card.`);
            } else {
                const hasContent = items!.some((item) => isNonEmptyString(item?.title)
                    || isNonEmptyString(item?.description)
                    || isNonEmptyString(item?.imageUrl));
                if (!hasContent) {
                    pushNodeError(`${nodeTitle} node: add a title, description, or image to a card.`);
                } else {
                    const hasButton = items!.some((item) => Array.isArray(item.buttons)
                        && item.buttons.some((btn) => isNonEmptyString(btn?.text)));
                    if (!hasButton) {
                        pushNodeError(`${nodeTitle} node: add at least one button to a card.`);
                    }
                }
            }
        }

        if (node.type === NodeType.SEND_CAROUSEL) {
            const cards = nodeData["cards"] as Array<{
                url?: string;
                buttonType?: string;
                ctaUrlButton?: { displayText?: string; url?: string };
                quickReplyButtons?: Array<{ title?: string }>;
            }> | undefined;
            if (!hasItems(cards)) {
                pushNodeError(`${nodeTitle} node: add at least one carousel card.`);
            } else if (cards!.some((card) => !isValidUrlOrVariable(card?.url))) {
                pushNodeError(`${nodeTitle} node: each carousel card needs a valid media URL.`);
            } else if (cards!.some((card) => typeof card?.url === "string" && isPlaceholderUrl(card.url))) {
                pushNodeError(`${nodeTitle} node: replace placeholder media URLs with real ones.`);
            } else if (cards!.some((card) => card?.buttonType === "cta_url" && (!isNonEmptyString(card?.ctaUrlButton?.displayText) || !isValidUrlOrVariable(card?.ctaUrlButton?.url)))) {
                pushNodeError(`${nodeTitle} node: add a valid CTA button label and URL.`);
            } else if (cards!.some((card) => card?.buttonType === "quick_reply" && !hasItems(card?.quickReplyButtons))) {
                pushNodeError(`${nodeTitle} node: add at least one quick reply button.`);
            }
        }

        if (node.type === NodeType.SEND_TEMPLATE) {
            const templateName = nodeData["templateName"];
            const languageCode = nodeData["languageCode"];
            if (!isNonEmptyString(templateName)) {
                pushNodeError(`${nodeTitle} node: select a template name.`);
            }
            if (!isNonEmptyString(languageCode)) {
                pushNodeError(`${nodeTitle} node: select a language.`);
            }
        }

        if (node.type === NodeType.SEND_LOCATION) {
            const latitude = nodeData["latitude"];
            const longitude = nodeData["longitude"];
            const validLatitude = typeof latitude === "number" && !Number.isNaN(latitude) && latitude >= -90 && latitude <= 90;
            const validLongitude = typeof longitude === "number" && !Number.isNaN(longitude) && longitude >= -180 && longitude <= 180;
            if (!validLatitude || !validLongitude) {
                pushNodeError(`${nodeTitle} node: add a valid latitude and longitude.`);
            }
        }

        if (node.type === NodeType.LOCATION_REQUEST) {
            const message = nodeData["message"];
            const variablePrefix = nodeData["variablePrefix"];
            if (!isNonEmptyString(message)) {
                pushNodeError(`${nodeTitle} node: add a request message.`);
            }
            if (!isNonEmptyString(variablePrefix)) {
                pushNodeError(`${nodeTitle} node: add a variable prefix.`);
            }
        }

        if (node.type === NodeType.ASK_QUESTION) {
            const question = nodeData["question"] ?? nodeData["message"];
            const variableName = nodeData["variable"] ?? nodeData["variableName"];
            if (!isNonEmptyString(question)) {
                pushNodeError(`${nodeTitle} node: add a question.`);
            }
            if (!isNonEmptyString(variableName)) {
                pushNodeError(`${nodeTitle} node: add a variable name to store the answer.`);
            }
        }

        if (node.type === NodeType.ASK_FILE) {
            const message = nodeData["message"];
            const variableName = nodeData["variable"] ?? nodeData["variableName"];
            if (!isNonEmptyString(message)) {
                pushNodeError(`${nodeTitle} node: add a file request message.`);
            }
            if (!isNonEmptyString(variableName)) {
                pushNodeError(`${nodeTitle} node: add a variable name to store the file URL.`);
            }
        }

        if (node.type === NodeType.RANDOM_SPLIT) {
            const branches = nodeData["branches"] as Array<{ percentage?: number }> | undefined;
            if (!hasItems(branches) || (branches?.length ?? 0) < 2) {
                pushNodeError(`${nodeTitle} node: add at least two branches.`);
            } else {
                const total = branches!.reduce((sum, branch) => sum + (branch?.percentage ?? 0), 0);
                if (Math.abs(total - 100) > 0.01) {
                    pushNodeError(`${nodeTitle} node: percentages must add up to 100%.`);
                }
            }
        }

        if (node.type === NodeType.NPS) {
            const message = nodeData["message"];
            const variableName = nodeData["variable"] ?? nodeData["variableName"];
            if (!isNonEmptyString(message)) {
                pushNodeError(`${nodeTitle} node: add a rating prompt.`);
            }
            if (!isNonEmptyString(variableName)) {
                pushNodeError(`${nodeTitle} node: add a variable name to store the rating.`);
            }
        }

        if (node.type === NodeType.LANGUAGE) {
            const message = nodeData["message"];
            const languages = nodeData["languages"];
            if (!isNonEmptyString(message)) {
                pushNodeError(`${nodeTitle} node: add a language prompt.`);
            }
            if (!hasItems(languages)) {
                pushNodeError(`${nodeTitle} node: add at least one language.`);
            }
        }

        if (hasNodeError) {
            continue;
        }

        if (
            node.type !== NodeType.OPENAI
            && node.type !== NodeType.ELEVENLABS
            && node.type !== NodeType.GOOGLE_SHEETS
            && node.type !== NodeType.HTTP_REQUEST
            && node.type !== NodeType.NOCODB
            && node.type !== NodeType.ANTHROPIC
            && node.type !== NodeType.DEEPSEEK
        ) {
            continue;
        }

        if (node.type === NodeType.HTTP_REQUEST) {
            const url = typeof nodeData["url"] === "string" ? nodeData["url"].trim() : "";
            const method = typeof nodeData["method"] === "string" ? nodeData["method"].trim() : "";

            if (!url) {
                pushNodeError(`${nodeTitle} node: enter a URL to call.`);
            } else if (isPlaceholderUrl(url)) {
                pushNodeError(`${nodeTitle} node: replace the placeholder URL with your real endpoint.`);
            } else if (!isValidUrlOrVariable(url)) {
                pushNodeError(`${nodeTitle} node: URL must be a full address or a variable.`);
            }

            if (!method) {
                pushNodeError(`${nodeTitle} node: choose an HTTP method (GET, POST, etc.).`);
            }

            continue;
        }

        if (node.type === NodeType.ELEVENLABS) {
            if (!nodeData["credentialId"] || !nodeData["voiceId"] || !nodeData["text"] || !nodeData["resultVariable"]) {
                pushNodeError(`${nodeTitle} node: select a credential, voice, message text, and result variable.`);
            }
            continue;
        }

        if (node.type === NodeType.GOOGLE_SHEETS) {
            const action = (nodeData["action"] as string | undefined) ?? "insert_row";
            const hasValues = typeof nodeData["values"] === "object" && nodeData["values"] !== null && Object.keys(nodeData["values"] as Record<string, unknown>).length > 0;

            if (!nodeData["credentialId"] || !nodeData["spreadsheetId"] || !nodeData["sheetId"]) {
                pushNodeError(`${nodeTitle} node: select a credential, spreadsheet, and worksheet.`);
            }

            if (action === "insert_row") {
                if (!hasValues) {
                    pushNodeError(`${nodeTitle} node: add at least one column value to insert.`);
                }
                continue;
            }

            if (action === "update_row") {
                const rowId = nodeData["rowId"];
                const validRowId = typeof rowId === "number" && Number.isInteger(rowId) && rowId > 0;
                if (!validRowId || !hasValues) {
                    pushNodeError(`${nodeTitle} node: add a row ID and at least one value to update.`);
                }
            }

            continue;
        }

        if (node.type === NodeType.NOCODB) {
            const action = (nodeData["action"] as string | undefined) ?? "create_record";
            const hasFields = hasItems(nodeData["fields"]);
            const hasFilter = isNonEmptyString(nodeData["filter"])
                || hasItems(nodeData["filterConditions"]);
            const hasTable = isNonEmptyString(nodeData["tableId"]) || isNonEmptyString(nodeData["tableName"]);

            if (!nodeData["credentialId"]) {
                pushNodeError(`${nodeTitle} node: select a NocoDB credential.`);
            } else if (!hasTable) {
                pushNodeError(`${nodeTitle} node: select a table.`);
            } else if (action === "create_record" && !hasFields) {
                pushNodeError(`${nodeTitle} node: add at least one field value.`);
            } else if (action === "update_record") {
                if (!hasFields) {
                    pushNodeError(`${nodeTitle} node: add at least one field value.`);
                } else if (!hasFilter) {
                    pushNodeError(`${nodeTitle} node: add a filter or condition to update records.`);
                }
            } else if (action === "search_records" && !hasFilter) {
                pushNodeError(`${nodeTitle} node: add a filter or condition to search.`);
            }

            continue;
        }

        if (node.type === NodeType.ANTHROPIC || node.type === NodeType.DEEPSEEK) {
            const mode = (nodeData["mode"] as string | undefined) ?? "chat_completion";

            if (!nodeData["credentialId"]) {
                pushNodeError(`${nodeTitle} node: select a credential.`);
            } else if (!nodeData["model"]) {
                pushNodeError(`${nodeTitle} node: choose a model.`);
            } else if (mode === "generate_variables") {
                const vars = Array.isArray(nodeData["variablesToExtract"])
                    ? (nodeData["variablesToExtract"] as unknown[])
                    : [];
                if (!hasPromptOrMessages(nodeData) || vars.length === 0) {
                    pushNodeError(`${nodeTitle} node: add a prompt and at least one variable to extract.`);
                }
            } else if (!hasPromptOrMessages(nodeData)) {
                pushNodeError(`${nodeTitle} node: add a prompt or message.`);
            }

            continue;
        }

        const mode = (nodeData["mode"] as string | undefined) ?? "chat_completion";
        const voiceAction = (nodeData["voiceAction"] as string | undefined) ?? "create_speech";

        if (!nodeData["credentialId"]) {
            pushNodeError(`${nodeTitle} node: select an OpenAI credential.`);
        }

        if (mode !== "assistant" && !nodeData["model"]) {
            pushNodeError(`${nodeTitle} node: choose a model for ${mode.replace("_", " ")} mode.`);
        }

        if (mode === "chat_completion") {
            if (!hasValidOpenAIChatCompletionInput({
                messages: nodeData["messages"],
            })) {
                pushNodeError(`${nodeTitle} node: add at least one message for chat completion.`);
            }
            continue;
        }

        if (mode === "voice" && voiceAction === "create_speech") {
            if (!nodeData["prompt"] || !nodeData["voice"]) {
                pushNodeError(`${nodeTitle} node: add message text and select a voice.`);
            }
            continue;
        }

        if (mode === "voice" && voiceAction === "create_transcription") {
            if (!nodeData["audioUrl"] && !nodeData["prompt"]) {
                pushNodeError(`${nodeTitle} node: provide an audio URL or a transcription prompt.`);
            }
            continue;
        }

        if (mode === "assistant") {
            if (!nodeData["assistantId"] || !nodeData["prompt"]) {
                pushNodeError(`${nodeTitle} node: add an assistant ID and a message.`);
            }

            if (!isValidAssistantThreadIdInput(nodeData["threadId"])) {
                pushNodeError(`${nodeTitle} node: thread ID must use {{session.key}} or {{contact.key}}.`);
            }

            continue;
        }

        if (mode === "generate_variables") {
            const vars = Array.isArray(nodeData["variablesToExtract"])
                ? (nodeData["variablesToExtract"] as unknown[])
                : [];
            if (!nodeData["prompt"] || vars.length === 0) {
                pushNodeError(`${nodeTitle} node: add a prompt and at least one variable to extract.`);
            }
            continue;
        }

        if (mode === "image") {
            if (!nodeData["prompt"]) {
                pushNodeError(`${nodeTitle} node: add a prompt for image generation.`);
            }
        }
    }

    return errors;
};
