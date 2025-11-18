import { z } from 'zod';

type EnvRecord = Record<string, string | undefined>;

// Declare a minimal process shape so browser builds can compile without Node typings
declare const process: { env?: EnvRecord } | undefined;

export const booleanString = z
  .string()
  .optional()
  .transform((value) => value === 'true' || value === '1');

export const orchestratorEnvSchema = z.object({
  AI_ORCHESTRATOR_PORT: z
    .string()
    .default('4002')
    .transform((value) => Number.parseInt(value, 10)),
  AI_ORCHESTRATOR_USE_STUB: booleanString.default('false'),
  AI_ORCHESTRATOR_MAX_ISSUES: z
    .string()
    .default('5')
    .transform((value) => Number.parseInt(value, 10)),
  AI_ORCHESTRATOR_TIMEOUT_MS: z
    .string()
    .default('20000')
    .transform((value) => Number.parseInt(value, 10)),
  AI_ORCHESTRATOR_TENANT_BUDGET_TOKENS: z
    .string()
    .optional()
    .transform((value) => (value ? Number.parseInt(value, 10) : undefined)),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-1.5-pro'),
  GEMINI_LOCATION: z.string().default('us-central1'),
});

export type OrchestratorEnv = z.infer<typeof orchestratorEnvSchema>;

export function loadEnv<TSchema extends z.ZodTypeAny>(schema: TSchema, env = process?.env): z.infer<TSchema> {
  const parsed = schema.safeParse(env);

  if (!parsed.success) {
    const formatted = parsed.error.format();
    throw new Error(`Invalid environment variables: ${JSON.stringify(formatted, null, 2)}`);
  }

  return parsed.data;
}

export function getApiBaseUrl(env?: Record<string, string | undefined>): string {
  const sourceEnv = env ?? (typeof process !== 'undefined' ? (process.env as Record<string, string | undefined>) : undefined);

  const fromEnv =
    sourceEnv?.['AACA_API_BASE_URL'] || sourceEnv?.['NX_PUBLIC_API_BASE_URL'] || sourceEnv?.['PUBLIC_API_BASE_URL'];

  if (fromEnv) {
    return normalizeBaseUrl(fromEnv);
  }

  const globalBase = (globalThis as Record<string, unknown>)['__AACA_API_BASE_URL__'];
  if (typeof globalBase === 'string' && globalBase.length > 0) {
    return normalizeBaseUrl(globalBase);
  }

  return 'http://localhost:8080/api/v1';
}

function normalizeBaseUrl(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}
