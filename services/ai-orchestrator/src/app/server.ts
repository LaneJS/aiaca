import fastify from 'fastify';
import { loadOrchestratorConfig } from './config';
import { registerRoutes } from './routes';
import { SuggestionService } from './suggestion-service';
import { GeminiSuggestionProvider } from '../providers/gemini-provider';
import { StubSuggestionProvider } from '../providers/stub-provider';
import { logger } from './logger';

export async function createServer() {
  const config = loadOrchestratorConfig();
  const primary = new GeminiSuggestionProvider({ apiKey: config.GEMINI_API_KEY, model: config.GEMINI_MODEL });
  const fallback = new StubSuggestionProvider();
  const service = new SuggestionService({
    primary,
    fallback,
    timeoutMs: config.AI_ORCHESTRATOR_TIMEOUT_MS,
    maxIssues: config.AI_ORCHESTRATOR_MAX_ISSUES,
    tenantBudgetTokens: config.AI_ORCHESTRATOR_TENANT_BUDGET_TOKENS,
    forceStub: config.AI_ORCHESTRATOR_USE_STUB || !config.GEMINI_API_KEY,
  });

  const app = fastify({ logger });
  await registerRoutes(app, service);
  return { app, config };
}
