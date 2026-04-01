import { apiClient } from "@/lib/api-client";
import { HttpRequestPreviewSchema } from "../domain/http-request.schemas";
import type { HttpRequestPreviewInput, HttpRequestPreviewResult } from "../domain/http-request.types";

export const httpRequestPreviewApi = {
  async run(input: HttpRequestPreviewInput): Promise<HttpRequestPreviewResult> {
    const { data } = await apiClient.post("/integrations/http-request/preview", input);
    return HttpRequestPreviewSchema.parse(data);
  },
};
