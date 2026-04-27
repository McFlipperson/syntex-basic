(function(){"use strict";const I="anthropic/claude-sonnet-4.6",k=[{id:"anthropic/claude-sonnet-4.6",label:"Claude Sonnet 4.6"},{id:"anthropic/claude-opus-4.7",label:"Claude Opus 4.7"},{id:"anthropic/claude-haiku-4.5",label:"Claude Haiku 4.5"},{id:"openai/gpt-5.5",label:"GPT-5.5"},{id:"openai/gpt-5.4-mini",label:"GPT-5.4 Mini"},{id:"openai/gpt-5.4-nano",label:"GPT-5.4 Nano"},{id:"openai/o3",label:"o3"},{id:"openai/o4-mini",label:"o4-mini"},{id:"google/gemini-3.1-pro-preview",label:"Gemini 3.1 Pro"},{id:"google/gemini-3.1-flash-lite-preview",label:"Gemini 3.1 Flash"},{id:"deepseek/deepseek-v4-pro",label:"DeepSeek V4 Pro"},{id:"deepseek/deepseek-v4-flash",label:"DeepSeek V4 Flash"},{id:"meta-llama/llama-4-maverick",label:"Llama 4 Maverick"},{id:"meta-llama/llama-4-scout",label:"Llama 4 Scout"},{id:"mistralai/mistral-small-2603",label:"Mistral Small"},{id:"x-ai/grok-4.20",label:"Grok 4.20"},{id:"qwen/qwen3.6-plus",label:"Qwen3.6 Plus"}];new Set(k.map(e=>e.id));function P(){const e=typeof window<"u"?window.SYNTEX_CONFIG:void 0;return{apiOrigin:e?.apiOrigin??"https://api.syntexprotocol.com",mountEl:e?.mountEl}}class O{constructor(t){this.config=t}url(t){return`${this.config.apiOrigin}${t}`}async session(){const t=await fetch(this.url("/api/auth/session"),{credentials:"include"});return t.ok?await t.json():{authenticated:!1}}async login(t,o){const a=await fetch(this.url("/api/auth/login"),{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:t,password:o})});if(!a.ok){const r=await a.json().catch(()=>({}));throw new Error(r.error??`LOGIN_FAILED (HTTP ${a.status})`)}}async signup(t,o){const a=await fetch(this.url("/api/auth/signup"),{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:t,password:o})});if(!a.ok){const r=await a.json().catch(()=>({}));throw new Error(r.error??`SIGNUP_FAILED (HTTP ${a.status})`)}return await a.json()}async logout(){await fetch(this.url("/api/auth/session"),{method:"DELETE",credentials:"include"})}async streamMessage(t){const o=await fetch(this.url("/api/chat/send"),{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)});if(!o.ok){const a=await o.json().catch(()=>({}));throw new Error(a.error??`HTTP_${o.status}`)}if(!o.body)throw new Error("NO_STREAM");return o.body}}const A=`
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
    padding: 12px 16px;
    border-bottom: 1px solid #2a2a2a;
    flex-shrink: 0;
    gap: 10px;
    background: #000;
    min-height: 48px;
  }
  .header > div {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px;
    letter-spacing: 2px;
    color: #B8FF00;
    flex: 1;
    line-height: 1;
    font-weight: normal;
  }
  .header select {
    flex: 1;
    max-width: 320px;
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
`;function N(e,t){const o=e.getReader(),a=new TextDecoder;let r="",s=!1,u="",p="";function f(){const d=u,b=p;if(u="",p="",d==="end")return t.onEnd(),!0;if(b)try{t.onData(JSON.parse(b))}catch{}return!1}async function l(){try{for(;!s;){const{value:d,done:b}=await o.read();if(b)break;r+=a.decode(d,{stream:!0});const T=r.split(`
`);r=T.pop()??"";for(const g of T)if(g===""){if(f())return}else g.startsWith("data: ")?p=g.slice(6):g.startsWith("event: ")&&(u=g.slice(7))}t.onEnd()}catch(d){s||t.onError(d)}}return l(),()=>{s=!0,o.cancel().catch(()=>{})}}const y=P(),m=new O(y),n={session:null,authMode:"login",authError:"",busy:!1,messages:[],currentModel:I,streamCleanup:null,pendingInstallUrl:null},x=document.createElement("div");x.setAttribute("data-syntex-widget",""),x.style.cssText="display:flex;flex-direction:column;width:100%;height:100%;";const M=x.attachShadow({mode:"open"}),S=document.createElement("style");S.textContent=A,M.appendChild(S);const h=document.createElement("div");h.style.cssText="display:contents;",M.appendChild(h),(y.mountEl??document.body).appendChild(x);function c(){h.replaceChildren();const e=i("div",{class:"panel",role:"main"});if(!n.session){e.appendChild(w("Loading…")),e.appendChild(i("div",{class:"messages"},"One moment…")),h.appendChild(e);return}if(!n.session.authenticated){e.appendChild(w("Syntex")),e.appendChild(F()),h.appendChild(e);return}if(e.appendChild(w("Syntex",!0)),!n.session.vps)e.appendChild(E("VPS not provisioned — contact support."));else if(n.session.vps.registered)(n.session.credits_cents??0)<=0&&e.appendChild(E("Out of credits — top up to continue."));else{const t=n.pendingInstallUrl?`Paste this into your VPS as root:  curl -fsSL ${y.apiOrigin}${n.pendingInstallUrl} | sudo bash`:"Your VPS has not phoned home yet. Finish the install there first.";e.appendChild(E(t))}e.appendChild(L()),e.appendChild(D()),h.appendChild(e)}function w(e,t=!1){const o=i("div",{class:"header"});if(t){const a=i("select",{"aria-label":"Model"});for(const r of k){const s=i("option",{value:r.id},r.label);r.id===n.currentModel&&(s.selected=!0),a.appendChild(s)}a.addEventListener("change",()=>{n.currentModel=a.value}),o.appendChild(a)}else o.appendChild(i("div",{style:"flex:1;font-weight:600;"},e));return o}function E(e,t){return i("div",{class:"status-line warn"},e)}function L(){const e=i("div",{class:"messages"});for(const t of n.messages)e.appendChild(i("div",{class:`msg ${t.role}`},t.text));return queueMicrotask(()=>{e.scrollTop=e.scrollHeight}),e}function D(){const e=i("form",{class:"composer"}),t=i("textarea",{rows:"1",placeholder:"Ask your agent…"});t.addEventListener("keydown",a=>{a.key==="Enter"&&!a.shiftKey&&(a.preventDefault(),e.requestSubmit())});const o=i("button",{type:"submit"},"→");return n.busy&&(o.disabled=!0),e.appendChild(t),e.appendChild(o),e.addEventListener("submit",async a=>{a.preventDefault();const r=t.value.trim();!r||n.busy||(t.value="",await B(r))}),e}function F(){const e=i("form",{class:"auth"}),t=i("div",{class:"auth-inner"});t.appendChild(i("h3",{},n.authMode==="login"?"Sign in":"Create account"));const o=i("input",{type:"email",placeholder:"email",required:"true",autocomplete:"email"}),a=i("input",{type:"password",placeholder:"password (8+ chars)",required:"true",autocomplete:n.authMode==="login"?"current-password":"new-password"}),r=i("div",{class:"err"},n.authError),s=i("button",{type:"submit"},n.authMode==="login"?"Sign in":"Create account"),u=i("button",{type:"button",class:"toggle"},n.authMode==="login"?"No account? Create one":"Already have an account? Sign in");return u.addEventListener("click",()=>{n.authMode=n.authMode==="login"?"signup":"login",n.authError="",c()}),t.appendChild(o),t.appendChild(a),t.appendChild(r),t.appendChild(s),t.appendChild(u),e.appendChild(t),e.addEventListener("submit",async p=>{p.preventDefault(),n.authError="",n.busy=!0,c();try{if(n.authMode==="login")await m.login(o.value,a.value),await v();else{const f=await m.signup(o.value,a.value);n.pendingInstallUrl=f.installUrl,await v()}}catch(f){n.authError=C(f)}finally{n.busy=!1,c()}}),e}async function v(){try{n.session=await m.session()}catch{n.session={authenticated:!1}}n.session.vps?.currentModel&&(n.currentModel=n.session.vps.currentModel),c()}async function B(e){n.messages.push({role:"user",text:e});const t={role:"pending",text:"Thinking…"};n.messages.push(t),n.busy=!0,c();try{const o=await m.streamMessage({message:e,model:n.currentModel});await new Promise(a=>{let r="",s=!1,u=t;const p=l=>{const d=n.messages.indexOf(u);d>=0?n.messages.splice(d,1,l):n.messages.push(l),u=l,s=!0},f=N(o,{onData:l=>{if(l.event!=="chat"&&l.event!=="chat.side_result")return;const d=_(l.payload.message);l.payload.state==="final"&&d?(p({role:"agent",text:d}),c()):l.payload.state==="delta"&&d?(r+=d,p({role:"pending",text:r}),c()):l.payload.state==="error"&&(p({role:"error",text:l.payload.errorMessage??"Agent error"}),c())},onEnd:()=>{s||(p({role:"error",text:"No response received."}),c()),a()},onError:()=>{s||(p({role:"error",text:"Connection lost."}),c()),a()}});n.streamCleanup=f})}catch(o){const a=n.messages.indexOf(t),r={role:"error",text:C(o)};a>=0?n.messages.splice(a,1,r):n.messages.push(r)}finally{n.busy=!1,n.streamCleanup=null,c()}}function _(e){if(typeof e=="string")return e;if(e&&typeof e=="object"){const t=e;if(typeof t.text=="string")return t.text;if(typeof t.content=="string")return t.content;if(Array.isArray(t.content))return t.content.map(o=>typeof o=="string"?o:o&&typeof o=="object"&&"text"in o?String(o.text??""):"").join("")}return""}function C(e){const t=e instanceof Error?e.message:String(e);switch(t){case"INVALID_CREDENTIALS":return"Wrong email or password.";case"EMAIL_TAKEN":return"An account with that email already exists.";case"WEAK_PASSWORD":return"Password must be at least 8 characters.";case"INVALID_EMAIL":return"That email doesn't look right.";case"NO_VPS_REGISTERED":case"VPS_NOT_ONLINE":return"Finish installing Syntex on your VPS first.";case"INSUFFICIENT_CREDITS":return"Out of credits.";default:return t}}function i(e,t={},o){const a=document.createElement(e);for(const[r,s]of Object.entries(t))r==="class"?a.className=s:a.setAttribute(r,s);return typeof o=="string"?a.textContent=o:o&&a.appendChild(o),a}v(),c()})();
//# sourceMappingURL=syntex-widget.js.map
