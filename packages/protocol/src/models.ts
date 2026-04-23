export interface ModelOption {
  id: string;
  label: string;
}

export const DEFAULT_MODEL_ID = "anthropic/claude-sonnet-4.6";

export const MODEL_OPTIONS: readonly ModelOption[] = [
  { id: "anthropic/claude-sonnet-4.6", label: "Claude Sonnet 4.6" },
  { id: "anthropic/claude-opus-4.7", label: "Claude Opus 4.7" },
  { id: "anthropic/claude-haiku-4.5", label: "Claude Haiku 4.5" },
  { id: "openai/gpt-5", label: "GPT-5" },
  { id: "openai/gpt-5-mini", label: "GPT-5 Mini" },
  { id: "openai/gpt-5-nano", label: "GPT-5 Nano" },
  { id: "openai/o3", label: "o3" },
  { id: "openai/o4-mini", label: "o4-mini" },
  { id: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { id: "google/gemini-3-flash-preview", label: "Gemini 3 Flash Preview" },
  { id: "google/gemini-3-pro-preview", label: "Gemini 3 Pro Preview" },
  { id: "deepseek/deepseek-r1", label: "DeepSeek R1" },
  { id: "deepseek/deepseek-v3-2", label: "DeepSeek V3.2" },
  { id: "meta-llama/llama-4-maverick", label: "Llama 4 Maverick" },
  { id: "meta-llama/llama-4-scout", label: "Llama 4 Scout" },
  { id: "mistralai/mistral-large", label: "Mistral Large" },
  { id: "x-ai/grok-4", label: "Grok 4" },
  { id: "x-ai/grok-4.1-fast", label: "Grok 4.1 Fast" },
  { id: "x-ai/grok-4.20-beta", label: "Grok 4.20" },
  { id: "qwen/qwen3-235b-a22b", label: "Qwen3 235B" },
] as const;

export const MODEL_IDS: ReadonlySet<string> = new Set(MODEL_OPTIONS.map((m) => m.id));
