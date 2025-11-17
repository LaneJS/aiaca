import { loadEnv, orchestratorEnvSchema, OrchestratorEnv } from '@aiaca/config';

export function loadOrchestratorConfig(env = process.env): OrchestratorEnv {
  return loadEnv(orchestratorEnvSchema, env);
}
