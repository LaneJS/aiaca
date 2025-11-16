import dotenv from 'dotenv';

dotenv.config({ path: process.env.SCANNER_ENV_FILE || undefined });

const numberFromEnv = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const scannerConfig = {
  port: numberFromEnv(process.env.PORT, 4100),
  host: process.env.HOST || '0.0.0.0',
  timeoutMs: numberFromEnv(process.env.SCANNER_TIMEOUT_MS, 30000),
  viewport: {
    width: numberFromEnv(process.env.SCANNER_VIEWPORT_WIDTH, 1280),
    height: numberFromEnv(process.env.SCANNER_VIEWPORT_HEIGHT, 720),
  },
  maxRetries: numberFromEnv(process.env.SCANNER_MAX_RETRIES, 1),
  userAgent:
    process.env.SCANNER_USER_AGENT ||
    'AACA-Scanner/1.0 (Playwright; +https://a11y.example.com)',
  apiBaseUrl: process.env.SCANNER_API_BASE_URL || 'http://localhost:8080',
};

export type ScannerConfig = typeof scannerConfig;
