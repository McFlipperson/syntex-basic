import type { IncomingMessage, ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { applyCors, json, readJsonBody } from "../../lib/http.js";
import { requireUser } from "../../lib/auth.js";
import { getVpsRegistration, setCurrentModel } from "../../lib/db.js";
import { OcClient } from "../../lib/oc-client.js";
import { pushChatEvent } from "../../lib/redis.js";
import { MODEL_IDS } from "@syntex/protocol";

interface Body {
  message?: string;
  model?: string;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (applyCors(req, res)) return;
  if (req.method !== "POST") return json(res, 405, { error: "METHOD_NOT_ALLOWED" });

  const user = await requireUser(req, res);
  if (!user) return;

  const body = await readJsonBody<Body>(req).catch(() => ({}) as Body);
  const message = (body.message ?? "").trim();
  if (!message) return json(res, 400, { error: "EMPTY_MESSAGE" });

  const reg = await getVpsRegistration(user.id);
  if (!reg) return json(res, 412, { error: "NO_VPS_REGISTERED" });
  if (!reg.registered_at) return json(res, 412, { error: "VPS_NOT_ONLINE" });

  const nextModel = body.model && MODEL_IDS.has(body.model) ? body.model : null;
  const sessionKey = `agent:main:${user.id}`;

  const client = new OcClient({
    url: `wss://${reg.tunnel_hostname}/ws`,
    token: reg.gateway_token,
    clientId: `syntex-vercel-${user.id.slice(0, 8)}`,
  });

  const runIdHolder: { runId: string | null } = { runId: null };
  const finishedHolder: { finished: boolean } = { finished: false };

  let finalize: () => void = () => {};
  const completion = new Promise<void>((resolve) => {
    finalize = () => {
      if (!finishedHolder.finished) {
        finishedHolder.finished = true;
        resolve();
      }
    };
  });

  await client.connect({
    onEvent: async (frame) => {
      if (frame.event !== "chat" && frame.event !== "chat.side_result") return;
      const payload = frame.payload as {
        runId: string;
        state: string;
      };
      if (runIdHolder.runId && payload.runId !== runIdHolder.runId) return;
      await pushChatEvent(user.id, payload.runId, {
        event: frame.event,
        payload: frame.payload,
      });
      if (payload.state === "final" || payload.state === "error" || payload.state === "aborted") {
        finalize();
      }
    },
  });

  try {
    if (nextModel && nextModel !== reg.current_model) {
      await client.sessionsPatch({ key: sessionKey, model: nextModel });
      await setCurrentModel(user.id, nextModel);
    }

    const ack = await client.chatSend({
      sessionKey,
      message,
      idempotencyKey: randomUUID(),
      deliver: false,
    });
    runIdHolder.runId = ack.runId;

    // Respond to the browser immediately; the SSE stream for this runId will carry the reply.
    json(res, 200, { runId: ack.runId });

    const timeout = setTimeout(finalize, 55_000);
    await completion;
    clearTimeout(timeout);
  } catch (err) {
    if (!res.writableEnded) {
      json(res, 502, { error: "OC_UPSTREAM_FAILURE", detail: String(err) });
    }
  } finally {
    client.close();
  }
}
