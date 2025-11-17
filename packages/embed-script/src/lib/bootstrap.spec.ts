import { applyAltTextFixes } from './alt-text';
import { ensureFocusOutline } from './focus-outline';
import { injectSkipLink } from './skip-link';
import { deriveFeatures, fetchEmbedConfig, readScriptAttributes } from './script-loader';
import type { EmbedConfig, ScriptAttributes } from './types';

function mockScriptTag(attrs: Partial<Record<string, string>> = {}): HTMLScriptElement {
  const script = document.createElement('script');
  Object.entries(attrs).forEach(([key, value]) => {
    if (value !== undefined) {
      script.dataset[key as keyof DOMStringMap] = value;
    }
  });
  document.body.appendChild(script);
  return script;
}

describe('embed script runtime', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  it('reads script attributes for site id and config', () => {
    const script = mockScriptTag({ siteId: 'site-123', apiBaseUrl: 'https://api.test/v1' });
    Object.defineProperty(document, 'currentScript', { value: script, configurable: true });

    const attributes = readScriptAttributes();
    expect(attributes?.siteId).toBe('site-123');
    expect(attributes?.apiBaseUrl).toBe('https://api.test/v1');
  });

  it('derives feature toggles with overrides', () => {
    const config: EmbedConfig = {
      siteId: 'site-123',
      autoFixes: ['alt_text'],
      enableSkipLink: false,
    };

    const attributes: ScriptAttributes = {
      siteId: 'site-123',
      apiBaseUrl: '/api/v1',
      disableAltText: false,
      disableSkipLink: undefined,
      disableFocusOutline: true,
    };

    const features = deriveFeatures(config, attributes);
    expect(features.altText).toBe(true);
    expect(features.skipLink).toBe(false);
    expect(features.focusOutline).toBe(false);
  });

  it('applies alt text suggestions to missing images', () => {
    mockScriptTag({ siteId: 'site-123' });
    const img = document.createElement('img');
    img.src = 'https://cdn.test/example.png';
    document.body.appendChild(img);

    applyAltTextFixes([
      { imageUrl: 'https://cdn.test/example.png', altText: 'Example graphic' },
    ]);

    expect(img.getAttribute('alt')).toBe('Example graphic');
  });

  it('injects skip link and main placeholder when missing', () => {
    mockScriptTag({ siteId: 'site-123' });
    injectSkipLink();

    const skip = document.querySelector('a.aaca-skip-to-content');
    expect(skip).not.toBeNull();
    expect(skip?.textContent).toContain('Skip');
    const main = document.getElementById('aaca-main-content');
    expect(main).not.toBeNull();
  });

  it('ensures focus outline style is present', () => {
    mockScriptTag({ siteId: 'site-123' });
    ensureFocusOutline('#123456');

    const style = document.querySelector('style[data-aaca-embed-style="focus-outline"]');
    expect(style).not.toBeNull();
    expect(style?.textContent).toContain('#123456');
  });

  it('fetches embed config with api base url and embed key', async () => {
    const script = mockScriptTag({ siteId: 'abc', apiBaseUrl: 'https://api.test/api/v1', embedKey: 'key-123' });
    Object.defineProperty(document, 'currentScript', { value: script, configurable: true });

    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ siteId: 'abc', autoFixes: ['alt_text'] }),
    });

    const attributes = readScriptAttributes();
    const config = await fetchEmbedConfig(attributes!, mockFetch as unknown as typeof fetch);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.test/api/v1/sites/abc/embed-config',
      { headers: { 'X-Embed-Key': 'key-123' } }
    );
    expect(config?.siteId).toBe('abc');
  });
});
