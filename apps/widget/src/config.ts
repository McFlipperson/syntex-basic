export interface SyntexConfig {
  apiOrigin: string;
}

declare global {
  interface Window {
    SYNTEX_CONFIG?: Partial<SyntexConfig>;
  }
}

export function resolveConfig(): SyntexConfig {
  const w = typeof window !== "undefined" ? window.SYNTEX_CONFIG : undefined;
  return {
    apiOrigin: w?.apiOrigin ?? "https://api.syntexprotocol.com",
  };
}
