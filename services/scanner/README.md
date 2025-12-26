# Scanner Service

The Scanner Service is a specialized microservice responsible for performing accessibility scans on web pages. It uses Playwright to render pages and `axe-core` to detect accessibility violations.

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Fastify
- **Browser Automation**: Playwright
- **Accessibility Engine**: axe-core
- **Build System**: Nx

## Features

- **Full Page Scans**: Renders pages in a headless browser (Chromium) to catch issues that require JavaScript.
- **HTML Snapshot Scanning**: Can scan raw HTML content provided directly.
- **Privacy Focused**: Redacts sensitive HTML content from results before returning them.
- **Performance Metrics**: Tracks scan duration and issue counts.

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- Playwright browsers (`npx playwright install chromium` if running locally outside Docker)

### Configuration

Environment variables:

- `SCANNER_PORT`: Port to listen on (default: 4001).
- `SCANNER_TIMEOUT_MS`: Timeout for scans.

### Development

- **Serve**: `npx nx serve scanner`
- **Build**: `npx nx build scanner`
- **Test**: `npx nx test scanner`

## Endpoints

### `POST /scan`

Performs an accessibility scan.

**Request Body:**

```json
{
  "url": "https://example.com",
  "htmlSnapshot": "optional raw html string"
}
```

**Response:**

```json
{
  "url": "https://example.com",
  "issues": [
    {
      "ruleId": "color-contrast",
      "severity": "serious",
      "message": "Elements must have sufficient color contrast"
      // ...
    }
  ],
  "meta": {
    "issueCount": 5,
    "rawDurationMs": 1200
  }
}
```

### Observability

- `GET /health`: Health check.
- `GET /metrics`: Prometheus metrics.