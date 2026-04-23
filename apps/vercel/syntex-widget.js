(function(){"use strict";const C="anthropic/claude-sonnet-4.6",y=[{id:"anthropic/claude-sonnet-4.6",label:"Claude Sonnet 4.6"},{id:"anthropic/claude-opus-4.7",label:"Claude Opus 4.7"},{id:"anthropic/claude-haiku-4.5",label:"Claude Haiku 4.5"},{id:"openai/gpt-5",label:"GPT-5"},{id:"openai/gpt-5-mini",label:"GPT-5 Mini"},{id:"openai/gpt-5-nano",label:"GPT-5 Nano"},{id:"openai/o3",label:"o3"},{id:"openai/o4-mini",label:"o4-mini"},{id:"google/gemini-2.5-pro",label:"Gemini 2.5 Pro"},{id:"google/gemini-3-flash-preview",label:"Gemini 3 Flash Preview"},{id:"google/gemini-3-pro-preview",label:"Gemini 3 Pro Preview"},{id:"deepseek/deepseek-r1",label:"DeepSeek R1"},{id:"deepseek/deepseek-v3-2",label:"DeepSeek V3.2"},{id:"meta-llama/llama-4-maverick",label:"Llama 4 Maverick"},{id:"meta-llama/llama-4-scout",label:"Llama 4 Scout"},{id:"mistralai/mistral-large",label:"Mistral Large"},{id:"x-ai/grok-4",label:"Grok 4"},{id:"x-ai/grok-4.1-fast",label:"Grok 4.1 Fast"},{id:"x-ai/grok-4.20-beta",label:"Grok 4.20"},{id:"qwen/qwen3-235b-a22b",label:"Qwen3 235B"}];new Set(y.map(o=>o.id));function M(){return{apiOrigin:(typeof window<"u"?window.SYNTEX_CONFIG:void 0)?.apiOrigin??"https://api.syntexprotocol.com"}}class S{constructor(e){this.config=e}url(e){return`${this.config.apiOrigin}${e}`}async session(){const e=await fetch(this.url("/api/auth/session"),{credentials:"include"});return e.ok?await e.json():{authenticated:!1}}async login(e,n){const a=await fetch(this.url("/api/auth/login"),{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e,password:n})});if(!a.ok)throw new Error((await a.json().catch(()=>({}))).error??"LOGIN_FAILED")}async signup(e,n){const a=await fetch(this.url("/api/auth/signup"),{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e,password:n})});if(!a.ok)throw new Error((await a.json().catch(()=>({}))).error??"SIGNUP_FAILED");return await a.json()}async logout(){await fetch(this.url("/api/auth/session"),{method:"DELETE",credentials:"include"})}async sendMessage(e){const n=await fetch(this.url("/api/chat/send"),{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)});if(!n.ok){const a=await n.json().catch(()=>({}));throw new Error(a.error??`HTTP_${n.status}`)}return await n.json()}streamUrl(e){return this.url(`/api/sse/stream?runId=${encodeURIComponent(e)}`)}}const I=`
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
    content: ' █';
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
`;function P(o,e){const n=new EventSource(o,{withCredentials:!0});return n.onmessage=a=>{try{e.onData(JSON.parse(a.data))}catch{}},n.addEventListener("end",()=>{n.close(),e.onEnd()}),n.onerror=a=>{n.close(),e.onError(a)},()=>n.close()}const w=M(),h=new S(w),t={open:!1,session:null,authMode:"login",authError:"",busy:!1,messages:[],currentModel:C,streamCleanup:null,pendingInstallUrl:null},m=document.createElement("div");m.setAttribute("data-syntex-widget","");const k=m.attachShadow({mode:"open"}),E=document.createElement("style");E.textContent=I,k.appendChild(E);const f=document.createElement("div");k.appendChild(f),document.body.appendChild(m);function s(){f.replaceChildren();const o=r("button",{class:"launcher","aria-label":"Open chat"},"💬");if(o.addEventListener("click",()=>{t.open=!t.open,t.open&&!t.session&&g(),s()}),f.appendChild(o),!t.open)return;const e=r("div",{class:"panel",role:"dialog"});if(!t.session){e.appendChild(x("Loading…")),e.appendChild(r("div",{class:"messages"},"One moment…")),f.appendChild(e);return}if(!t.session.authenticated){e.appendChild(x("Syntex")),e.appendChild(T()),f.appendChild(e);return}if(e.appendChild(x("Syntex",!0)),!t.session.vps)e.appendChild(b("VPS not provisioned — contact support."));else if(t.session.vps.registered)(t.session.credits_cents??0)<=0&&e.appendChild(b("Out of credits — top up to continue."));else{const n=t.pendingInstallUrl?`Paste this into your VPS as root:  curl -fsSL ${w.apiOrigin}${t.pendingInstallUrl} | sudo bash`:"Your VPS has not phoned home yet. Finish the install there first.";e.appendChild(b(n))}e.appendChild(L()),e.appendChild(N()),f.appendChild(e)}function x(o,e=!1){const n=r("div",{class:"header"});if(e){const i=r("select",{"aria-label":"Model"});for(const l of y){const p=r("option",{value:l.id},l.label);l.id===t.currentModel&&(p.selected=!0),i.appendChild(p)}i.addEventListener("change",()=>{t.currentModel=i.value}),n.appendChild(i)}else n.appendChild(r("div",{style:"flex:1;font-weight:600;"},o));const a=r("button",{class:"close","aria-label":"Close"},"×");return a.addEventListener("click",()=>{t.open=!1,s()}),n.appendChild(a),n}function b(o,e){return r("div",{class:"status-line warn"},o)}function L(){const o=r("div",{class:"messages"});for(const e of t.messages)o.appendChild(r("div",{class:`msg ${e.role}`},e.text));return queueMicrotask(()=>{o.scrollTop=o.scrollHeight}),o}function N(){const o=r("form",{class:"composer"}),e=r("textarea",{rows:"1",placeholder:"Ask your agent…"});e.addEventListener("keydown",a=>{a.key==="Enter"&&!a.shiftKey&&(a.preventDefault(),o.requestSubmit())});const n=r("button",{type:"submit"},"Send");return t.busy&&(n.disabled=!0),o.appendChild(e),o.appendChild(n),o.addEventListener("submit",async a=>{a.preventDefault();const i=e.value.trim();!i||t.busy||(e.value="",await A(i))}),o}function T(){const o=r("form",{class:"auth"});o.appendChild(r("h3",{},t.authMode==="login"?"Sign in":"Create account"));const e=r("input",{type:"email",placeholder:"email",required:"true",autocomplete:"email"}),n=r("input",{type:"password",placeholder:"password (8+ chars)",required:"true",autocomplete:t.authMode==="login"?"current-password":"new-password"}),a=r("div",{class:"err"},t.authError),i=r("button",{type:"submit"},t.authMode==="login"?"Sign in":"Create account"),l=r("button",{type:"button",class:"toggle"},t.authMode==="login"?"No account? Create one":"Already have an account? Sign in");return l.addEventListener("click",()=>{t.authMode=t.authMode==="login"?"signup":"login",t.authError="",s()}),o.appendChild(e),o.appendChild(n),o.appendChild(a),o.appendChild(i),o.appendChild(l),o.addEventListener("submit",async p=>{p.preventDefault(),t.authError="",t.busy=!0,s();try{if(t.authMode==="login")await h.login(e.value,n.value),await g();else{const c=await h.signup(e.value,n.value);t.pendingInstallUrl=c.installUrl,await g()}}catch(c){t.authError=v(c)}finally{t.busy=!1,s()}}),o}async function g(){try{t.session=await h.session()}catch{t.session={authenticated:!1}}t.session.vps?.currentModel&&(t.currentModel=t.session.vps.currentModel),s()}async function A(o){t.messages.push({role:"user",text:o});const e={role:"pending",text:"Thinking…"};t.messages.push(e),t.busy=!0,s();try{const{runId:n}=await h.sendMessage({message:o,model:t.currentModel}),a=h.streamUrl(n);await new Promise(i=>{let l="",p=!1;const c=d=>{const u=t.messages.indexOf(e);u>=0?t.messages.splice(u,1,d):t.messages.push(d),p=!0},F=P(a,{onData:d=>{if(d.event!=="chat"&&d.event!=="chat.side_result")return;const u=O(d.payload.message);d.payload.state==="final"&&u?(c({role:"agent",text:u}),s()):d.payload.state==="delta"&&u?(l+=u,c({role:"pending",text:l}),s()):d.payload.state==="error"&&(c({role:"error",text:d.payload.errorMessage??"Agent error"}),s())},onEnd:()=>{p||(c({role:"error",text:"No response received."}),s()),i()},onError:()=>{p||(c({role:"error",text:"Connection lost."}),s()),i()}});t.streamCleanup=F})}catch(n){const a=t.messages.indexOf(e),i={role:"error",text:v(n)};a>=0?t.messages.splice(a,1,i):t.messages.push(i)}finally{t.busy=!1,t.streamCleanup=null,s()}}function O(o){if(typeof o=="string")return o;if(o&&typeof o=="object"){const e=o;if(typeof e.text=="string")return e.text;if(typeof e.content=="string")return e.content;if(Array.isArray(e.content))return e.content.map(n=>typeof n=="string"?n:n&&typeof n=="object"&&"text"in n?String(n.text??""):"").join("")}return""}function v(o){const e=o instanceof Error?o.message:String(o);switch(e){case"INVALID_CREDENTIALS":return"Wrong email or password.";case"EMAIL_TAKEN":return"An account with that email already exists.";case"WEAK_PASSWORD":return"Password must be at least 8 characters.";case"INVALID_EMAIL":return"That email doesn't look right.";case"NO_VPS_REGISTERED":case"VPS_NOT_ONLINE":return"Finish installing Syntex on your VPS first.";case"INSUFFICIENT_CREDITS":return"Out of credits.";default:return e}}function r(o,e={},n){const a=document.createElement(o);for(const[i,l]of Object.entries(e))i==="class"?a.className=l:a.setAttribute(i,l);return typeof n=="string"?a.textContent=n:n&&a.appendChild(n),a}g(),s()})();
//# sourceMappingURL=syntex-widget.js.map
