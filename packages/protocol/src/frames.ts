export const PROTOCOL_VERSION = 3;

export type FrameType = "req" | "res" | "event" | "hello-ok";

export interface RequestFrame<M extends string = string, P = unknown> {
  type: "req";
  id: string;
  method: M;
  params: P;
}

export interface ResponseFrame<P = unknown> {
  type: "res";
  id: string;
  ok: boolean;
  payload?: P;
  error?: ErrorShape;
}

export interface EventFrame<E extends string = string, P = unknown> {
  type: "event";
  event: E;
  payload: P;
}

export interface HelloOkFrame {
  type: "hello-ok";
  protocol: number;
  server?: {
    name?: string;
    version?: string;
  };
  features?: Record<string, unknown>;
  session?: {
    id?: string;
  };
  auth?: Record<string, unknown>;
}

export interface ErrorShape {
  code: string;
  message: string;
  details?: unknown;
}

export interface ConnectChallengePayload {
  nonce: string;
  ts: number;
}

export type ConnectChallengeEvent = EventFrame<"connect.challenge", ConnectChallengePayload>;

export type GatewayClientMode = "webchat" | "cli" | "ui" | "backend" | "node" | "probe" | "test";

export type GatewayRole = "operator" | "node";

export type GatewayScope = "operator.read" | "operator.write" | (string & {});

export interface ConnectParams {
  minProtocol: number;
  maxProtocol: number;
  client: {
    id: string;
    displayName?: string;
    version: string;
    platform: string;
    deviceFamily?: string;
    mode: GatewayClientMode;
    instanceId?: string;
  };
  role?: GatewayRole;
  scopes?: GatewayScope[];
  auth?: {
    token?: string;
    bootstrapToken?: string;
    deviceToken?: string;
    password?: string;
  };
  caps?: string[];
  locale?: string;
  userAgent?: string;
}

export type ConnectRequest = RequestFrame<"connect", ConnectParams>;

export type AnyFrame =
  | RequestFrame
  | ResponseFrame
  | EventFrame
  | HelloOkFrame;
