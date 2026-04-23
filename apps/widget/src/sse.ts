export interface StreamEventData {
  event: "chat" | "chat.side_result";
  payload: {
    runId: string;
    sessionKey: string;
    seq: number;
    state: "delta" | "final" | "aborted" | "error";
    message?: unknown;
    errorMessage?: string;
  };
}

export function openStream(
  url: string,
  opts: {
    onData: (d: StreamEventData) => void;
    onEnd: () => void;
    onError: (err: Event) => void;
  },
): () => void {
  const src = new EventSource(url, { withCredentials: true });
  src.onmessage = (e) => {
    try {
      opts.onData(JSON.parse(e.data) as StreamEventData);
    } catch {
      /* ignore malformed frames */
    }
  };
  src.addEventListener("end", () => {
    src.close();
    opts.onEnd();
  });
  src.onerror = (err) => {
    src.close();
    opts.onError(err);
  };
  return () => src.close();
}
