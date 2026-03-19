import type { NodeDefinition } from "../types";

import { HttpRequestNodeConfig } from "./config";
import { HttpRequestNodeHandler } from "./handler";
import { HttpRequestNodeRenderer } from "./renderer";
import { HttpRequestNodeSchema, type HttpRequestNodeData } from "./schema";

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
    responseMapping: [],
    credentialId: "",
    proxyCredentialsId: "",
  },
  defaultBranches: [{ key: "default", label: "Default" }],
};

export * from "./config";
export * from "./schema";
