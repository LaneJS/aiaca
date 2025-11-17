import { randomUUID } from 'crypto';
import fastify from 'fastify';
import { GeminiSuggestionProvider } from '../providers/gemini-provider';
import { StubSuggestionProvider } from '../providers/stub-provider';
import { loadOrchestratorConfig } from './config';
import { logger } from './logger';
import { metricsRegister } from './metrics';
import { registerRoutes } from './routes';
import { SuggestionService } from './suggestion-service';

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

  const app = fastify({
    logger,
    requestIdHeader: 'x-request-id',
    genReqId: () => randomUUID(),
  });

  app.addHook('onRequest', async (request, reply) => {
    reply.header('x-request-id', request.id);
    request.log = request.log.child({ correlationId: request.id });
  });

  app.get('/health', async () => ({
    status: 'ok',
    useStub: config.AI_ORCHESTRATOR_USE_STUB || !config.GEMINI_API_KEY,
    uptimeSeconds: process.uptime(),
  }));

  app.get('/metrics', async (_request, reply) => {
    reply.header('Content-Type', metricsRegister.contentType);
    return metricsRegister.metrics();
  });
  await registerRoutes(app, service);
  return { app, config };
}
