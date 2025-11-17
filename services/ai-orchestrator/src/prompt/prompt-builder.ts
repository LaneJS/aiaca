import { AiIssueContext, AiSuggestFixRequest } from '@aiaca/domain';

export interface BuiltPrompt {
  system: string;
  user: string;
}

const MAX_SNIPPET_LENGTH = 800;

function describeIssue(issue: AiIssueContext): string {
  const snippet = issue.htmlSnippet?.slice(0, MAX_SNIPPET_LENGTH);
  const selectorPart = issue.selector ? `Selector: ${issue.selector}. ` : '';
  const snippetPart = snippet ? `HTML: ${snippet}` : '';
  return `- Type: ${issue.type}. Severity: ${issue.severity}. ${selectorPart}Description: ${issue.description}. ${snippetPart}`;
}

export function buildSuggestionPrompt(request: AiSuggestFixRequest): BuiltPrompt {
  const issueLines = request.issues.map(describeIssue).join('\n');
  const domHint = request.domSnapshot ? 'You also have a DOM snapshot snippet. Only reference elements present in the snippets provided.' : '';

  const system = [
    'You are an accessibility engineering assistant.',
    'Return concise, actionable fixes grounded in the provided HTML snippets.',
    'Limit recommendations to the supplied selectors and snippets—do not invent new DOM nodes.',
    'Provide code or textual changes that can be applied safely.',
  ].join(' ');

  const user = [
    'Generate JSON suggestions for these accessibility issues.',
    'Fields: issueId (if provided), selector, explanation, suggestedFix, optional altText for images, confidence (0-1), grounded (boolean).',
    'Respect WCAG AA guidance for alt text, link text clarity, and color contrast.',
    domHint,
    'Issues:',
    issueLines,
  ].join('\n');

  return { system, user };
}
