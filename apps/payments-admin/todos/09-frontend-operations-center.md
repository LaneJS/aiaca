Frontend Agent — Operations center (dunning, disputes, webhooks)
Goal: Provide operational queues with controls tied to backend dunning/dispute/webhook data.
Scope:
- Dunning queue: past-due accounts/invoices table with severity, days past due, balance; bulk reminder actions with template selection; retry charge actions; log touchpoints and promise-to-pay.
- Dispute tracker: list disputes with deadlines, evidence status, and outcomes; upload/reference evidence packet links; status transitions via backend endpoints.
- Webhook monitor: show delivery attempts, status, last error; allow replay where backend permits; display signature verification status banner.
- Download/export center hooks for CSV/JSON where available.
- Accessibility and feedback: announce queue updates, handle long-running actions with progress indicators, maintain keyboard navigation.
Dependencies: Backend work from 03; foundation from 05; ensure routes use provideRouter/standalone components.
