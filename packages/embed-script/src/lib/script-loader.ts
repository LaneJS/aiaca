import { DEFAULT_API_BASE } from './constants';
import type { EmbedConfig, FeatureToggles, ScriptAttributes } from './types';

const DEFAULT_FEATURES: FeatureToggles = {
  altText: true,
  skipLink: true,
  focusOutline: true,
};

function coerceBooleanFlag(value?: string): boolean | undefined {
  if (value === undefined) return undefined;
  return value === 'true' || value === '' || value === '1';
}

function findScriptElement(): HTMLScriptElement | null {
  const current = document.currentScript;
  if (current instanceof HTMLScriptElement) {
    return current;
  }

  const scripts = Array.from(document.querySelectorAll('script')) as HTMLScriptElement[];
  return scripts.find((node) => node.dataset['siteId'] !== undefined) ?? null;
}

export function readScriptAttributes(): ScriptAttributes | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const script = findScriptElement();
  if (!script) {
    console.warn('[AACA Embed] Unable to locate embed script tag.');
    return null;
  }

  const siteId = script.dataset['siteId'];
  if (!siteId) {
    console.warn('[AACA Embed] data-site-id is required on the embed script tag.');
    return null;
  }

  return {
    siteId,
    embedKey: script.dataset['embedKey'],
    apiBaseUrl: script.dataset['apiBaseUrl'] || DEFAULT_API_BASE,
    skipLinkText: script.dataset['skipLinkText'],
    focusOutlineColor: script.dataset['focusOutlineColor'],
    disableAltText: coerceBooleanFlag(script.dataset['disableAltText']),
    disableSkipLink: coerceBooleanFlag(script.dataset['disableSkipLink']),
    disableFocusOutline: coerceBooleanFlag(script.dataset['disableFocusOutline']),
  };
}

export async function fetchEmbedConfig(
  attributes: ScriptAttributes,
  fetchImpl: typeof fetch = fetch
): Promise<EmbedConfig | null> {
  const baseUrl = attributes.apiBaseUrl || DEFAULT_API_BASE;
  let endpoint: string;
  try {
    const url = new URL(baseUrl, window.location.origin);
    url.pathname = `${url.pathname.replace(/\/$/, '')}/sites/${encodeURIComponent(attributes.siteId)}/embed-config`;
    endpoint = url.toString();
  } catch (error) {
    console.warn('[AACA Embed] Invalid apiBaseUrl; falling back to /api/v1.', error);
    endpoint = `${DEFAULT_API_BASE}/sites/${encodeURIComponent(attributes.siteId)}/embed-config`;
  }

  try {
    const response = await fetchImpl(endpoint, {
      headers: attributes.embedKey ? { 'X-Embed-Key': attributes.embedKey } : undefined,
    });

    if (!response.ok) {
      console.warn('[AACA Embed] Unable to fetch embed config:', response.status, response.statusText);
      return null;
    }

    const config: EmbedConfig = await response.json();
    return config;
  } catch (error) {
    console.warn('[AACA Embed] Failed to load embed config:', error);
    return null;
  }
}

export function deriveFeatures(
  config: EmbedConfig | null,
  attributes: ScriptAttributes
): FeatureToggles {
  const fromConfig = {
    altText: config?.autoFixes?.includes('alt_text'),
    skipLink: config?.enableSkipLink ?? config?.autoFixes?.includes('skip_link'),
    focusOutline: config?.autoFixes?.includes('focus_outline'),
  };

  const merged: FeatureToggles = {
    altText: attributes.disableAltText ? false : fromConfig.altText ?? DEFAULT_FEATURES.altText,
    skipLink: attributes.disableSkipLink ? false : fromConfig.skipLink ?? DEFAULT_FEATURES.skipLink,
    focusOutline: attributes.disableFocusOutline ? false : fromConfig.focusOutline ?? DEFAULT_FEATURES.focusOutline,
  };

  return merged;
}
