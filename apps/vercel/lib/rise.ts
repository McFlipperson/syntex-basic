import { env } from "./env.js";

// Auto-routing defaults — locked USS v15.0
const TIER_MODELS: Record<string, string> = {
  R: "anthropic/claude-haiku-4.5",
  I: "anthropic/claude-haiku-4.5",
  S: "anthropic/claude-sonnet-4.6",
  E: "anthropic/claude-opus-4.7",
};

export type RiseTier = "R" | "I" | "S" | "E";

export interface ClassificationResult {
  tier: RiseTier;
  model: string;
  outputSpec: string;
}

// ─── CLAWROUTER PRE-FILTER ────────────────────────────────────────────────────
// Catches obvious R-tier tasks without spending on an LLM call.
// Conservative — uncertain tasks pass to the full classifier.
function isObviousRTier(task: string): boolean {
  const t = task.toLowerCase();

  const actionPatterns = [
    /\brename\b/, /\breformat\b/, /\bformat\b/, /\bconvert\b/,
    /\bcopy\b/, /\bpaste\b/, /\btranslate\b/, /\btranscribe\b/,
    /\bextract\b/, /\bparse\b/, /\bsort\b/, /\bfilter\b/,
    /\blist\b/, /\bcount\b/, /\bfind and replace\b/,
    /\bstrip\b/, /\bclean up\b/, /\bremove\b/, /\bfill in\b/, /\bfill out\b/,
  ];

  const subjectPatterns = [
    /\bfile[s]?\b/, /\bcsv\b/, /\bjson\b/, /\bspreadsheet\b/,
    /\bcolumn[s]?\b/, /\brow[s]?\b/, /\blist\b/, /\btemplate\b/,
    /\btext\b/, /\bstring\b/, /\bdate[s]?\b/, /\bnumber[s]?\b/,
    /\bformat\b/, /\btable\b/,
  ];

  const disqualifiers = [
    /\banalyse\b/, /\banalyze\b/, /\bresearch\b/, /\bdesign\b/,
    /\bbuild\b/, /\bcreate\b/, /\bwrite\b/, /\bdraft\b/,
    /\bsummar/, /\bcompare\b/, /\bexplain\b/, /\breview\b/,
    /\barchitect\b/, /\bmodel\b/, /\bstrateg/,
    /\boptimis\b/, /\boptimiz\b/, /\bwhy\b/, /\bhow\b/,
    /\bwhat\b/, /\bshould\b/,
  ];

  if (disqualifiers.some(p => p.test(t))) return false;
  return actionPatterns.some(p => p.test(t)) && subjectPatterns.some(p => p.test(t));
}

// ─── CLASSIFIER SYSTEM PROMPT ─────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are the Syntex RISE classifier. Classify the user task into exactly one tier:

R (ROUTINE): Deterministic tasks. Formatting, copying, converting, renaming, filling templates. Could a simple script do this?
I (INTELLIGENT): Standard language generation. Drafting, summarising, writing copy, single well-defined coding tasks. Needs writing skill but nothing outside the prompt.
S (SYNTHESIS): Multi-step tasks requiring external information. Web research, tool use, cross-document analysis, multi-file debugging.
E (ENGINEERING): Highest complexity. Expert judgment required. System architecture, financial modelling, legal analysis, security review, complex debugging with no clear path.

Respond ONLY with valid JSON — no markdown, no explanation:
{"tier":"R"|"I"|"S"|"E","output_spec":"concise constraints for the executing model: length, format, stop condition"}`;

// ─── CLASSIFY ─────────────────────────────────────────────────────────────────
// Classification calls use the master key — this is Syntex infrastructure cost,
// not billed against the user's personal OR key.
export async function classifyTask(task: string): Promise<ClassificationResult> {
  if (isObviousRTier(task)) {
    return {
      tier: "R",
      model: TIER_MODELS.R as string,
      outputSpec: "Return only the transformed result. Be concise. Stop when complete. No preamble, no explanation.",
    };
  }

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://syntexprotocol.com",
      "X-Title": "Syntex-Classifier",
    },
    body: JSON.stringify({
      model: "anthropic/claude-sonnet-4.6",
      max_tokens: 150,
      temperature: 0,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: task.slice(0, 2000) }, // cap to avoid excess classifier tokens
      ],
    }),
  });

  if (!res.ok) {
    // Classifier failure is non-fatal — fall back to I-tier
    console.error("[rise] classifier call failed:", res.status);
    return { tier: "I", model: TIER_MODELS.I as string, outputSpec: "Be clear and concise. Stop when the task is complete." };
  }

  const data = await res.json() as { choices?: { message?: { content?: string } }[] };
  const raw = data.choices?.[0]?.message?.content ?? "";

  let parsed: { tier?: string; output_spec?: string } = {};
  try {
    parsed = JSON.parse(raw.replace(/```json\n?|\n?```/g, "").trim());
  } catch {
    console.error("[rise] failed to parse classifier response:", raw);
  }

  const tierRaw = parsed.tier;
  const tier: RiseTier = (tierRaw === "R" || tierRaw === "I" || tierRaw === "S" || tierRaw === "E") ? tierRaw : "I";
  return {
    tier,
    model: TIER_MODELS[tier] as string,
    outputSpec: parsed.output_spec ?? "Be clear and concise. Stop when the task is complete.",
  };
}

// ─── INJECT OUTPUT SPEC ───────────────────────────────────────────────────────
// Prepends the output spec as a system message. If a system message already
// exists, the spec is appended to it so OC's existing context is preserved.
export function injectOutputSpec(
  messages: { role: string; content: unknown }[],
  outputSpec: string,
): { role: string; content: unknown }[] {
  const specContent = `[SYNTEX OUTPUT CONTROLS] ${outputSpec}`;
  const existing = messages.findIndex(m => m.role === "system");
  if (existing >= 0) {
    return messages.map((msg, i) => {
      if (i !== existing) return msg;
      const base = typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content);
      return { ...msg, content: `${base}\n\n${specContent}` };
    });
  }
  return [{ role: "system", content: specContent }, ...messages];
}
