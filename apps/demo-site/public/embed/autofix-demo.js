(function () {
  const scriptTag = document.currentScript || document.getElementById('aaca-embed-script');

  const state = {
    altImages: [],
    labeledControls: [],
    skipLink: null,
    focusStyle: null,
    contrastStyle: null,
  };
  const containerSelector = '#demo-site-container';

  function dispatchFixEvent(type, details) {
    window.dispatchEvent(
      new CustomEvent('aaca-fix-applied', {
        detail: { type, ...details },
      }),
    );
  }

  function applyAltText() {
    state.altImages = [];
    const scope = document.querySelector(containerSelector) || document;
    const images = Array.from(scope.querySelectorAll('img')).filter(
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

    return images.length;
  }

  function labelControls() {
    state.labeledControls = [];
    const scope = document.querySelector(containerSelector) || document;
    const controls = Array.from(scope.querySelectorAll('input, textarea, select'));
    let count = 0;

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
      count += 1;

      dispatchFixEvent('aria-label', {
        element: control,
        message: 'Added aria-label',
        value: suggestion
      });
    });

    return count;
  }

  function injectSkipLink() {
    if (state.skipLink) {
      return 0;
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

    return 1;
  }

  function applyFocusStyles() {
    if (state.focusStyle) {
      return 0;
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

    return 1;
  }

  function applyContrastPatch() {
    if (state.contrastStyle) {
      return 0;
    }

    const style = document.createElement('style');
    style.id = 'aaca-embed-contrast-style';
    style.textContent = `
      body.aaca-autofix-contrast #demo-site-container .low-contrast {
        color: #0f172a !important;
        font-weight: 600;
      }

      body.aaca-autofix-contrast #demo-site-container .ghost-link,
      body.aaca-autofix-contrast #demo-site-container .ghost-button {
        color: #065f46 !important;
        border-color: #065f46 !important;
        background: #d1fae5 !important;
      }
    `;

    document.head.appendChild(style);
    document.body.classList.add('aaca-autofix-contrast');
    state.contrastStyle = style;

    dispatchFixEvent('contrast', {
        message: 'Enhanced contrast'
    });

    return 1;
  }

  function enable() {
    const counts = {
      altText: applyAltText(),
      labels: labelControls(),
      skipLink: injectSkipLink(),
      focus: applyFocusStyles(),
      contrast: applyContrastPatch(),
    };

    const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
    window.dispatchEvent(new CustomEvent('aaca-fixes-enabled', { detail: { counts, total } }));
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
