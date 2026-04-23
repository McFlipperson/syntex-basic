import type { RequestFrame, ResponseFrame } from "./frames.js";

export interface SessionsPatchParams {
  key: string;
  label?: string | null;
  model?: string | null;
  thinkingLevel?: string | null;
}

export type SessionsPatchRequest = RequestFrame<"sessions.patch", SessionsPatchParams>;
export type SessionsPatchResponse = ResponseFrame<{ key: string }>;

export interface SessionsCreateParams {
  key?: string;
  agentId?: string;
  label?: string;
  model?: string;
  parentSessionKey?: string;
  task?: string;
  message?: string;
}

export type SessionsCreateRequest = RequestFrame<"sessions.create", SessionsCreateParams>;
export type SessionsCreateResponse = ResponseFrame<{ key: string }>;
