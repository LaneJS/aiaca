import { chromium, type Browser, type Page } from 'playwright';
import { source as axeSource } from 'axe-core';
import { logger } from '../logger';
import { scannerConfig } from '../config';
import { axeRulesCovered, normalizeAxeResults } from './axe-normalizer';
import type { ScanRequestBody, ScanResult } from '../types/scan';

interface PlaywrightScannerOptions {
  timeoutMs?: number;
}

const disableAnimationsCss = `
*, *::before, *::after {
  transition-duration: 0s !important;
  animation-duration: 0s !important;
  animation-delay: 0s !important;
}
`;

export class PlaywrightScanner {
  constructor(private readonly options: PlaywrightScannerOptions = {}) {}

  async scan(body: ScanRequestBody): Promise<ScanResult> {
    const start = performance.now();
    const timeoutMs = this.options.timeoutMs ?? scannerConfig.timeoutMs;
    const browser = await chromium.launch({
      headless: true,
      args: ['--disable-dev-shm-usage', '--no-sandbox'],
    });

    try {
      const context = await browser.newContext({
        viewport: scannerConfig.viewport,
        userAgent: scannerConfig.userAgent,
        deviceScaleFactor: 1,
        colorScheme: 'light',
        ignoreHTTPSErrors: true,
      });

      const page = await context.newPage();
      page.setDefaultTimeout(timeoutMs);
      page.setDefaultNavigationTimeout(timeoutMs);

      await this.navigate(page, body);
      await page.addStyleTag({ content: disableAnimationsCss });
      await page.addScriptTag({ content: axeSource });

      const axeResults = await page.evaluate(
        (rules) =>
          (window as unknown as { axe: { run: typeof import('axe-core').run } }).axe.run(document, {
            runOnly: { type: 'rule', values: rules },
          }),
        axeRulesCovered,
      );

      const durationMs = Math.round(performance.now() - start);
      return {
        url: body.url,
        issues: normalizeAxeResults(axeResults),
        rawAxe: { ...axeResults, durationMs },
      };
    } finally {
      await browser.close();
    }
  }

  private async navigate(page: Page, body: ScanRequestBody) {
    if (body.htmlSnapshot) {
      await page.goto('about:blank');
      await page.setContent(body.htmlSnapshot, { waitUntil: 'networkidle' });
      await page.evaluate(
        ({ url }) => {
          if (url) {
            const base = document.createElement('base');
            base.href = url;
            document.head.prepend(base);
          }
        },
        { url: body.url },
      );
      logger.debug({ url: body.url }, 'Loaded snapshot content');
      return;
    }

    await page.goto(body.url, { waitUntil: 'networkidle' });
    logger.debug({ url: body.url }, 'Loaded URL');
  }
}
