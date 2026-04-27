(function(){"use strict";const I="anthropic/claude-sonnet-4.6",v=[{id:"anthropic/claude-sonnet-4.6",label:"Claude Sonnet 4.6"},{id:"anthropic/claude-opus-4.7",label:"Claude Opus 4.7"},{id:"anthropic/claude-haiku-4.5",label:"Claude Haiku 4.5"},{id:"openai/gpt-5.5",label:"GPT-5.5"},{id:"openai/gpt-5.4-mini",label:"GPT-5.4 Mini"},{id:"openai/gpt-5.4-nano",label:"GPT-5.4 Nano"},{id:"openai/o3",label:"o3"},{id:"openai/o4-mini",label:"o4-mini"},{id:"google/gemini-3.1-pro-preview",label:"Gemini 3.1 Pro"},{id:"google/gemini-3.1-flash-lite-preview",label:"Gemini 3.1 Flash"},{id:"deepseek/deepseek-v4-pro",label:"DeepSeek V4 Pro"},{id:"deepseek/deepseek-v4-flash",label:"DeepSeek V4 Flash"},{id:"meta-llama/llama-4-maverick",label:"Llama 4 Maverick"},{id:"meta-llama/llama-4-scout",label:"Llama 4 Scout"},{id:"mistralai/mistral-small-2603",label:"Mistral Small"},{id:"x-ai/grok-4.20",label:"Grok 4.20"},{id:"qwen/qwen3.6-plus",label:"Qwen3.6 Plus"}];new Set(v.map(t=>t.id));function P(){const t=typeof window<"u"?window.SYNTEX_CONFIG:void 0;return{apiOrigin:t?.apiOrigin??"https://api.syntexprotocol.com",mountEl:t?.mountEl}}class N{constructor(e){this.config=e}url(e){return`${this.config.apiOrigin}${e}`}async session(){const e=await fetch(this.url("/api/auth/session"),{credentials:"include"});return e.ok?await e.json():{authenticated:!1}}async login(e,a){const n=await fetch(this.url("/api/auth/login"),{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e,password:a})});if(!n.ok){const i=await n.json().catch(()=>({}));throw new Error(i.error??`LOGIN_FAILED (HTTP ${n.status})`)}}async signup(e,a){const n=await fetch(this.url("/api/auth/signup"),{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e,password:a})});if(!n.ok){const i=await n.json().catch(()=>({}));throw new Error(i.error??`SIGNUP_FAILED (HTTP ${n.status})`)}return await n.json()}async logout(){await fetch(this.url("/api/auth/session"),{method:"DELETE",credentials:"include"})}async streamMessage(e){const a=await fetch(this.url("/api/chat/send"),{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)});if(!a.ok){const n=await a.json().catch(()=>({}));throw new Error(n.error??`HTTP_${a.status}`)}if(!a.body)throw new Error("NO_STREAM");return a.body}}const O=`
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
    content: ' █';
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
`;function A(t,e){const a=t.getReader(),n=new TextDecoder;let i="",s=!1,c="",l="";function f(){const u=c,b=l;if(c="",l="",u==="end")return e.onEnd(),!0;if(b)try{e.onData(JSON.parse(b))}catch{}return!1}async function p(){try{for(;!s;){const{value:u,done:b}=await a.read();if(b)break;i+=n.decode(u,{stream:!0});const T=i.split(`
`);i=T.pop()??"";for(const m of T)if(m===""){if(f())return}else m.startsWith("data: ")?l=m.slice(6):m.startsWith("event: ")&&(c=m.slice(7))}e.onEnd()}catch(u){s||e.onError(u)}}return p(),()=>{s=!0,a.cancel().catch(()=>{})}}const y=P(),g=new N(y),o={session:null,authMode:"login",authError:"",busy:!1,messages:[],currentModel:I,streamCleanup:null,pendingInstallUrl:null},x=document.createElement("div");x.setAttribute("data-syntex-widget",""),x.style.cssText="display:flex;flex-direction:column;width:100%;height:100%;";const M=x.attachShadow({mode:"open"}),C=document.createElement("style");C.textContent=O,M.appendChild(C);const h=document.createElement("div");h.style.cssText="display:contents;",M.appendChild(h),(y.mountEl??document.body).appendChild(x);function d(){h.replaceChildren();const t=r("div",{class:"panel",role:"main"});if(!o.session){t.appendChild(w()),t.appendChild(r("div",{class:"messages"},"One moment…")),h.appendChild(t);return}if(!o.session.authenticated){t.appendChild(w()),t.appendChild(D()),h.appendChild(t);return}if(t.appendChild(w(!0)),!o.session.vps)t.appendChild(E("VPS not provisioned — contact support."));else if(o.session.vps.registered)(o.session.credits_cents??0)<=0&&t.appendChild(E("Out of credits — top up to continue."));else{const e=o.pendingInstallUrl?`Paste this into your VPS as root:  curl -fsSL ${y.apiOrigin}${o.pendingInstallUrl} | sudo bash`:"Your VPS has not phoned home yet. Finish the install there first.";t.appendChild(E(e))}t.appendChild(L()),t.appendChild(B()),h.appendChild(t)}function w(t=!1){const e=r("div",{class:"header"}),a=r("div",{class:"header-logo"});if(a.innerHTML="SYNTE<span>X</span>",e.appendChild(a),e.appendChild(r("div",{class:"header-spacer"})),t){const n=r("select",{"aria-label":"Model"});for(const c of v){const l=r("option",{value:c.id},c.label);c.id===o.currentModel&&(l.selected=!0),n.appendChild(l)}n.addEventListener("change",()=>{o.currentModel=n.value}),e.appendChild(n);const i=o.session?.credits_cents??0;e.appendChild(r("div",{class:"header-credits"},`$${(i/100).toFixed(2)}`));const s=r("button",{class:"btn-logout"},"Log out");s.addEventListener("click",async()=>{await g.logout().catch(()=>{}),o.session={authenticated:!1},o.messages=[],d()}),e.appendChild(s)}return e}function E(t,e){return r("div",{class:"status-line warn"},t)}function L(){const t=r("div",{class:"messages"});for(const e of o.messages)t.appendChild(r("div",{class:`msg ${e.role}`},e.text));return queueMicrotask(()=>{t.scrollTop=t.scrollHeight}),t}function B(){const t=r("form",{class:"composer"}),e=r("textarea",{rows:"1",placeholder:"Ask your agent…"});e.addEventListener("keydown",n=>{n.key==="Enter"&&!n.shiftKey&&(n.preventDefault(),t.requestSubmit())});const a=r("button",{type:"submit"},"→");return o.busy&&(a.disabled=!0),t.appendChild(e),t.appendChild(a),t.addEventListener("submit",async n=>{n.preventDefault();const i=e.value.trim();!i||o.busy||(e.value="",await F(i))}),t}function D(){const t=r("form",{class:"auth"}),e=r("div",{class:"auth-inner"});e.appendChild(r("h3",{},o.authMode==="login"?"Sign in":"Create account"));const a=r("input",{type:"email",placeholder:"email",required:"true",autocomplete:"email"}),n=r("input",{type:"password",placeholder:"password (8+ chars)",required:"true",autocomplete:o.authMode==="login"?"current-password":"new-password"}),i=r("div",{class:"err"},o.authError),s=r("button",{type:"submit"},o.authMode==="login"?"Sign in":"Create account"),c=r("button",{type:"button",class:"toggle"},o.authMode==="login"?"No account? Create one":"Already have an account? Sign in");return c.addEventListener("click",()=>{o.authMode=o.authMode==="login"?"signup":"login",o.authError="",d()}),e.appendChild(a),e.appendChild(n),e.appendChild(i),e.appendChild(s),e.appendChild(c),t.appendChild(e),t.addEventListener("submit",async l=>{l.preventDefault(),o.authError="",o.busy=!0,d();try{if(o.authMode==="login")await g.login(a.value,n.value),await k();else{const f=await g.signup(a.value,n.value);o.pendingInstallUrl=f.installUrl,await k()}}catch(f){o.authError=S(f)}finally{o.busy=!1,d()}}),t}async function k(){try{o.session=await g.session()}catch{o.session={authenticated:!1}}o.session.vps?.currentModel&&(o.currentModel=o.session.vps.currentModel),d()}async function F(t){o.messages.push({role:"user",text:t});const e={role:"pending",text:"Thinking…"};o.messages.push(e),o.busy=!0,d();try{const a=await g.streamMessage({message:t,model:o.currentModel});await new Promise(n=>{let i="",s=!1,c=e;const l=p=>{const u=o.messages.indexOf(c);u>=0?o.messages.splice(u,1,p):o.messages.push(p),c=p,s=!0},f=A(a,{onData:p=>{if(p.event!=="chat"&&p.event!=="chat.side_result")return;const u=_(p.payload.message);p.payload.state==="final"&&u?(l({role:"agent",text:u}),d()):p.payload.state==="delta"&&u?(i+=u,l({role:"pending",text:i}),d()):p.payload.state==="error"&&(l({role:"error",text:p.payload.errorMessage??"Agent error"}),d())},onEnd:()=>{s||(l({role:"error",text:"No response received."}),d()),n()},onError:()=>{s||(l({role:"error",text:"Connection lost."}),d()),n()}});o.streamCleanup=f})}catch(a){const n=o.messages.indexOf(e),i={role:"error",text:S(a)};n>=0?o.messages.splice(n,1,i):o.messages.push(i)}finally{o.busy=!1,o.streamCleanup=null,d()}}function _(t){if(typeof t=="string")return t;if(t&&typeof t=="object"){const e=t;if(typeof e.text=="string")return e.text;if(typeof e.content=="string")return e.content;if(Array.isArray(e.content))return e.content.map(a=>typeof a=="string"?a:a&&typeof a=="object"&&"text"in a?String(a.text??""):"").join("")}return""}function S(t){const e=t instanceof Error?t.message:String(t);switch(e){case"INVALID_CREDENTIALS":return"Wrong email or password.";case"EMAIL_TAKEN":return"An account with that email already exists.";case"WEAK_PASSWORD":return"Password must be at least 8 characters.";case"INVALID_EMAIL":return"That email doesn't look right.";case"NO_VPS_REGISTERED":case"VPS_NOT_ONLINE":return"Finish installing Syntex on your VPS first.";case"INSUFFICIENT_CREDITS":return"Out of credits.";default:return e}}function r(t,e={},a){const n=document.createElement(t);for(const[i,s]of Object.entries(e))i==="class"?n.className=s:n.setAttribute(i,s);return typeof a=="string"?n.textContent=a:a&&n.appendChild(a),n}k(),d()})();
//# sourceMappingURL=syntex-widget.js.map
