import {
  ElevenLabsCredentialSchema,
  ElevenLabsModelSchema,
  ElevenLabsTestConnectionSchema,
  ElevenLabsVoiceSchema,
} from './elevenlabs.schemas';
import type {
  ElevenLabsCredential,
  ElevenLabsModel,
  ElevenLabsTestConnectionResult,
  ElevenLabsVoice,
} from './elevenlabs.types';

export function mapElevenLabsCredential(payload: unknown): ElevenLabsCredential {
  return ElevenLabsCredentialSchema.parse(payload);
}

export function mapElevenLabsModel(payload: unknown): ElevenLabsModel {
  return ElevenLabsModelSchema.parse(payload);
}

export function mapElevenLabsVoice(payload: unknown): ElevenLabsVoice {
  return ElevenLabsVoiceSchema.parse(payload);
}

export function mapElevenLabsTest(payload: unknown): ElevenLabsTestConnectionResult {
  return ElevenLabsTestConnectionSchema.parse(payload);
}
