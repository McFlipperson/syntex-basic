import { randomUUID } from "node:crypto";
import WebSocket from "ws";
import {
  PROTOCOL_VERSION,
  type AnyFrame,
  type ChatSendParams,
  type ConnectParams,
  type EventFrame,
  type RequestFrame,
  type ResponseFrame,
  type SessionsPatchParams,
} from "@syntex/protocol";

export interface OcConnectionConfig {
  url: string;
  token: string;
  clientId: string;
}

type PendingResolver = (res: ResponseFrame) => void;
type EventHandler = (frame: EventFrame) => void;

export class OcClient {
  private ws: WebSocket | null = null;
  private readonly config: OcConnectionConfig;
  private readonly pending = new Map<string, PendingResolver>();
  private onEvent: EventHandler | null = null;
  private helloResolved = false;

  constructor(config: OcConnectionConfig) {
    this.config = config;
  }

  async connect(opts: { onEvent?: EventHandler } = {}): Promise<void> {
    this.onEvent = opts.onEvent ?? null;
    const ws = new WebSocket(this.config.url, {
      handshakeTimeout: 10_000,
      perMessageDeflate: false,
    });
    this.ws = ws;

    await new Promise<void>((resolve, reject) => {
      const onError = (err: Error) => {
        cleanup();
        reject(err);
      };
      const onOpen = () => {
        cleanup();
        resolve();
      };
      const cleanup = () => {
        ws.off("error", onError);
        ws.off("open", onOpen);
      };
      ws.once("error", onError);
      ws.once("open", onOpen);
    });

    ws.on("message", (raw) => this.handleFrame(raw.toString("utf8")));
    ws.on("error", () => {
      /* surface via pending timeouts */
    });

    await this.handshake();
  }

  private handleFrame(raw: string): void {
    let frame: AnyFrame;
    try {
      frame = JSON.parse(raw) as AnyFrame;
    } catch {
      return;
    }
    if (frame.type === "hello-ok") {
      this.helloResolved = true;
      return;
    }
    if (frame.type === "res") {
      const resolver = this.pending.get(frame.id);
      if (resolver) {
        this.pending.delete(frame.id);
        resolver(frame);
      }
      return;
    }
    if (frame.type === "event") {
      if (frame.event === "connect.challenge") return;
      this.onEvent?.(frame);
    }
  }

  private async handshake(): Promise<void> {
    const params: ConnectParams = {
      minProtocol: PROTOCOL_VERSION,
      maxProtocol: PROTOCOL_VERSION,
      client: {
        id: this.config.clientId,
        version: "1.0.0",
        platform: "vercel",
        mode: "operator",
      },
      role: "operator",
      scopes: ["operator.read", "operator.write"],
      auth: { token: this.config.token },
    };
    const frame: RequestFrame<"connect", ConnectParams> = {
      type: "req",
      id: randomUUID(),
      method: "connect",
      params,
    };
    this.send(frame);
    const deadline = Date.now() + 10_000;
    while (!this.helloResolved) {
      if (Date.now() > deadline) throw new Error("HELLO_TIMEOUT");
      await new Promise((r) => setTimeout(r, 25));
    }
  }

  private send(frame: AnyFrame): void {
    const ws = this.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      throw new Error("WS_NOT_OPEN");
    }
    ws.send(JSON.stringify(frame));
  }

  async request<M extends string, P, R>(
    method: M,
    params: P,
    opts: { timeoutMs?: number } = {},
  ): Promise<R> {
    const id = randomUUID();
    const frame: RequestFrame<M, P> = { type: "req", id, method, params };
    const timeoutMs = opts.timeoutMs ?? 30_000;
    const res = await new Promise<ResponseFrame>((resolve, reject) => {
      const t = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`REQ_TIMEOUT:${method}`));
      }, timeoutMs);
      this.pending.set(id, (frame) => {
        clearTimeout(t);
        resolve(frame);
      });
      try {
        this.send(frame);
      } catch (err) {
        clearTimeout(t);
        this.pending.delete(id);
        reject(err);
      }
    });
    if (!res.ok) {
      throw new Error(`OC_ERROR:${method}:${JSON.stringify(res.error)}`);
    }
    return res.payload as R;
  }

  async chatSend(params: ChatSendParams): Promise<{ runId: string; status: string }> {
    return this.request("chat.send", params);
  }

  async sessionsPatch(params: SessionsPatchParams): Promise<{ key: string }> {
    return this.request("sessions.patch", params);
  }

  close(): void {
    this.ws?.close();
    this.ws = null;
  }
}
