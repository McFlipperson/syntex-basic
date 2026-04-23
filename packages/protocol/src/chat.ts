import type { EventFrame, RequestFrame, ResponseFrame } from "./frames.js";

export interface ChatSendParams {
  sessionKey: string;
  message: string;
  idempotencyKey: string;
  deliver?: boolean;
  thinking?: string;
  attachments?: unknown[];
  timeoutMs?: number;
}

export interface ChatSendAck {
  runId: string;
  status: "started" | "in_flight";
}

export type ChatSendRequest = RequestFrame<"chat.send", ChatSendParams>;
export type ChatSendResponse = ResponseFrame<ChatSendAck>;

export type ChatEventState = "delta" | "final" | "aborted" | "error";

export type ChatErrorKind =
  | "refusal"
  | "timeout"
  | "rate_limit"
  | "context_length"
  | "unknown";

export interface ChatEventPayload {
  runId: string;
  sessionKey: string;
  seq: number;
  state: ChatEventState;
  message?: unknown;
  errorMessage?: string;
  errorKind?: ChatErrorKind;
  usage?: unknown;
  stopReason?: string;
}

export type ChatEvent = EventFrame<"chat", ChatEventPayload>;
export type ChatSideResultEvent = EventFrame<"chat.side_result", ChatEventPayload>;

export interface ChatAbortParams {
  sessionKey: string;
  runId?: string;
  idempotencyKey: string;
}

export type ChatAbortRequest = RequestFrame<"chat.abort", ChatAbortParams>;
