Frontend Agent — Accounts list and detail experience
Goal: Deliver accounts IA with real data and actions revenue ops needs.
Scope:
- Accounts list: search/filter (status, tags, MRR, past-due), sortable tables, selection state, bulk actions placeholders where needed.
- Account detail: tabs for contacts, payment methods (redacted for viewer), subscription timeline (history + scheduled changes), invoice history, dunning notes, audit log, activity feed; include inline notes/comments.
- Fetch data via API clients; optimistic updates with rollback for edits; surface backend errors with actionable toasts.
- Accessibility: keyboard/table nav, focus management on tab switches, ARIA labels, skip links, and responsive layout.
Dependencies: Auth/API foundation from 05; backend endpoints for accounts/subscriptions/invoices from 02.
