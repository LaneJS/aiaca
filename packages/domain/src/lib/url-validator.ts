import { z } from 'zod';

const allowedProtocols = ['http:', 'https:'] as const;

const urlSchema = z
  .string()
  .trim()
  .min(1, 'URL is required')
  .transform((value) => {
    let parsed: URL;
    try {
      parsed = new URL(value);
    } catch (error) {
      throw new Error('Invalid URL');
    }

    if (!allowedProtocols.includes(parsed.protocol as (typeof allowedProtocols)[number])) {
      throw new Error('URL must start with http or https');
    }

    if (!parsed.hostname) {
      throw new Error('URL must include a hostname');
    }

    // Drop fragments to avoid leaking client-side state
    parsed.hash = '';

    return parsed.toString();
  });

/**
 * Validates and normalizes a scan URL for API/Scanner usage.
 * - Requires http/https
 * - Trims whitespace
 * - Removes URL fragments
 */
export function sanitizeScanUrl(value: unknown): string {
  return urlSchema.parse(value);
}
