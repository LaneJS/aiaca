import { aiSuggestFixRequestSchema } from '@aiaca/domain';
import { FastifyInstance } from 'fastify';
import { issuesPerSuggestion, suggestionCounter } from './metrics';
import { SuggestionService } from './suggestion-service';

export async function registerRoutes(app: FastifyInstance, service: SuggestionService): Promise<void> {
  app.post('/suggest-fixes', async (request, reply) => {
    const parsed = aiSuggestFixRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', details: parsed.error.format() });
    }

    try {
      const result = await service.suggest(parsed.data);
      suggestionCounter.inc();
      issuesPerSuggestion.observe(parsed.data.issues.length);
      return reply.status(200).send(result);
    } catch (error) {
      request.log.error({
        message: 'suggestion.failed',
        error: error instanceof Error ? error.message : 'unknown',
      });
      return reply.status(500).send({ error: 'Failed to generate suggestions' });
    }
  });
}
