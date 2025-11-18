import { AiSuggestFixRequest, IssueSeverity } from '@aiaca/domain';
import { GeminiSuggestionProvider } from './gemini-provider';

const mockGenerateContent = jest.fn();

jest.mock('@google/genai', () => {
  const actual = jest.requireActual('@google/genai');

  return {
    ...actual,
    GoogleGenAI: jest.fn(() => ({ models: { generateContent: mockGenerateContent } })),
  };
});

const request: AiSuggestFixRequest = {
  tenantId: 'tenant-123',
  domSnapshot: '<main></main>',
  issues: [
    {
      id: 'issue-1',
      type: 'alt_missing',
      severity: IssueSeverity.MODERATE,
      description: 'Image missing alt text',
      selector: 'img.hero',
      htmlSnippet: '<img class="hero" src="/hero.jpg">',
    },
  ],
};

describe('GeminiSuggestionProvider', () => {
  beforeEach(() => {
    mockGenerateContent.mockReset();
  });

  it('throws when the provider is not configured', async () => {
    const provider = new GeminiSuggestionProvider({ model: 'gemini-2.0-flash-exp' });

    await expect(provider.suggestFixes(request)).rejects.toThrow('Gemini provider not configured');
  });

  it('uses Google GenAI with structured output and returns parsed suggestions', async () => {
    const controller = new AbortController();
    const provider = new GeminiSuggestionProvider({ apiKey: 'test-key', model: 'gemini-2.0-flash' });

    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({
        suggestions: [
          {
            issueId: 'issue-1',
            selector: 'img.hero',
            explanation: 'Images need concise alt text.',
            suggestedFix: 'Add descriptive alt text.',
            grounded: true,
          },
        ],
      }),
      usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 5 },
    });

    const response = await provider.suggestFixes(request, controller.signal);

    expect(mockGenerateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gemini-2.0-flash',
        contents: expect.arrayContaining([
          expect.objectContaining({ role: 'user' }),
        ]),
        config: expect.objectContaining({
          responseMimeType: 'application/json',
          responseSchema: expect.any(Object),
          temperature: 0.2,
          abortSignal: controller.signal,
        }),
      }),
    );

    expect(response.provider).toBe('gemini');
    expect(response.suggestions).toHaveLength(1);
    expect(response.usage).toEqual({ inputTokens: 10, outputTokens: 5 });
  });
});
