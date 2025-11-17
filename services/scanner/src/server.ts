import { randomUUID } from 'crypto';
import Fastify from 'fastify';
import { scannerConfig } from './config';
import { logger } from './logger';
import { metricsRegister, scanCounter, scanDuration } from './metrics';
import { PlaywrightScanner } from './scan/playwright-scanner';
import type { ScanRequestBody } from './types/scan';

const scanner = new PlaywrightScanner();

export const buildServer = () => {
  const server = Fastify({
    logger,
    requestIdHeader: 'x-request-id',
    genReqId: () => randomUUID(),
  });

  server.addHook('onRequest', async (request, reply) => {
    reply.header('x-request-id', request.id);
    request.log = request.log.child({ correlationId: request.id });
  });

  server.get('/health', async () => ({ status: 'ok', uptimeSeconds: process.uptime() }));

  server.get('/metrics', async (_request, reply) => {
    reply.header('Content-Type', metricsRegister.contentType);
    return metricsRegister.metrics();
  });

  server.post<{ Body: ScanRequestBody }>('/scan', async (request, reply) => {
    const timer = scanDuration.startTimer();
    const { url, htmlSnapshot } = request.body;

    if (!url || typeof url !== 'string') {
      reply.code(400);
      timer();
      return { error: 'Invalid payload: "url" is required' };
    }

    try {
      const result = await scanner.scan({ url, htmlSnapshot });
      scanCounter.inc();
      timer();
      return {
        url: result.url,
        issues: result.issues,
        meta: { issueCount: result.issues.length, rawDurationMs: (result.rawAxe as any)?.durationMs },
      };
    } catch (error) {
      timer();
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
