import { applyAltTextFixes } from './alt-text';
import { ensureFocusOutline } from './focus-outline';
import { injectSkipLink } from './skip-link';
import { fetchEmbedConfig, deriveFeatures, readScriptAttributes } from './script-loader';
import type { EmbedConfig } from './types';

let hasBootstrapped = false;

async function applyFixes(config: EmbedConfig | null): Promise<void> {
  const attributes = readScriptAttributes();

  if (!attributes) {
    return;
  }

  const features = deriveFeatures(config, attributes);

  if (features.altText) {
    applyAltTextFixes(config?.altTextSuggestions);
  }

  if (features.skipLink) {
    injectSkipLink({
      text: config?.skipLinkText || attributes.skipLinkText,
      targetSelector: config?.skipLinkTargetSelector,
    });
  }

  if (features.focusOutline) {
    ensureFocusOutline(attributes.focusOutlineColor || config?.focusOutlineColor);
  }
}

export async function bootstrap(): Promise<void> {
  if (hasBootstrapped) {
    return;
  }

  hasBootstrapped = true;

  const attributes = readScriptAttributes();

  if (!attributes) {
    return;
  }

  const config = await fetchEmbedConfig(attributes);

  await applyFixes(config);
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  bootstrap();
}
