import { AiSuggestFixRequest, AiSuggestFixResponse, IssueSeverity } from '@aiaca/domain';
import { validateProviderResponse } from './response-validator';

const baseRequest: AiSuggestFixRequest = {
  tenantId: 'tenant-1',
  issues: [
    {
      id: 'issue-1',
      type: 'alt_missing',
      severity: IssueSeverity.MODERATE,
      description: 'Missing alt text',
      selector: 'img.logo',
      htmlSnippet: '<img src="logo.png">',
    },
  ],
};

describe('validateProviderResponse', () => {
  it('filters suggestions that reference unknown selectors', () => {
    const raw: AiSuggestFixResponse = {
      provider: 'gemini',
      requestId: 'req-1',
      usage: { inputTokens: 10, outputTokens: 5 },
      suggestions: [
        {
          issueId: 'issue-1',
          selector: 'img.logo',
          explanation: 'Add alt text',
          suggestedFix: 'alt="Logo"',
          altText: 'Company logo',
          grounded: true,
        },
        {
          issueId: 'issue-999',
          selector: '.invented',
          explanation: 'Bad fix',
          suggestedFix: 'none',
          grounded: false,
        },
      ],
    };

    const result = validateProviderResponse(raw, baseRequest);
    expect(result.suggestions).toHaveLength(1);
    expect(result.suggestions[0].selector).toBe('img.logo');
  });

  it('drops altText when the issue is not image-related', () => {
    const request = {
      ...baseRequest,
      issues: [
        {
          ...baseRequest.issues[0],
          id: 'issue-2',
          type: 'link_text',
          selector: 'a.more',
        },
      ],
    };

    const raw: AiSuggestFixResponse = {
      provider: 'gemini',
      requestId: 'req-2',
      suggestions: [
        {
          issueId: 'issue-2',
          selector: 'a.more',
          explanation: 'Clarify link text',
          suggestedFix: 'Use “View pricing”',
          altText: 'Not relevant',
          grounded: true,
        },
      ],
    } as AiSuggestFixResponse;

    const result = validateProviderResponse(raw, request as any);
    expect(result.suggestions[0].altText).toBeUndefined();
  });
});
