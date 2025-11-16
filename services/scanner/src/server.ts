import Fastify from 'fastify';
import { scannerConfig } from './config';
import { logger } from './logger';
import { PlaywrightScanner } from './scan/playwright-scanner';
import type { ScanRequestBody } from './types/scan';

const scanner = new PlaywrightScanner();

export const buildServer = () => {
  const server = Fastify({ logger });

  server.get('/health', async () => ({ status: 'ok' }));

  server.post<{ Body: ScanRequestBody }>('/scan', async (request, reply) => {
    const { url, htmlSnapshot } = request.body;

    if (!url || typeof url !== 'string') {
      reply.code(400);
      return { error: 'Invalid payload: "url" is required' };
    }

    try {
      const result = await scanner.scan({ url, htmlSnapshot });
      return {
        url: result.url,
        issues: result.issues,
        meta: { issueCount: result.issues.length, rawDurationMs: (result.rawAxe as any)?.durationMs },
      };
    } catch (error) {
      request.log.error({ err: error }, 'Scan failed');
      reply.code(500);
      return { error: 'Scan failed', details: (error as Error).message };
    }
  });

  return server;
};

export const startServer = async () => {
  const server = buildServer();

  const closeGracefully = async (signal: string) => {
    logger.info({ signal }, 'Received shutdown signal');
    try {
      await server.close();
      logger.info('Scanner service stopped');
      process.exit(0);
    } catch (err) {
      logger.error({ err }, 'Error during shutdown');
      process.exit(1);
    }
  };

  process.on('SIGTERM', closeGracefully);
  process.on('SIGINT', closeGracefully);

  await server.listen({ port: scannerConfig.port, host: scannerConfig.host });
  logger.info({ port: scannerConfig.port }, 'Scanner service listening');
};
