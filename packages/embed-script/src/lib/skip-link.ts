import { DEFAULT_SKIP_LINK_TEXT, STYLE_MARKER } from './constants';

function hasExistingSkipLink(): boolean {
  const links = Array.from(document.querySelectorAll('a[href^="#"]')) as HTMLAnchorElement[];
  return links.some((link) => /skip/i.test(link.textContent || '') || link.dataset['aacaSkipLink'] !== undefined);
}

function ensureMainTarget(selector?: string): string {
  if (selector) {
    const target = document.querySelector(selector) as HTMLElement | null;
    if (target) {
      if (!target.id) {
        target.id = 'aaca-main-content';
      }
      return `#${target.id}`;
    }
  }

  const main = (document.querySelector('main') || document.querySelector('[role="main"]')) as HTMLElement | null;
  if (main) {
    if (!main.id) {
      main.id = 'aaca-main-content';
    }
    return `#${main.id}`;
  }

  return '#aaca-main-content';
}

function injectMainIfMissing(): void {
  if (!document.getElementById('aaca-main-content')) {
    const placeholder = document.createElement('div');
    placeholder.id = 'aaca-main-content';
    placeholder.setAttribute('role', 'main');
    placeholder.setAttribute('aria-label', 'Main content');
    placeholder.style.position = 'relative';
    document.body.insertBefore(placeholder, document.body.firstChild);
  }
}

export function injectSkipLink(options: { text?: string; targetSelector?: string } = {}): void {
  if (hasExistingSkipLink()) {
    return;
  }

  const href = ensureMainTarget(options.targetSelector);
  const link = document.createElement('a');
  link.textContent = options.text || DEFAULT_SKIP_LINK_TEXT;
  link.href = href;
  link.dataset['aacaSkipLink'] = 'true';
  link.className = 'aaca-skip-to-content';

  const styles = document.createElement('style');
  styles.setAttribute(STYLE_MARKER, 'skip-link');
  styles.textContent = `
    .aaca-skip-to-content {
      position: absolute;
      left: 8px;
      top: -40px;
      padding: 8px 12px;
      background: #0f172a;
      color: #ffffff;
      z-index: 10000;
      border-radius: 4px;
      text-decoration: none;
      transition: top 0.2s ease;
    }
    .aaca-skip-to-content:focus,
    .aaca-skip-to-content:active {
      top: 8px;
      outline: 2px solid #ffffff;
    }
  `;

  document.head.appendChild(styles);
  document.body.insertBefore(link, document.body.firstChild);

  if (href === '#aaca-main-content') {
    injectMainIfMissing();
  }
}
