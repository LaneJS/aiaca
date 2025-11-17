/*! AACA Embed Script - MVP */
"use strict";
var AACAEmbed = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/lib/bootstrap.ts
  var bootstrap_exports = {};
  __export(bootstrap_exports, {
    bootstrap: () => bootstrap
  });

  // src/lib/alt-text.ts
  function matchesSuggestion(img, suggestion) {
    if (suggestion.selector) {
      try {
        return img.matches(suggestion.selector);
      } catch (error) {
        console.warn("[AACA Embed] Invalid selector in alt text suggestion:", suggestion.selector, error);
      }
    }
    if (suggestion.imageUrl) {
      const imgSrc = img.currentSrc || img.src;
      return Boolean(imgSrc) && imgSrc === suggestion.imageUrl;
    }
    return false;
  }
  function applyAltTextFixes(suggestions = []) {
    const targets = Array.from(
      document.querySelectorAll('img:not([alt]), img[alt=""], img[alt=" "]')
    );
    if (!targets.length || !suggestions.length) {
      return;
    }
    targets.forEach((img) => {
      const suggestion = suggestions.find((candidate) => matchesSuggestion(img, candidate));
      if (suggestion) {
        img.setAttribute("alt", suggestion.altText);
      }
    });
  }

  // src/lib/constants.ts
  var DEFAULT_API_BASE = "/api/v1";
  var DEFAULT_SKIP_LINK_TEXT = "Skip to main content";
  var FOCUS_OUTLINE_COLOR = "#1f6feb";
  var STYLE_MARKER = "data-aaca-embed-style";

  // src/lib/focus-outline.ts
  function ensureFocusOutline(color) {
    if (document.querySelector(`style[${STYLE_MARKER}="focus-outline"]`)) {
      return;
    }
    const style = document.createElement("style");
    style.setAttribute(STYLE_MARKER, "focus-outline");
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

  // src/lib/skip-link.ts
  function hasExistingSkipLink() {
    const links = Array.from(document.querySelectorAll('a[href^="#"]'));
    return links.some((link) => /skip/i.test(link.textContent || "") || link.dataset["aacaSkipLink"] !== void 0);
  }
  function ensureMainTarget(selector) {
    if (selector) {
      const target = document.querySelector(selector);
      if (target) {
        if (!target.id) {
          target.id = "aaca-main-content";
        }
        return `#${target.id}`;
      }
    }
    const main = document.querySelector("main") || document.querySelector('[role="main"]');
    if (main) {
      if (!main.id) {
        main.id = "aaca-main-content";
      }
      return `#${main.id}`;
    }
    return "#aaca-main-content";
  }
  function injectMainIfMissing() {
    if (!document.getElementById("aaca-main-content")) {
      const placeholder = document.createElement("div");
      placeholder.id = "aaca-main-content";
      placeholder.setAttribute("role", "main");
      placeholder.setAttribute("aria-label", "Main content");
      placeholder.style.position = "relative";
      document.body.insertBefore(placeholder, document.body.firstChild);
    }
  }
  function injectSkipLink(options = {}) {
    if (hasExistingSkipLink()) {
      return;
    }
    const href = ensureMainTarget(options.targetSelector);
    const link = document.createElement("a");
    link.textContent = options.text || DEFAULT_SKIP_LINK_TEXT;
    link.href = href;
    link.dataset["aacaSkipLink"] = "true";
    link.className = "aaca-skip-to-content";
    const styles = document.createElement("style");
    styles.setAttribute(STYLE_MARKER, "skip-link");
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
    if (href === "#aaca-main-content") {
      injectMainIfMissing();
    }
  }

  // src/lib/script-loader.ts
  var DEFAULT_FEATURES = {
    altText: true,
    skipLink: true,
    focusOutline: true
  };
  function coerceBooleanFlag(value) {
    if (value === void 0) return void 0;
    return value === "true" || value === "" || value === "1";
  }
  function findScriptElement() {
    var _a;
    const current = document.currentScript;
    if (current instanceof HTMLScriptElement) {
      return current;
    }
    const scripts = Array.from(document.querySelectorAll("script"));
    return (_a = scripts.find((node) => node.dataset["siteId"] !== void 0)) != null ? _a : null;
  }
  function readScriptAttributes() {
    if (typeof document === "undefined") {
      return null;
    }
    const script = findScriptElement();
    if (!script) {
      console.warn("[AACA Embed] Unable to locate embed script tag.");
      return null;
    }
    const siteId = script.dataset["siteId"];
    if (!siteId) {
      console.warn("[AACA Embed] data-site-id is required on the embed script tag.");
      return null;
    }
    return {
      siteId,
      embedKey: script.dataset["embedKey"],
      apiBaseUrl: script.dataset["apiBaseUrl"] || DEFAULT_API_BASE,
      skipLinkText: script.dataset["skipLinkText"],
      focusOutlineColor: script.dataset["focusOutlineColor"],
      disableAltText: coerceBooleanFlag(script.dataset["disableAltText"]),
      disableSkipLink: coerceBooleanFlag(script.dataset["disableSkipLink"]),
      disableFocusOutline: coerceBooleanFlag(script.dataset["disableFocusOutline"])
    };
  }
  async function fetchEmbedConfig(attributes, fetchImpl = fetch) {
    const baseUrl = attributes.apiBaseUrl || DEFAULT_API_BASE;
    let endpoint;
    try {
      const url = new URL(baseUrl, window.location.origin);
      url.pathname = `${url.pathname.replace(/\/$/, "")}/sites/${encodeURIComponent(attributes.siteId)}/embed-config`;
      endpoint = url.toString();
    } catch (error) {
      console.warn("[AACA Embed] Invalid apiBaseUrl; falling back to /api/v1.", error);
      endpoint = `${DEFAULT_API_BASE}/sites/${encodeURIComponent(attributes.siteId)}/embed-config`;
    }
    try {
      const response = await fetchImpl(endpoint, {
        headers: attributes.embedKey ? { "X-Embed-Key": attributes.embedKey } : void 0
      });
      if (!response.ok) {
        console.warn("[AACA Embed] Unable to fetch embed config:", response.status, response.statusText);
        return null;
      }
      const config = await response.json();
      return config;
    } catch (error) {
      console.warn("[AACA Embed] Failed to load embed config:", error);
      return null;
    }
  }
  function deriveFeatures(config, attributes) {
    var _a, _b, _c, _d, _e, _f, _g;
    const fromConfig = {
      altText: (_a = config == null ? void 0 : config.autoFixes) == null ? void 0 : _a.includes("alt_text"),
      skipLink: (_c = config == null ? void 0 : config.enableSkipLink) != null ? _c : (_b = config == null ? void 0 : config.autoFixes) == null ? void 0 : _b.includes("skip_link"),
      focusOutline: (_d = config == null ? void 0 : config.autoFixes) == null ? void 0 : _d.includes("focus_outline")
    };
    const merged = {
      altText: attributes.disableAltText ? false : (_e = fromConfig.altText) != null ? _e : DEFAULT_FEATURES.altText,
      skipLink: attributes.disableSkipLink ? false : (_f = fromConfig.skipLink) != null ? _f : DEFAULT_FEATURES.skipLink,
      focusOutline: attributes.disableFocusOutline ? false : (_g = fromConfig.focusOutline) != null ? _g : DEFAULT_FEATURES.focusOutline
    };
    return merged;
  }

  // src/lib/bootstrap.ts
  var hasBootstrapped = false;
  async function applyFixes(config) {
    const attributes = readScriptAttributes();
    if (!attributes) return;
    const features = deriveFeatures(config, attributes);
    if (features.altText) {
      applyAltTextFixes(config == null ? void 0 : config.altTextSuggestions);
    }
    if (features.skipLink) {
      injectSkipLink({
        text: (config == null ? void 0 : config.skipLinkText) || attributes.skipLinkText,
        targetSelector: config == null ? void 0 : config.skipLinkTargetSelector
      });
    }
    if (features.focusOutline) {
      ensureFocusOutline(attributes.focusOutlineColor || (config == null ? void 0 : config.focusOutlineColor));
    }
  }
  async function bootstrap() {
    if (hasBootstrapped) return;
    hasBootstrapped = true;
    const attributes = readScriptAttributes();
    if (!attributes) return;
    const config = await fetchEmbedConfig(attributes);
    await applyFixes(config);
  }
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    bootstrap();
  }
  return __toCommonJS(bootstrap_exports);
})();
//# sourceMappingURL=autofix.js.map
