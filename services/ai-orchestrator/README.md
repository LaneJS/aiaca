# AI Orchestrator

The AI Orchestrator service generates accessibility fixes and suggestions using Large Language Models (LLMs). It acts as an abstraction layer between the core platform and AI providers (currently Google Gemini).

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Fastify
- **Build System**: Nx
- **AI Provider**: Google Gemini (via `GeminiSuggestionProvider`)

## Features

- **Fix Suggestions**: Generates code fixes for detected accessibility issues.
- **Provider Abstraction**: Supports swapping AI providers or using a stub provider for testing.
- **Resilience**: Handles timeouts and failures gracefully.

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- Gemini API Key (for production/live AI mode)

### Configuration

Environment variables (typically set in `.env`):

- `AI_ORCHESTRATOR_PORT`: Port to listen on (default: 4002)
- `GEMINI_API_KEY`: API key for Google Gemini.
- `GEMINI_MODEL`: Model to use (e.g., `gemini-1.5-flash`).
- `AI_ORCHESTRATOR_USE_STUB`: Set to `true` to use the offline stub provider.

### Development

- **Serve**: `npx nx serve ai-orchestrator`
- **Build**: `npx nx build ai-orchestrator`
- **Test**: `npx nx test ai-orchestrator`

## Endpoints

### `POST /suggest-fixes`

Generates suggestions for a list of accessibility issues.

**Request Body:**

```json
{
  "issues": [
    {
      "id": "issue-id",
      "ruleId": "image-alt",
      "html": "<img src='cat.jpg'>",
      "message": "Images must have alt text"
    }
  ]
}
```

**Response:**

```json
{
  "suggestions": [
    {
      "issueId": "issue-id",
      "fix": "<img src='cat.jpg' alt='A cute cat'>",
      "explanation": "Added alt text to the image."
    }
  ]
}
```

### Observability

- `GET /health`: Health check.
- `GET /metrics`: Prometheus metrics.