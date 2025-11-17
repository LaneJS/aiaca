import { AiSuggestFixRequest, AiSuggestFixResponse, IssueSeverity } from '@aiaca/domain';
import crypto from 'crypto';
import { SuggestionProvider } from './types';

const defaultAlt = 'Descriptive image alt text';

export class StubSuggestionProvider implements SuggestionProvider {
  name = 'stub';

  async suggestFixes(request: AiSuggestFixRequest): Promise<AiSuggestFixResponse> {
    const suggestions = request.issues.map((issue) => ({
      issueId: issue.id,
      selector: issue.selector,
      explanation: this.buildExplanation(issue.type),
      suggestedFix: this.buildFix(issue),
      altText: issue.type.toLowerCase().includes('alt') ? defaultAlt : undefined,
      confidence: 0.42,
      grounded: true,
    }));

    return {
      provider: this.name,
      requestId: crypto.randomUUID(),
      suggestions,
      usage: { inputTokens: 0, outputTokens: 0 },
    };
  }

  private buildExplanation(issueType: string): string {
    if (issueType.toLowerCase().includes('alt')) {
      return 'Images need concise alt text so screen readers can describe them.';
    }
    if (issueType.toLowerCase().includes('contrast')) {
      return 'Low contrast makes text hard to read; adjust colors to meet WCAG AA ratios.';
    }
    if (issueType.toLowerCase().includes('link')) {
      return 'Links should describe their destination to keyboard and screen reader users.';
    }
    return 'Address the accessibility concern with a small, safe HTML or CSS adjustment.';
  }

  private buildFix(issue: AiSuggestFixRequest['issues'][number]): string {
    const type = issue.type.toLowerCase();
    if (type.includes('alt')) {
      return issue.selector
        ? `Add an alt attribute to ${issue.selector} with a short description.`
        : 'Add concise alt text to the image element.';
    }
    if (type.includes('contrast')) {
      return 'Use a darker text color such as #1f2937 on the current background.';
    }
    if (type.includes('link')) {
      return 'Replace “Click here” with a descriptive label such as “View pricing details.”';
    }
    if (issue.severity === IssueSeverity.CRITICAL) {
      return 'Resolve the issue with a minimal code change that preserves semantics.';
    }
    return 'Apply a targeted fix to improve accessibility without changing layout.';
  }
}
