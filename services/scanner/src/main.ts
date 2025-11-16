import { startServer } from './server';
import { logger } from './logger';

startServer().catch((err) => {
  logger.error({ err }, 'Failed to start scanner service');
  process.exit(1);
});
