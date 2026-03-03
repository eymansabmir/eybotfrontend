import { apiClient } from "@/lib/api-client";

export interface StartFlowInput {
  orgId: string;
  flowId: string;
  waId: string;
  waBusinessNumber: string;
  contactName?: string;
  initialVariables?: Record<string, any>;
}

export interface ResumeFlowInput {
  userInput: string;
}

export interface ChatSession {
  _id: string;
  flowId: string;
  flowVersion: number;
  waId: string;
  waBusinessNumber: string;
  status: "active" | "waiting" | "completed" | "timed_out" | "error";
  currentNodeId: string;
  variables: Record<string, any>;
  history: Array<{
    nodeId: string;
    nodeType: string;
    enteredAt: string;
    exitedAt?: string;
    branchTaken?: string;
    userInput?: string;
  }>;
  waitingFor?: {
    type: "user_input";
    variableName: string;
    variableScope: "session" | "contact";
    since: string;
    timeoutAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OutboundMessage {
  type: string;
  payload: Record<string, any>;
}

export interface StartFlowResult {
  session: ChatSession;
  outboundMessages: OutboundMessage[];
  isFinished: boolean;
  waitingFor?: ChatSession["waitingFor"];
}

export const chatSessionApi = {
  startFlow: async (input: StartFlowInput): Promise<StartFlowResult> => {
    const { data } = await apiClient.post<StartFlowResult>("/chat-sessions", input);
    return data;
  },

  resumeFlow: async (sessionId: string, input: ResumeFlowInput): Promise<StartFlowResult> => {
    const { data } = await apiClient.post<StartFlowResult>(`/chat-sessions/${sessionId}/resume`, input);
    return data;
  },

  getSession: async (sessionId: string): Promise<ChatSession> => {
    const { data } = await apiClient.get<ChatSession>(`/chat-sessions/${sessionId}`);
    return data;
  },
};
