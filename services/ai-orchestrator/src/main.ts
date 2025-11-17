import { createServer } from './app/server';
import { logger } from './app/logger';

async function bootstrap() {
  const { app, config } = await createServer();
  const port = config.AI_ORCHESTRATOR_PORT;
  try {
    await app.listen({ port, host: '0.0.0.0' });
    logger.info({ message: 'ai-orchestrator.started', port });
  } catch (error) {
    logger.error({ message: 'ai-orchestrator.failed', error });
    process.exit(1);
  }
}

bootstrap();
