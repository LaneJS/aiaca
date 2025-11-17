import { IssueSeverity } from '@aiaca/domain';
import { buildSuggestionPrompt } from './prompt-builder';

describe('buildSuggestionPrompt', () => {
  it('includes issue details and DOM hints', () => {
    const prompt = buildSuggestionPrompt({
      domSnapshot: '<main>Example</main>',
      issues: [
        {
          id: '1',
          type: 'alt_missing',
          severity: IssueSeverity.MODERATE,
          description: 'Image missing alt',
          selector: 'img.hero',
          htmlSnippet: '<img src="hero.jpg">',
        },
      ],
    });

    expect(prompt.system).toContain('accessibility');
    expect(prompt.user).toContain('Issues:');
    expect(prompt.user).toContain('img.hero');
    expect(prompt.user).toContain('DOM snapshot');
  });
});
