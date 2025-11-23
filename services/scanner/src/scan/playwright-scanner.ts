import { chromium, type Browser, type Page } from 'playwright';
import { source as axeSource } from 'axe-core';
import { logger } from '../logger';
import { scannerConfig } from '../config';
import { axeRulesCovered, normalizeAxeResults } from './axe-normalizer';
import type { ScanRequestBody, ScanResult } from '../types/scan';
import { redactAxeResults } from './redaction';

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
        bypassCSP: true,
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

      const redactedResults = redactAxeResults(axeResults);

      const durationMs = Math.round(performance.now() - start);
      return {
        url: body.url,
        issues: normalizeAxeResults(redactedResults),
        rawAxe: { ...redactedResults, durationMs },
      };
    } finally {
      await browser.close();
    }
  }

  private async navigate(page: Page, body: ScanRequestBody) {
    const waitUntil = body.waitUntil ?? 'domcontentloaded';

    if (body.htmlSnapshot) {
      const htmlWithBase = this.injectBaseHref(body.htmlSnapshot, body.url);
      await page.setContent(htmlWithBase, { waitUntil });
      logger.debug({ url: body.url, waitUntil }, 'Loaded snapshot content');
      return;
    }

    await page.goto(body.url, { waitUntil });
    logger.debug({ url: body.url, waitUntil }, 'Loaded URL');
  }

  private injectBaseHref(html: string, baseHref?: string) {
    if (!baseHref) return html;
    if (/<base\s[^>]*href=/i.test(html)) return html;

    if (/<head[^>]*>/i.test(html)) {
      return html.replace(/<head([^>]*)>/i, `<head$1><base href="${baseHref}">`);
    }

    if (/<html[^>]*>/i.test(html)) {
      return html.replace(/<html([^>]*)>/i, `<html$1><head><base href="${baseHref}"></head>`);
    }

    return `<head><base href="${baseHref}"></head>${html}`;
  }
}
