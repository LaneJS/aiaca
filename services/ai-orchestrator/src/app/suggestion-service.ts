import { AiIssueContext, AiSuggestFixRequest, AiSuggestFixResponse } from '@aiaca/domain';
import { logger } from './logger';
import { validateProviderResponse } from '../prompt/response-validator';
import { SuggestionProvider } from '../providers/types';

interface SuggestionServiceOptions {
  primary: SuggestionProvider;
  fallback: SuggestionProvider;
  timeoutMs: number;
  maxIssues: number;
  tenantBudgetTokens?: number;
  forceStub?: boolean;
}

const tenantUsage = new Map<string, number>();

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timed out waiting for AI provider')), timeoutMs);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

export class SuggestionService {
  constructor(private readonly options: SuggestionServiceOptions) {}

  async suggest(request: AiSuggestFixRequest): Promise<AiSuggestFixResponse> {
    const limitedIssues = request.issues.slice(0, Math.max(1, this.options.maxIssues));

    if (limitedIssues.length === 0) {
      throw new Error('At least one issue is required for suggestion generation');
    }

    const limitedRequest: AiSuggestFixRequest = {
      ...request,
      issues: limitedIssues as [AiIssueContext, ...AiIssueContext[]],
    };

    this.guardTenantBudget(limitedRequest);

    const provider = this.shouldUseFallback(limitedRequest) ? this.options.fallback : this.options.primary;

    try {
      logger.info({
        message: 'request.accepted',
        provider: provider.name,
        tenantId: limitedRequest.tenantId,
        issueCount: limitedRequest.issues.length,
      });

      const response = await withTimeout(provider.suggestFixes(limitedRequest), this.options.timeoutMs);
      const validated = validateProviderResponse(response, limitedRequest);
      this.trackUsage(limitedRequest, validated);
      return validated;
    } catch (error) {
      logger.warn({
        message: 'provider.error',
        error: error instanceof Error ? error.message : 'unknown',
        provider: provider.name,
      });
      const fallbackResponse = await this.options.fallback.suggestFixes(limitedRequest);
      return validateProviderResponse(fallbackResponse, limitedRequest);
    }
  }

  private guardTenantBudget(request: AiSuggestFixRequest): void {
    if (!this.options.tenantBudgetTokens || !request.tenantId) {
      return;
    }
    const used = tenantUsage.get(request.tenantId) ?? 0;
    if (used >= this.options.tenantBudgetTokens) {
      throw new Error('Tenant token budget exceeded');
    }
  }

  private trackUsage(request: AiSuggestFixRequest, response: AiSuggestFixResponse): void {
    if (!this.options.tenantBudgetTokens || !request.tenantId) {
      return;
    }
    const used = tenantUsage.get(request.tenantId) ?? 0;
    const consumed = (response.usage?.inputTokens ?? 0) + (response.usage?.outputTokens ?? 0);
    tenantUsage.set(request.tenantId, used + consumed);
  }

  private shouldUseFallback(request: AiSuggestFixRequest): boolean {
    return Boolean(request.useStub || this.options.forceStub);
  }
}
