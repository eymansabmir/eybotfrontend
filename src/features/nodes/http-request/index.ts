import type { NodeDefinition } from "../types";

import { HttpRequestNodeConfig } from "./config";
import { HttpRequestNodeHandler } from "./handler";
import { HttpRequestNodeRenderer } from "./renderer";
import { HttpRequestNodeSchema, type HttpRequestNodeData } from "./schema";

import { isValidUrlOrVariable } from "../utils";

export const httpRequestNode: NodeDefinition<HttpRequestNodeData> = {
  config: HttpRequestNodeConfig,
  schema: HttpRequestNodeSchema,
  renderer: HttpRequestNodeRenderer,
  handler: HttpRequestNodeHandler,
  defaultData: {
    url: "",
    method: "GET",
    headers: {},
    queryParams: {},
    body: "",
    timeoutMs: 15000,
    fallbackText: "",
    responseMapping: [],
    credentialId: "",
    proxyCredentialsId: "",
  },
  defaultBranches: [{ key: "default", label: "Default" }],
  validate: (data) => {
    const errors: string[] = [];
    if (!data.url) {
        errors.push("URL is required");
    } else if (data.url.includes("example.com")) {
        errors.push("Replace placeholder URL with your real endpoint");
    } else if (!isValidUrlOrVariable(data.url)) {
        errors.push("URL must be a full address or variable");
    }

    if (!data.method) {
        errors.push("HTTP method is required");
    }

    return errors.length > 0 ? errors : null;
  },
};

export * from "./config";
export * from "./schema";
