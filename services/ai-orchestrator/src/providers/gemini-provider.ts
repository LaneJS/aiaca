import { AiSuggestFixRequest, AiSuggestFixResponse } from '@aiaca/domain';
import { GoogleGenerativeAI, Schema, SchemaType } from '@google/generative-ai';
import crypto from 'crypto';
import { buildSuggestionPrompt } from '../prompt/prompt-builder';
import { SuggestionProvider } from './types';

const suggestionSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    issueId: { type: SchemaType.STRING },
    selector: { type: SchemaType.STRING },
    explanation: { type: SchemaType.STRING },
    suggestedFix: { type: SchemaType.STRING },
    altText: { type: SchemaType.STRING },
    confidence: { type: SchemaType.NUMBER },
    grounded: { type: SchemaType.BOOLEAN },
  },
  required: ['explanation', 'suggestedFix'],
};

const responseSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    suggestions: { type: SchemaType.ARRAY, items: suggestionSchema },
  },
  required: ['suggestions'],
};

interface GeminiProviderOptions {
  apiKey?: string;
  model: string;
}

export class GeminiSuggestionProvider implements SuggestionProvider {
  name = 'gemini';
  private readonly client?: GoogleGenerativeAI;
  private readonly model?: ReturnType<GoogleGenerativeAI['getGenerativeModel']>;

  constructor(private readonly options: GeminiProviderOptions) {
    if (options.apiKey) {
      this.client = new GoogleGenerativeAI(options.apiKey);
      this.model = this.client.getGenerativeModel({
        model: options.model,
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
          responseSchema,
        },
      });
    }
  }

  async suggestFixes(request: AiSuggestFixRequest, signal?: AbortSignal): Promise<AiSuggestFixResponse> {
    if (!this.model) {
      throw new Error('Gemini provider not configured');
    }

    const prompt = buildSuggestionPrompt(request);
    const result = await this.model.generateContent(
      {
        contents: [
          {
            role: 'user',
            parts: [{ text: `${prompt.system}\n${prompt.user}` }],
          },
        ],
      },
      { signal },
    );

    const text = result.response.text();
    const parsed = JSON.parse(text ?? '{}');
    const requestId =
      result.response.candidates?.[0]?.content?.id || result.response.id || crypto.randomUUID();

    return {
      provider: this.name,
      requestId,
      suggestions: parsed.suggestions ?? [],
      usage: {
        inputTokens: result.response.usageMetadata?.promptTokenCount,
        outputTokens: result.response.usageMetadata?.candidatesTokenCount,
      },
    };
  }
}
