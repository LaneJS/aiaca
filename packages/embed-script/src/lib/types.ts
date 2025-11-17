export interface AltTextSuggestion {
  /** CSS selector targeting an <img> element to receive the suggestion. */
  selector?: string;
  /** Image source URL to match against when selector is unavailable. */
  imageUrl?: string;
  /** AI provided alt text to apply. */
  altText: string;
}

export interface EmbedConfig {
  siteId: string;
  embedKey?: string;
  autoFixes?: Array<'alt_text' | 'skip_link' | 'focus_outline'>;
  enableSkipLink?: boolean;
  focusOutlineColor?: string;
  skipLinkText?: string;
  skipLinkTargetSelector?: string;
  altTextSuggestions?: AltTextSuggestion[];
}

export interface ScriptAttributes {
  siteId: string;
  embedKey?: string;
  apiBaseUrl: string;
  skipLinkText?: string;
  focusOutlineColor?: string;
  disableAltText?: boolean;
  disableSkipLink?: boolean;
  disableFocusOutline?: boolean;
}

export interface FeatureToggles {
  altText: boolean;
  skipLink: boolean;
  focusOutline: boolean;
}
