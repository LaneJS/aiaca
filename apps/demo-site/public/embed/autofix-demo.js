(function () {
  const scriptTag = document.currentScript || document.getElementById('aaca-embed-script');

  const state = {
    altImages: [],
    labeledControls: [],
    skipLink: null,
    focusStyle: null,
    contrastStyle: null,
  };

  function dispatchFixEvent(type, details) {
    window.dispatchEvent(
      new CustomEvent('aaca-fix-applied', {
        detail: { type, ...details },
      }),
    );
  }

  function applyAltText() {
    state.altImages = [];
    const images = Array.from(document.querySelectorAll('img')).filter(
      (img) => !img.hasAttribute('alt'),
    );

    images.forEach((img) => {
      state.altImages.push({
        el: img,
        original: img.getAttribute('alt'),
      });
      const suggestion = img.dataset.aiAlt || 'AI-generated alt text from AACA demo';
      img.setAttribute('alt', suggestion);
      
      dispatchFixEvent('alt-text', {
        element: img,
        message: 'Added alt text',
        value: suggestion
      });
    });
  }

  function labelControls() {
    state.labeledControls = [];
    const controls = Array.from(
      document.querySelectorAll('input, textarea, select, button'),
    );

    controls.forEach((control, index) => {
      const labelledBy = control.getAttribute('aria-label');
      const explicitLabel = control.id
        ? document.querySelector(`label[for="${control.id}"]`)
        : null;

      if (labelledBy || explicitLabel) {
        return;
      }

      const suggestion =
        control.dataset.aiLabel ||
        control.getAttribute('placeholder') ||
        `Interactive control ${index + 1}`;

      state.labeledControls.push({
        el: control,
        original: labelledBy,
      });

      control.setAttribute('aria-label', suggestion);

      dispatchFixEvent('aria-label', {
        element: control,
        message: 'Added aria-label',
        value: suggestion
      });
    });
  }

  function injectSkipLink() {
    if (state.skipLink) {
      return;
    }

    const skipLink = document.createElement('a');
    skipLink.textContent = 'Skip to main content';
    skipLink.href = '#main-content';
    skipLink.className = 'aaca-skip-link';
    skipLink.style.position = 'absolute';
    skipLink.style.left = '-999px';
    skipLink.style.top = '8px';
    skipLink.style.background = '#6d28d9';
    skipLink.style.color = '#fff';
    skipLink.style.padding = '10px 14px';
    skipLink.style.borderRadius = '8px';
    skipLink.style.zIndex = '9999';
    skipLink.style.fontWeight = '700';
    skipLink.style.textDecoration = 'none';

    skipLink.addEventListener('focus', () => {
      skipLink.style.left = '12px';
    });

    skipLink.addEventListener('blur', () => {
      skipLink.style.left = '-999px';
    });

    document.body.insertBefore(skipLink, document.body.firstChild);
    state.skipLink = skipLink;
    
    dispatchFixEvent('skip-link', {
        element: skipLink,
        message: 'Injected skip link'
    });
  }

  function applyFocusStyles() {
    if (state.focusStyle) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'aaca-embed-focus-style';
    style.textContent = `
      a:focus, button:focus, input:focus, select:focus, textarea:focus {
        outline: 3px solid #6d28d9 !important;
        outline-offset: 3px !important;
        box-shadow: 0 0 0 3px rgba(109, 40, 217, 0.18);
      }
    `;
    document.head.appendChild(style);
    state.focusStyle = style;

    dispatchFixEvent('focus-style', {
        message: 'Applied focus styles'
    });
  }

  function applyContrastPatch() {
    if (state.contrastStyle) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'aaca-embed-contrast-style';
    style.textContent = `
      body.aaca-autofix-contrast .low-contrast {
        color: #0f172a !important;
        background: #e8edff !important;
        font-weight: 600;
      }

      body.aaca-autofix-contrast .ghost-link,
      body.aaca-autofix-contrast .ghost-button {
        color: #0b3d91 !important;
        border-color: #0b3d91 !important;
        background: #e0e7ff !important;
      }
    `;

    document.head.appendChild(style);
    document.body.classList.add('aaca-autofix-contrast');
    state.contrastStyle = style;

    dispatchFixEvent('contrast', {
        message: 'Enhanced contrast'
    });
  }

  function enable() {
    applyAltText();
    labelControls();
    injectSkipLink();
    applyFocusStyles();
    applyContrastPatch();
    window.dispatchEvent(new CustomEvent('aaca-fixes-enabled'));
  }

  function disable() {
    state.altImages.forEach(({ el, original }) => {
      if (original === null) {
        el.removeAttribute('alt');
      } else {
        el.setAttribute('alt', original);
      }
    });
    state.altImages = [];

    state.labeledControls.forEach(({ el, original }) => {
      if (original === null) {
        el.removeAttribute('aria-label');
      } else {
        el.setAttribute('aria-label', original);
      }
    });
    state.labeledControls = [];

    if (state.skipLink) {
      state.skipLink.remove();
      state.skipLink = null;
    }

    if (state.focusStyle) {
      state.focusStyle.remove();
      state.focusStyle = null;
    }

    if (state.contrastStyle) {
      state.contrastStyle.remove();
      state.contrastStyle = null;
      document.body.classList.remove('aaca-autofix-contrast');
    }
    window.dispatchEvent(new CustomEvent('aaca-fixes-disabled'));
  }

  window.AACAEmbedDemo = {
    enable,
    disable,
  };

  const autostart = !scriptTag || scriptTag.dataset.autostart !== 'false';
  if (autostart) {
    enable();
  }
})();
