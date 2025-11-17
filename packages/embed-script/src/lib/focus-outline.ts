import { FOCUS_OUTLINE_COLOR, STYLE_MARKER } from './constants';

export function ensureFocusOutline(color?: string): void {
  if (document.querySelector(`style[${STYLE_MARKER}="focus-outline"]`)) {
    return;
  }

  const style = document.createElement('style');
  style.setAttribute(STYLE_MARKER, 'focus-outline');
  const outlineColor = color || FOCUS_OUTLINE_COLOR;
  style.textContent = `
    :where(button, [role="button"], a, input, select, textarea):focus-visible {
      outline: 2px solid ${outlineColor} !important;
      outline-offset: 2px;
    }
    :where(button, [role="button"], a, input, select, textarea):focus {
      outline: 2px solid ${outlineColor} !important;
      outline-offset: 2px;
    }
  `;

  document.head.appendChild(style);
}
