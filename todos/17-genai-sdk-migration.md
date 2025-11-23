# Section 17 – AI Orchestrator: Migrate to @google/genai SDK

You are the AI Orchestrator Migration Agent.

## Objective
Migrate the AI orchestrator service from the deprecated `@google/generative-ai` library to the official `@google/genai` SDK (v1.29.1+) to ensure continued support and access to latest Gemini models including Gemini 2.0+.

## Context & Urgency
- **Current State**: Using `@google/generative-ai@0.24.1` (deprecated, support ends August 31, 2025)
- **Target State**: Use `@google/genai@1.29.1+` (official, GA since May 2025)
- **Impact**: The legacy library blocks access to Gemini 2.0+ models and will stop receiving updates after November 30, 2025
- **Documentation**: https://ai.google.dev/gemini-api/docs/sdks/overview

## Deliverables

### 1. Package Migration
- [ ] Update `package.json` to replace `@google/generative-ai` with `@google/genai`
- [ ] Run `npm install` to update dependencies and lockfile
- [ ] Verify no other services depend on the old package

### 2. Code Updates in `services/ai-orchestrator/src/providers/gemini-provider.ts`

**Key API Changes:**
```typescript
// OLD (@google/generative-ai)
import { GoogleGenerativeAI } from '@google/generative-ai';
const client = new GoogleGenerativeAI(apiKey);
const model = client.getGenerativeModel({ model: 'gemini-1.5-pro' });
const result = await model.generateContent(prompt);

// NEW (@google/genai)
import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ vertexai: false, apiKey: apiKey });
const response = await ai.models.generateContent({
  model: 'gemini-2.0-flash-exp',
  contents: prompt,
});
```

**Changes Required:**
- [ ] Update import from `GoogleGenerativeAI` → `GoogleGenAI`
- [ ] Update initialization to pass config object: `{ vertexai: false, apiKey }`
- [ ] Update content generation to use `ai.models.generateContent()` instead of `model.generateContent()`
- [ ] Update request structure to pass `model` and `contents` in single object
- [ ] Verify schema validation and structured output compatibility
- [ ] Update response parsing (API should be compatible)

### 3. Model Configuration
- [ ] Update default model from `gemini-1.5-pro` to `gemini-2.0-flash-exp` in `packages/config/src/lib/config.ts`
- [ ] Add support for additional models: `gemini-2.0-flash`, `gemini-1.5-pro`, `gemini-1.5-flash`
- [ ] Document available models in `services/ai-orchestrator/README.md`

### 4. Testing & Validation
- [ ] Update unit tests for `GeminiSuggestionProvider`
- [ ] Test with real Gemini API key to verify:
  - Successful connection and authentication
  - Content generation works with new API
  - Structured output (JSON schema) is respected
  - Token usage metadata is captured correctly
- [ ] Test fallback behavior when API key is missing
- [ ] Verify error handling for API failures

### 5. Documentation Updates
- [ ] Update `services/ai-orchestrator/README.md` with new SDK info
- [ ] Update `NEXT_STEPS.md` to reflect correct package name
- [ ] Add migration notes to `AGENTS.md` if applicable

## Implementation Steps

### Step 1: Install New Package
```bash
npm uninstall @google/generative-ai
npm install @google/genai@latest
```

### Step 2: Update Provider Implementation
File: `services/ai-orchestrator/src/providers/gemini-provider.ts`

Key changes:
1. Import statement
2. Client initialization in constructor
3. `generateContent` call in `suggestFixes` method
4. Response parsing (should be compatible)

### Step 3: Update Configuration
File: `packages/config/src/lib/config.ts`
- Change default model to `gemini-2.0-flash-exp`

File: `.env`
- Update `GEMINI_MODEL=gemini-2.0-flash-exp` (or desired model)

### Step 4: Test & Verify
```bash
# Rebuild services
docker-compose build ai-orchestrator

# Restart with new code
docker-compose up -d ai-orchestrator

# Check logs for successful startup
docker logs aaca-ai-orchestrator

# Test end-to-end scan with AI suggestions
# Visit http://localhost:4200 and run a scan
```

## Reference Documentation

### Official Google Resources
- **SDK Overview**: https://ai.google.dev/gemini-api/docs/sdks/overview
- **Node.js Quickstart**: https://ai.google.dev/gemini-api/docs/sdks/overview#googlegenaisdk_quickstart-nodejs_genai_sdk
- **Migration Guide**: https://ai.google.dev/gemini-api/docs/sdks/migration
- **Available Models**: https://ai.google.dev/gemini-api/docs/models/gemini

### Key Differences
- **Package Name**: `@google/generative-ai` → `@google/genai`
- **Client Class**: `GoogleGenerativeAI` → `GoogleGenAI`
- **Initialization**: Now requires config object with `vertexai` and `apiKey`
- **Content Generation**: `model.generateContent()` → `ai.models.generateContent()`
- **Model Support**: Access to Gemini 2.0+ models (2.0-flash-exp, 2.0-flash)

## Validation Criteria
- [ ] AI orchestrator starts without errors
- [ ] Logs show correct SDK version and model being used
- [ ] Real scans return AI-generated suggestions (not stub)
- [ ] Suggestions are contextual and unique per scan
- [ ] Token usage is tracked correctly
- [ ] No breaking changes to API contract with `services/api`

## Rollback Plan
If migration fails:
1. Revert package.json changes
2. Restore original gemini-provider.ts code
3. Run `npm install` to restore old package
4. Rebuild and restart containers

## Success Metrics
- ✅ AI orchestrator successfully uses `@google/genai@1.29.1+`
- ✅ Gemini 2.0 models accessible (2.0-flash-exp, 2.0-flash)
- ✅ All existing functionality preserved
- ✅ Improved performance/reliability with official SDK
- ✅ Future-proof for continued Google support

## Notes
- The new SDK supports both Gemini Developer API (via API key) and Vertex AI (via service account)
- Current implementation uses Gemini Developer API; Vertex AI migration is optional future enhancement
- The API surface is similar but not identical; code changes are required
- Structured output and JSON schema validation should remain compatible
