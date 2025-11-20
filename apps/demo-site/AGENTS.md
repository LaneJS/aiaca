# AGENTS.md – Demo Site (apps/demo-site)

Scope: all files under `apps/demo-site/**`.

## Intent
This Angular app is **intentionally inaccessible by default** to showcase what the AACA embed script can automatically repair. Keep the broken baseline intact while making the demo convincing and easy to operate.

## Guidelines
- Preserve the contrast failures, missing labels, absent skip link, and removed focus outlines in the raw experience. Only change them if you also update the embed script demo to reflect the new issues/fixes.
- The embed demo script lives in `public/embed/autofix-demo.js`; keep its toggleable `enable/disable` API stable so the UI can flip fixes on and off.
- Content should stay short, marketing-friendly, and explicit about which WCAG rules are being violated and auto-fixed.
- If you add new interactive elements, default them to **bad** accessibility (e.g., no `aria-label`, poor contrast) and then extend the embed script to remediate them.
- Keep docker parity with other frontends (nginx static server, mapped to port 4400).
- Tests should remain lightweight; favor simple render/toggle assertions over heavy integration runs.

## PR Notes
- Summaries should mention both the broken-state demo and the embed-script behavior.
- Include screenshots when you change visuals.
