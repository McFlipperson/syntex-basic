export interface SyntexConfig {
  apiOrigin: string;
  mountEl?: HTMLElement;
}

declare global {
  interface Window {
    SYNTEX_CONFIG?: Partial<SyntexConfig> & { mountEl?: HTMLElement };
  }
}

export function resolveConfig(): SyntexConfig {
  const w = typeof window !== "undefined" ? window.SYNTEX_CONFIG : undefined;
  return {
    apiOrigin: w?.apiOrigin ?? "https://api.syntexprotocol.com",
    mountEl: w?.mountEl,
  };
}
