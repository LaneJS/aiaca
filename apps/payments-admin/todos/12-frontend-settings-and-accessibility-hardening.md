Frontend Agent — Settings, governance, and accessibility hardening
Goal: Finish settings surfaces and ensure production-ready accessibility and environment cues.
Scope:
- Settings pages: role management UI (viewer/operator/admin with least-privilege defaults), email templates editor/viewer, tax settings, webhook/Stripe configuration status, environment indicator banner (e.g., staging/prod safeguards).
- Apply redaction for read-only roles and safeguards to prevent destructive actions without confirmation; highlight impersonation safeguards if present.
- Accessibility sweep: ARIA labels, focus order, keyboard nav for tables/dialogs, skip links, reduced motion respect, high-contrast checks; ensure toast announcements are polite.
- Remove any remaining mock/demo fallbacks; ensure error states are explicit and actionable; add environment-driven banners for restricted modes.
- Final UX polish: consistent loading/empty/error states across routes, printable exports where relevant.
Dependencies: All prior frontend tasks complete; relies on backend readiness from 01–04.
