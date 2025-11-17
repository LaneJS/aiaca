import {
  AiSuggestFixRequest,
  AiSuggestFixResponse,
  aiSuggestFixResponseSchema,
  AiSuggestedFix,
} from '@aiaca/domain';

function isImageIssue(issueType: string): boolean {
  return issueType.toLowerCase().includes('alt') || issueType.toLowerCase().includes('image');
}

export function validateProviderResponse(
  raw: unknown,
  request: AiSuggestFixRequest,
): AiSuggestFixResponse {
  const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
  const validated = aiSuggestFixResponseSchema.parse(parsed);
  const allowedSelectors = new Set(request.issues.map((issue) => issue.selector).filter(Boolean));
  const allowedIds = new Set(request.issues.map((issue) => issue.id).filter(Boolean));

  const filteredSuggestions: AiSuggestedFix[] = validated.suggestions
    .filter((suggestion) => {
      if (suggestion.selector && !allowedSelectors.has(suggestion.selector)) {
        return false;
      }
      if (suggestion.issueId && !allowedIds.has(suggestion.issueId)) {
        return false;
      }
      return true;
    })
    .map((suggestion) => {
      const matchingIssue = request.issues.find(
        (issue) => (suggestion.issueId && issue.id === suggestion.issueId) || issue.selector === suggestion.selector,
      );
      const grounded = Boolean(matchingIssue?.htmlSnippet) || suggestion.grounded;

      if (suggestion.altText && matchingIssue && !isImageIssue(matchingIssue.type)) {
        return { ...suggestion, altText: undefined, grounded };
      }

      return { ...suggestion, grounded };
    });

  return { ...validated, suggestions: filteredSuggestions };
}
