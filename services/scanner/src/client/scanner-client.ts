import type { NormalizedIssue, ScanRequestBody } from '../types/scan';

export interface ScannerClientConfig {
  baseUrl: string;
  timeoutMs?: number;
}

export interface ScannerResponse {
  url: string;
  issues: NormalizedIssue[];
}

export const createScannerClient = (config: ScannerClientConfig) => {
  const timeoutMs = config.timeoutMs ?? 30000;

  return {
    async scan(payload: ScanRequestBody): Promise<ScannerResponse> {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(new URL('/scan', config.baseUrl).toString(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Scanner returned ${response.status}`);
        }

        return (await response.json()) as ScannerResponse;
      } finally {
        clearTimeout(timeout);
      }
    },
  };
};
