export interface StreamEventData {
  event: "chat" | "chat.side_result" | "error";
  payload: {
    runId?: string;
    sessionKey?: string;
    seq?: number;
    state: "delta" | "final" | "aborted" | "error";
    message?: unknown;
    errorMessage?: string;
  };
}

/**
 * Reads a fetch() response body as an SSE stream.
 * Used because EventSource only supports GET; our chat endpoint is POST.
 */
export function readStream(
  stream: ReadableStream<Uint8Array>,
  opts: {
    onData: (d: StreamEventData) => void;
    onEnd: () => void;
    onError: (err: unknown) => void;
  },
): () => void {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let cancelled = false;
  let currentEvent = "";
  let currentData = "";

  function dispatch(): boolean {
    const ev = currentEvent;
    const data = currentData;
    currentEvent = "";
    currentData = "";
    if (ev === "end") {
      opts.onEnd();
      return true;
    }
    if (data) {
      try {
        opts.onData(JSON.parse(data) as StreamEventData);
      } catch { /* ignore malformed frames */ }
    }
    return false;
  }

  async function pump() {
    try {
      while (!cancelled) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (line === "") {
            if (dispatch()) return;
          } else if (line.startsWith("data: ")) {
            currentData = line.slice(6);
          } else if (line.startsWith("event: ")) {
            currentEvent = line.slice(7);
          }
          // lines starting with ":" are keepalive comments — ignore
        }
      }
      opts.onEnd();
    } catch (err) {
      if (!cancelled) opts.onError(err);
    }
  }

  void pump();
  return () => {
    cancelled = true;
    reader.cancel().catch(() => {});
  };
}
