import { MODEL_OPTIONS, DEFAULT_MODEL_ID } from "@syntex/protocol";
import { resolveConfig } from "./config.js";
import { SyntexApi, type SessionState } from "./api.js";
import { CSS } from "./styles.js";
import { readStream } from "./sse.js";

type ChatMsg =
  | { role: "user"; text: string }
  | { role: "agent"; text: string }
  | { role: "error"; text: string }
  | { role: "pending"; text: string };

interface State {
  open: boolean;
  session: SessionState | null;
  authMode: "login" | "signup";
  authError: string;
  busy: boolean;
  messages: ChatMsg[];
  currentModel: string;
  streamCleanup: (() => void) | null;
  pendingInstallUrl: string | null;
}

const config = resolveConfig();
const api = new SyntexApi(config);

const state: State = {
  open: false,
  session: null,
  authMode: "login",
  authError: "",
  busy: false,
  messages: [],
  currentModel: DEFAULT_MODEL_ID,
  streamCleanup: null,
  pendingInstallUrl: null,
};

const host = document.createElement("div");
host.setAttribute("data-syntex-widget", "");
const shadow = host.attachShadow({ mode: "open" });
const style = document.createElement("style");
style.textContent = CSS;
shadow.appendChild(style);
const root = document.createElement("div");
shadow.appendChild(root);
document.body.appendChild(host);

function render(): void {
  root.replaceChildren();

  const launcher = el("button", { class: "launcher", "aria-label": "Open chat" }, "💬");
  launcher.addEventListener("click", () => {
    state.open = !state.open;
    if (state.open && !state.session) {
      void refreshSession();
    }
    render();
  });
  root.appendChild(launcher);

  if (!state.open) return;

  const panel = el("div", { class: "panel", role: "dialog" });

  if (!state.session) {
    panel.appendChild(renderHeader("Loading…"));
    panel.appendChild(el("div", { class: "messages" }, "One moment…"));
    root.appendChild(panel);
    return;
  }

  if (!state.session.authenticated) {
    panel.appendChild(renderHeader("Syntex"));
    panel.appendChild(renderAuth());
    root.appendChild(panel);
    return;
  }

  panel.appendChild(renderHeader("Syntex", true));
  if (!state.session.vps) {
    panel.appendChild(renderStatus("VPS not provisioned — contact support.", true));
  } else if (!state.session.vps.registered) {
    const msg = state.pendingInstallUrl
      ? `Paste this into your VPS as root:  curl -fsSL ${config.apiOrigin}${state.pendingInstallUrl} | sudo bash`
      : "Your VPS has not phoned home yet. Finish the install there first.";
    panel.appendChild(renderStatus(msg, true));
  } else if ((state.session.credits_cents ?? 0) <= 0) {
    panel.appendChild(renderStatus("Out of credits — top up to continue.", true));
  }

  panel.appendChild(renderMessages());
  panel.appendChild(renderComposer());
  root.appendChild(panel);
}

function renderHeader(title: string, showModelPicker = false): HTMLElement {
  const header = el("div", { class: "header" });
  if (showModelPicker) {
    const select = el("select", { "aria-label": "Model" }) as HTMLSelectElement;
    for (const m of MODEL_OPTIONS) {
      const opt = el("option", { value: m.id }, m.label) as HTMLOptionElement;
      if (m.id === state.currentModel) opt.selected = true;
      select.appendChild(opt);
    }
    select.addEventListener("change", () => {
      state.currentModel = select.value;
    });
    header.appendChild(select);
  } else {
    header.appendChild(el("div", { style: "flex:1;font-weight:600;" }, title));
  }
  const close = el("button", { class: "close", "aria-label": "Close" }, "×");
  close.addEventListener("click", () => {
    state.open = false;
    render();
  });
  header.appendChild(close);
  return header;
}

function renderStatus(text: string, warn: boolean): HTMLElement {
  return el("div", { class: `status-line ${warn ? "warn" : ""}` }, text);
}

function renderMessages(): HTMLElement {
  const list = el("div", { class: "messages" });
  for (const m of state.messages) {
    list.appendChild(el("div", { class: `msg ${m.role}` }, m.text));
  }
  queueMicrotask(() => {
    list.scrollTop = list.scrollHeight;
  });
  return list;
}

function renderComposer(): HTMLElement {
  const form = el("form", { class: "composer" }) as HTMLFormElement;
  const ta = el("textarea", {
    rows: "1",
    placeholder: "Ask your agent…",
  }) as HTMLTextAreaElement;
  ta.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form.requestSubmit();
    }
  });
  const btn = el("button", { type: "submit" }, "Send") as HTMLButtonElement;
  if (state.busy) btn.disabled = true;
  form.appendChild(ta);
  form.appendChild(btn);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = ta.value.trim();
    if (!text || state.busy) return;
    ta.value = "";
    await sendMessage(text);
  });
  return form;
}

function renderAuth(): HTMLElement {
  const wrap = el("form", { class: "auth" });
  wrap.appendChild(
    el("h3", {}, state.authMode === "login" ? "Sign in" : "Create account"),
  );
  const email = el("input", {
    type: "email",
    placeholder: "email",
    required: "true",
    autocomplete: "email",
  }) as HTMLInputElement;
  const pwd = el("input", {
    type: "password",
    placeholder: "password (8+ chars)",
    required: "true",
    autocomplete: state.authMode === "login" ? "current-password" : "new-password",
  }) as HTMLInputElement;
  const err = el("div", { class: "err" }, state.authError);
  const submit = el(
    "button",
    { type: "submit" },
    state.authMode === "login" ? "Sign in" : "Create account",
  );
  const toggle = el(
    "button",
    { type: "button", class: "toggle" },
    state.authMode === "login"
      ? "No account? Create one"
      : "Already have an account? Sign in",
  );
  toggle.addEventListener("click", () => {
    state.authMode = state.authMode === "login" ? "signup" : "login";
    state.authError = "";
    render();
  });
  wrap.appendChild(email);
  wrap.appendChild(pwd);
  wrap.appendChild(err);
  wrap.appendChild(submit);
  wrap.appendChild(toggle);
  wrap.addEventListener("submit", async (e) => {
    e.preventDefault();
    state.authError = "";
    state.busy = true;
    render();
    try {
      if (state.authMode === "login") {
        await api.login(email.value, pwd.value);
        await refreshSession();
      } else {
        const result = await api.signup(email.value, pwd.value);
        state.pendingInstallUrl = result.installUrl;
        await refreshSession();
      }
    } catch (err) {
      state.authError = humanError(err);
    } finally {
      state.busy = false;
      render();
    }
  });
  return wrap;
}

async function refreshSession(): Promise<void> {
  try {
    state.session = await api.session();
  } catch {
    state.session = { authenticated: false };
  }
  if (state.session.vps?.currentModel) {
    state.currentModel = state.session.vps.currentModel;
  }
  render();
}

async function sendMessage(text: string): Promise<void> {
  state.messages.push({ role: "user", text });
  const pending: ChatMsg = { role: "pending", text: "Thinking…" };
  state.messages.push(pending);
  state.busy = true;
  render();

  try {
    const stream = await api.streamMessage({
      message: text,
      model: state.currentModel,
    });
    await new Promise<void>((resolve) => {
      let bufferedText = "";
      let replaced = false;
      let liveMsg: ChatMsg = pending;
      const swap = (msg: ChatMsg) => {
        const idx = state.messages.indexOf(liveMsg);
        if (idx >= 0) state.messages.splice(idx, 1, msg);
        else state.messages.push(msg);
        liveMsg = msg;
        replaced = true;
      };
      const cleanup = readStream(stream, {
        onData: (d) => {
          if (d.event !== "chat" && d.event !== "chat.side_result") return;
          const msgBody = extractText(d.payload.message);
          if (d.payload.state === "final" && msgBody) {
            swap({ role: "agent", text: msgBody });
            render();
          } else if (d.payload.state === "delta" && msgBody) {
            bufferedText += msgBody;
            swap({ role: "pending", text: bufferedText });
            render();
          } else if (d.payload.state === "error") {
            swap({ role: "error", text: d.payload.errorMessage ?? "Agent error" });
            render();
          }
        },
        onEnd: () => {
          if (!replaced) {
            swap({ role: "error", text: "No response received." });
            render();
          }
          resolve();
        },
        onError: () => {
          if (!replaced) {
            swap({ role: "error", text: "Connection lost." });
            render();
          }
          resolve();
        },
      });
      state.streamCleanup = cleanup;
    });
  } catch (err) {
    const idx = state.messages.indexOf(pending);
    const errMsg: ChatMsg = { role: "error", text: humanError(err) };
    if (idx >= 0) state.messages.splice(idx, 1, errMsg);
    else state.messages.push(errMsg);
  } finally {
    state.busy = false;
    state.streamCleanup = null;
    render();
  }
}

function extractText(message: unknown): string {
  if (typeof message === "string") return message;
  if (message && typeof message === "object") {
    const m = message as { content?: unknown; text?: unknown };
    if (typeof m.text === "string") return m.text;
    if (typeof m.content === "string") return m.content;
    if (Array.isArray(m.content)) {
      return m.content
        .map((part) => {
          if (typeof part === "string") return part;
          if (part && typeof part === "object" && "text" in part) {
            return String((part as { text: unknown }).text ?? "");
          }
          return "";
        })
        .join("");
    }
  }
  return "";
}

function humanError(err: unknown): string {
  const code = err instanceof Error ? err.message : String(err);
  switch (code) {
    case "INVALID_CREDENTIALS":
      return "Wrong email or password.";
    case "EMAIL_TAKEN":
      return "An account with that email already exists.";
    case "WEAK_PASSWORD":
      return "Password must be at least 8 characters.";
    case "INVALID_EMAIL":
      return "That email doesn't look right.";
    case "NO_VPS_REGISTERED":
    case "VPS_NOT_ONLINE":
      return "Finish installing Syntex on your VPS first.";
    case "INSUFFICIENT_CREDITS":
      return "Out of credits.";
    default:
      return code;
  }
}

function el(
  tag: string,
  attrs: Record<string, string> = {},
  textOrChild?: string | Node,
): HTMLElement {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else node.setAttribute(k, v);
  }
  if (typeof textOrChild === "string") node.textContent = textOrChild;
  else if (textOrChild) node.appendChild(textOrChild);
  return node;
}

void refreshSession();
render();
