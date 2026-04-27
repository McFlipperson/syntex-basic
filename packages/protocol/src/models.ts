export interface ModelOption {
  id: string;
  label: string;
}

export const DEFAULT_MODEL_ID = "anthropic/claude-sonnet-4.6";

export const MODEL_OPTIONS: readonly ModelOption[] = [
  { id: "anthropic/claude-sonnet-4.6", label: "Claude Sonnet 4.6" },
  { id: "anthropic/claude-opus-4.7", label: "Claude Opus 4.7" },
  { id: "anthropic/claude-haiku-4.5", label: "Claude Haiku 4.5" },
  { id: "openai/gpt-5.5", label: "GPT-5.5" },
  { id: "openai/gpt-5.4-mini", label: "GPT-5.4 Mini" },
  { id: "openai/gpt-5.4-nano", label: "GPT-5.4 Nano" },
  { id: "openai/o3", label: "o3" },
  { id: "openai/o4-mini", label: "o4-mini" },
  { id: "google/gemini-3.1-pro-preview", label: "Gemini 3.1 Pro" },
  { id: "google/gemini-3.1-flash-lite-preview", label: "Gemini 3.1 Flash" },
  { id: "deepseek/deepseek-v4-pro", label: "DeepSeek V4 Pro" },
  { id: "deepseek/deepseek-v4-flash", label: "DeepSeek V4 Flash" },
  { id: "meta-llama/llama-4-maverick", label: "Llama 4 Maverick" },
  { id: "meta-llama/llama-4-scout", label: "Llama 4 Scout" },
  { id: "mistralai/mistral-small-2603", label: "Mistral Small" },
  { id: "x-ai/grok-4.20", label: "Grok 4.20" },
  { id: "qwen/qwen3.6-plus", label: "Qwen3.6 Plus" },
] as const;

export const MODEL_IDS: ReadonlySet<string> = new Set(MODEL_OPTIONS.map((m) => m.id));
