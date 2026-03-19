import { apiClient } from "@/lib/api-client";

import {
  ElevenLabsCredentialsListSchema,
  ElevenLabsModelsListSchema,
  ElevenLabsCredentialSchema,
  ElevenLabsTestConnectionSchema,
  ElevenLabsVoicesListSchema,
} from "../domain/elevenlabs.schemas";
import type { CreateElevenLabsCredentialInput } from "../domain/elevenlabs.types";

export async function listElevenLabsCredentials(orgId: string) {
  const response = await apiClient.get("/integrations/credentials", {
    params: {
      orgId,
      type: "ELEVENLABS",
      includeInactive: true,
      includeRevoked: true,
    },
  });

  return ElevenLabsCredentialsListSchema.parse(response.data);
}

export async function createElevenLabsCredential(input: CreateElevenLabsCredentialInput) {
  const response = await apiClient.post("/integrations/credentials", {
    orgId: input.orgId,
    name: input.name,
    type: "ELEVENLABS",
    secret: {
      apiKey: input.apiKey,
      ...(input.baseUrl ? { baseUrl: input.baseUrl } : {}),
    },
    metadata: {
      ...(input.baseUrl ? { baseUrl: input.baseUrl } : {}),
    },
    isActive: true,
  });

  return ElevenLabsCredentialSchema.parse(response.data);
}

export async function testElevenLabsCredential(orgId: string, credentialId: string) {
  const response = await apiClient.post(`/integrations/elevenlabs/credentials/${credentialId}/test`, { orgId });

  return ElevenLabsTestConnectionSchema.parse(response.data);
}

export async function listElevenLabsModels(orgId: string, credentialId: string) {
  console.log("STEP 2: Action received", {
    action: "listElevenLabsModels",
    orgId,
    credentialId,
  });
  const response = await apiClient.get("/integrations/elevenlabs/models", {
    params: { orgId, credentialId },
  });

  return ElevenLabsModelsListSchema.parse(response.data);
}

export async function listElevenLabsVoices(orgId: string, credentialId: string) {
  console.log("STEP 2: Action received", {
    action: "listElevenLabsVoices",
    orgId,
    credentialId,
  });
  const response = await apiClient.get("/integrations/elevenlabs/voices", {
    params: { orgId, credentialId },
  });

  return ElevenLabsVoicesListSchema.parse(response.data);
}
