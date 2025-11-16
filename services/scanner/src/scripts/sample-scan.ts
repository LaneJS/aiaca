import { PlaywrightScanner } from '../scan/playwright-scanner';
import { logger } from '../logger';

const url = process.argv[2] || 'https://example.com';

async function run() {
  const scanner = new PlaywrightScanner();
  logger.info({ url }, 'Running sample scan');
  const result = await scanner.scan({ url });

  logger.info({ count: result.issues.length }, 'Scan complete');
  console.log(JSON.stringify(result.issues, null, 2));
}

run().catch((err) => {
  logger.error({ err }, 'Sample scan failed');
  process.exit(1);
});
