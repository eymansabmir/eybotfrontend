/**
 * Frontend mirror of backend NodeType enum (backend/src/schemas/node-types.enum.ts).
 * Keep these values in sync — the schema-integrity test will catch drift.
 */
export const NodeType = {
  START: 'start',
  END: 'end',
  SEND_TEXT: 'send_text',
  SEND_IMAGE: 'send_image',
  SEND_VIDEO: 'send_video',
  SEND_AUDIO: 'send_audio',
  SEND_DOCUMENT: 'send_document',
  SEND_LOCATION: 'send_location',
  SEND_BUTTONS: 'send_buttons',
  SEND_LIST: 'send_list',
  SEND_TEMPLATE: 'send_template',
  LOCATION_REQUEST: 'location_request',
  ASK_QUESTION: 'ask_question',
  CONDITION: 'condition',
  SET_VARIABLE: 'set_variable',
  RANDOM_SPLIT: 'random_split',
  JUMP_TO_FLOW: 'jump_to_flow',
  HUMAN_HANDOFF: 'human_handoff',
  WEBHOOK: 'webhook',
  GOOGLE_SHEETS: 'google_sheets',
  NOCODB: 'nocodb',
  OPENAI: 'openai',
  ELEVENLABS: 'elevenlabs',
} as const;

export type NodeTypeValue = (typeof NodeType)[keyof typeof NodeType];
