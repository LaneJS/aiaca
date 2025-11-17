import type { AltTextSuggestion } from './types';

function matchesSuggestion(img: HTMLImageElement, suggestion: AltTextSuggestion): boolean {
  if (suggestion.selector) {
    try {
      return img.matches(suggestion.selector);
    } catch (error) {
      console.warn('[AACA Embed] Invalid selector in alt text suggestion:', suggestion.selector, error);
    }
  }

  if (suggestion.imageUrl) {
    const imgSrc = img.currentSrc || img.src;
    return Boolean(imgSrc) && imgSrc === suggestion.imageUrl;
  }

  return false;
}

export function applyAltTextFixes(suggestions: AltTextSuggestion[] = []): void {
  const targets = Array.from(
    document.querySelectorAll('img:not([alt]), img[alt=""], img[alt=" "]')
  ) as HTMLImageElement[];

  if (!targets.length || !suggestions.length) {
    return;
  }

  targets.forEach((img) => {
    const suggestion = suggestions.find((candidate) => matchesSuggestion(img, candidate));
    if (suggestion) {
      img.setAttribute('alt', suggestion.altText);
    }
  });
}
