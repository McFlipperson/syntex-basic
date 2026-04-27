export const CSS = `
  /* ── RESET ───────────────────────────────────────── */
  :host {
    all: initial;
    font-family: 'IBM Plex Mono', monospace;
    color: #fff;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
  }
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  /* ── SCROLLBARS ──────────────────────────────────── */
  * {
    scrollbar-width: thin;
    scrollbar-color: #2a2a2a transparent;
  }
  *::-webkit-scrollbar { width: 3px; }
  *::-webkit-scrollbar-track { background: transparent; }
  *::-webkit-scrollbar-thumb { background: #2a2a2a; }

  /* ── ANIMATIONS ──────────────────────────────────── */
  @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:0.3} }
  @keyframes fadeIn   { from{opacity:0} to{opacity:1} }

  /* ── PANEL (fills host) ──────────────────────────── */
  .panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: #000;
    font-family: 'IBM Plex Mono', monospace;
    animation: fadeIn 0.18s ease;
  }

  /* ── HEADER ──────────────────────────────────────── */
  .header {
    display: flex;
    align-items: center;
    padding: 0 16px;
    border-bottom: 1px solid #2a2a2a;
    flex-shrink: 0;
    gap: 12px;
    background: #000;
    height: 52px;
  }
  .header-logo {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 26px;
    letter-spacing: 0.05em;
    color: #fff;
    line-height: 1;
    font-weight: normal;
    flex-shrink: 0;
  }
  .header-logo span { color: #B8FF00; }
  .header-spacer { flex: 1; }
  .header select {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 6px 26px 6px 10px;
    background: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 2px;
    color: #888;
    cursor: pointer;
    outline: none;
    transition: border-color 0.15s, color 0.15s;
    appearance: none;
    -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='5' viewBox='0 0 8 5'%3E%3Cpath d='M0 0l4 5 4-5z' fill='%23888'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 9px center;
    max-width: 220px;
  }
  @media (max-width: 480px) { .header select { max-width: 150px; } }
  .header select:focus { border-color: #444; color: #fff; }
  .header select option { background: #1a1a1a; color: #fff; }
  .header-credits {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.08em;
    color: #444;
    flex-shrink: 0;
  }
  @media (max-width: 480px) { .header-credits { display: none; } }
  .btn-logout {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #444;
    background: none;
    border: 1px solid #2a2a2a;
    border-radius: 2px;
    padding: 6px 12px;
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s;
    flex-shrink: 0;
  }
  .btn-logout:hover { color: #fff; border-color: #444; }

  /* ── STATUS LINE ─────────────────────────────────── */
  .status-line {
    padding: 9px 16px;
    font-size: 10px;
    letter-spacing: 0.06em;
    color: #888;
    background: #1a1a1a;
    border-bottom: 1px solid #2a2a2a;
    flex-shrink: 0;
    font-family: 'IBM Plex Mono', monospace;
    line-height: 1.6;
  }
  .status-line.warn {
    color: #F59E0B;
    background: rgba(245,158,11,0.04);
    border-bottom-color: rgba(245,158,11,0.25);
  }
  .status-line a { color: inherit; font-weight: 700; text-decoration: underline; }

  /* ── MESSAGES ────────────────────────────────────── */
  .messages {
    flex: 1;
    overflow-y: auto;
    padding: 20px 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  /* Center content on wide screens */
  @media (min-width: 700px) {
    .messages { padding: 24px max(16px, calc(50% - 360px)); }
    .composer  { padding: 10px max(16px, calc(50% - 360px)) 16px; }
  }
  .msg {
    max-width: 82%;
    padding: 10px 13px;
    font-size: 12px;
    line-height: 1.7;
    border-radius: 2px;
    white-space: pre-wrap;
    word-wrap: break-word;
    font-family: 'IBM Plex Mono', monospace;
  }
  @media (min-width: 700px) {
    .msg { font-size: 13px; max-width: 72%; }
  }
  .msg.agent {
    align-self: flex-start;
    background: #1a1a1a;
    color: #fff;
    border-left: 2px solid #2a2a2a;
  }
  .msg.user {
    align-self: flex-end;
    background: #2a2a2a;
    color: #fff;
  }
  .msg.error {
    align-self: flex-start;
    background: #1a1a1a;
    color: #EF4444;
    border-left: 2px solid #EF4444;
  }
  .msg.pending {
    align-self: flex-start;
    background: #1a1a1a;
    color: #888;
    border-left: 2px solid #2a2a2a;
    font-style: italic;
  }
  .msg.pending::after {
    content: ' \u2588';
    font-style: normal;
    color: #B8FF00;
    animation: pulse 1.2s ease-in-out infinite;
  }

  /* ── COMPOSER ────────────────────────────────────── */
  .composer {
    padding: 10px 16px 16px;
    border-top: 1px solid #2a2a2a;
    flex-shrink: 0;
    display: flex;
    align-items: flex-end;
    gap: 8px;
    background: #000;
  }
  /* safe-area padding for iOS home indicator */
  @supports (padding-bottom: env(safe-area-inset-bottom)) {
    .composer { padding-bottom: max(16px, env(safe-area-inset-bottom)); }
  }
  .composer textarea {
    flex: 1;
    resize: none;
    background: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 2px;
    padding: 10px 12px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 13px;
    color: #fff;
    min-height: 40px;
    max-height: 140px;
    line-height: 1.6;
    outline: none;
    transition: border-color 0.15s;
  }
  .composer textarea:focus { border-color: #444; }
  .composer textarea::placeholder { color: #444; }
  .composer button {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    background: #B8FF00;
    color: #000;
    border: none;
    border-radius: 2px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .composer button:hover { background: #a0e600; }
  .composer button:disabled {
    background: #2a2a2a;
    color: #444;
    cursor: not-allowed;
  }

  /* ── AUTH ────────────────────────────────────────── */
  .auth {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px 24px;
    background: #000;
    overflow-y: auto;
  }
  .auth-inner {
    width: 100%;
    max-width: 360px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .auth h3 {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 36px;
    letter-spacing: 2px;
    color: #fff;
    line-height: 1;
    font-weight: normal;
    margin-bottom: 8px;
  }
  .auth input {
    padding: 12px 14px;
    background: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 2px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 13px;
    color: #fff;
    outline: none;
    transition: border-color 0.15s;
    width: 100%;
  }
  .auth input:focus { border-color: #444; }
  .auth input::placeholder { color: #444; }
  .auth button[type="submit"] {
    background: #B8FF00;
    color: #000;
    border: none;
    border-radius: 2px;
    padding: 13px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.15s;
    width: 100%;
    margin-top: 4px;
  }
  .auth button[type="submit"]:hover { background: #a0e600; }
  .auth .toggle {
    background: none;
    border: none;
    color: #444;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.06em;
    text-align: center;
    cursor: pointer;
    padding: 4px 0;
    text-decoration: underline;
    text-underline-offset: 3px;
    transition: color 0.15s;
    width: 100%;
  }
  .auth .toggle:hover { color: #888; }
  .auth .err {
    color: #EF4444;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.04em;
    min-height: 14px;
    line-height: 1.5;
  }
`;
