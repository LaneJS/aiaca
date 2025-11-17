import { z } from 'zod';

export const booleanString = z
  .string()
  .optional()
  .transform((value) => value === 'true' || value === '1');

export const orchestratorEnvSchema = z.object({
  AI_ORCHESTRATOR_PORT: z
    .string()
    .default('4002')
    .transform((value) => Number.parseInt(value, 10)),
  AI_ORCHESTRATOR_USE_STUB: booleanString.default(false),
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

export function loadEnv<TSchema extends z.ZodTypeAny>(schema: TSchema, env = process.env): z.infer<TSchema> {
  const parsed = schema.safeParse(env);

  if (!parsed.success) {
    const formatted = parsed.error.format();
    throw new Error(`Invalid environment variables: ${JSON.stringify(formatted, null, 2)}`);
  }

  return parsed.data;
}
