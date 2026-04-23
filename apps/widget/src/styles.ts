export const CSS = `
  /* ── RESET ───────────────────────────────────────── */
  :host {
    all: initial;
    font-family: 'IBM Plex Mono', monospace;
    color: #fff;
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
  @keyframes slideUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }

  /* ── LAUNCHER ────────────────────────────────────── */
  .launcher {
    position: fixed;
    right: 20px;
    bottom: 20px;
    width: 52px;
    height: 52px;
    border-radius: 2px;
    background: #000;
    color: #B8FF00;
    border: 1px solid #2a2a2a;
    cursor: pointer;
    font-size: 0;
    box-shadow: 0 4px 24px rgba(0,0,0,0.7);
    z-index: 2147483647;
    transition: border-color 0.15s, background 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .launcher::after {
    content: 'SX';
    font-family: 'Bebas Neue', sans-serif;
    font-size: 20px;
    color: #B8FF00;
    letter-spacing: 2px;
    line-height: 1;
  }
  .launcher:hover {
    border-color: #B8FF00;
    background: #080808;
  }

  /* ── PANEL ───────────────────────────────────────── */
  .panel {
    position: fixed;
    right: 20px;
    bottom: 84px;
    width: 400px;
    height: min(620px, calc(100vh - 112px));
    background: #000;
    border: 1px solid #2a2a2a;
    border-radius: 2px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.9);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    z-index: 2147483647;
    animation: slideUp 0.22s ease;
    font-family: 'IBM Plex Mono', monospace;
  }
  @media (max-width: 480px) {
    .panel {
      inset: 0;
      width: 100%;
      height: 100%;
      border: none;
      border-radius: 0;
      bottom: 0;
      right: 0;
    }
    .launcher {
      right: 16px;
      bottom: 16px;
    }
  }

  /* ── HEADER ──────────────────────────────────────── */
  .header {
    display: flex;
    align-items: center;
    padding: 12px 14px;
    border-bottom: 1px solid #2a2a2a;
    flex-shrink: 0;
    gap: 10px;
    background: #000;
    min-height: 48px;
  }
  /* Loading title */
  .header > div {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px;
    letter-spacing: 2px;
    color: #B8FF00;
    flex: 1;
    line-height: 1;
    font-weight: normal;
  }
  /* Model selector */
  .header select {
    flex: 1;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 7px 28px 7px 10px;
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
    background-position: right 10px center;
  }
  .header select:focus { border-color: #444; color: #fff; }
  .header select option { background: #1a1a1a; color: #fff; }
  /* Close button */
  .close {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: #444;
    padding: 4px 7px;
    line-height: 1;
    transition: color 0.15s;
    flex-shrink: 0;
    font-family: 'IBM Plex Mono', monospace;
    border-radius: 2px;
  }
  .close:hover { color: #fff; }

  /* ── STATUS LINE ─────────────────────────────────── */
  .status-line {
    padding: 9px 14px;
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
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
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
    padding: 10px 12px 14px;
    border-top: 1px solid #2a2a2a;
    flex-shrink: 0;
    display: flex;
    align-items: flex-end;
    gap: 8px;
    background: #000;
  }
  .composer textarea {
    flex: 1;
    resize: none;
    background: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 2px;
    padding: 8px 10px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12px;
    color: #fff;
    min-height: 36px;
    max-height: 120px;
    line-height: 1.6;
    outline: none;
    transition: border-color 0.15s;
  }
  .composer textarea:focus { border-color: #444; }
  .composer textarea::placeholder { color: #444; }
  .composer button {
    width: 36px;
    height: 36px;
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
    padding: 24px 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex: 1;
    background: #000;
    overflow-y: auto;
  }
  .auth h3 {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 32px;
    letter-spacing: 2px;
    color: #fff;
    line-height: 1;
    font-weight: normal;
    margin-bottom: 4px;
  }
  .auth input {
    padding: 10px 12px;
    background: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 2px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 12px;
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
    padding: 12px;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.15s;
    width: 100%;
    margin-top: 2px;
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
