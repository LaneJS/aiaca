# Uptime & Monitoring Setup

- **Date:** 2025-11-17
- **Owner:** DevOps (PagerDuty rotation: `aaca-devops`)
- **Tooling:** UptimeRobot (HTTP(s) monitors), Prometheus + Grafana dashboards for latency/throughput.

## Uptime Monitors
| Endpoint | Frequency | Alert Threshold | Notes |
| --- | --- | --- | --- |
| https://api.aaca.com/health | 60s | 2 failures → email + Slack `#ops` | Mirrors Spring Boot health; includes DB check. |
| https://scanner.aaca.com/health | 60s | 2 failures → email + Slack `#ops` | Verifies scanner container reachable. |
| https://www.aaca.com/ | 60s | 2 failures → email only | Marketing uptime; tracked for CDN issues. |
| https://app.aaca.com/ | 60s | 2 failures → email + PagerDuty low | Dashboard shell availability. |

- Alerts routed via UptimeRobot webhooks → Slack `#ops` and PagerDuty (low-urgency for dashboard marketing).

## Metrics Dashboards
- **Prometheus scrape targets:** API (`/prometheus`), scanner (`/metrics`), AI orchestrator (`/metrics`).
- **Grafana dashboards:**
  - `a11y-overview`: requests/sec, p95 latency per service, error rate.
  - `scan-pipeline`: scan duration histogram, scanner → API queue latency, AI suggestion count per scan.
- Alert rules (Grafana):
  - API p95 latency > 800ms for 5m → Slack `#ops` (warning).
  - Scan failure rate > 5% over 10m → PagerDuty (critical).
  - AI orchestrator error count > 10/min → Slack `#ml-infra` (warning).

## Logging
- Centralized JSON logs shipped to Loki via promtail (compose job). Query examples:
  - `{service="api"} |= "ERROR"`
  - `{service="scanner"} |= "scan" |= "failed"`

## Maintenance & DR
- Monitors paused during scheduled maintenance windows announced in `#ops`.
- For incident retrospectives, capture Grafana snapshots and include in `docs/reports/<date>/incident-<id>.md`.
