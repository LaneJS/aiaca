Frontend Agent — Reporting dashboards and audit logs
Goal: Surface revenue/collections KPIs and auditable trails with exports.
Scope:
- Dashboards: MRR/ARR, net revenue vs refunds, invoice aging buckets, failed payment cohorts, top debtors, plan mix; charts with accessible labels/legends and responsive layouts.
- Reporting filters (date ranges, account segments, plan, status) with persisted query params for sharing.
- Export buttons for CSV where backend provides; disable or show hints if missing.
- Global + per-entity audit log views with filters (entity/user/date/action), redaction for sensitive fields, CSV export triggers.
- Performance/accessibility: virtualized tables as needed, keyboard nav, focus outlines, announce export completion/errors.
Dependencies: Metrics/report endpoints + audit log API from 02–03; foundation from 05.
