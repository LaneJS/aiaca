import { AiSuggestFixRequest, AiSuggestFixResponse } from '@aiaca/domain';
import { GoogleGenAI, Schema, Type } from '@google/genai';
import crypto from 'crypto';
import { buildSuggestionPrompt } from '../prompt/prompt-builder';
import { SuggestionProvider } from './types';

const suggestionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    issueId: { type: Type.STRING },
    selector: { type: Type.STRING },
    explanation: { type: Type.STRING },
    suggestedFix: { type: Type.STRING },
    altText: { type: Type.STRING },
    confidence: { type: Type.NUMBER },
    grounded: { type: Type.BOOLEAN },
  },
  required: ['explanation', 'suggestedFix'],
};

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    suggestions: { type: Type.ARRAY, items: suggestionSchema },
  },
  required: ['suggestions'],
};

interface GeminiProviderOptions {
  apiKey?: string;
  model: string;
}

export class GeminiSuggestionProvider implements SuggestionProvider {
  name = 'gemini';
  private readonly client?: GoogleGenAI;

  constructor(private readonly options: GeminiProviderOptions) {
    if (options.apiKey) {
      this.client = new GoogleGenAI({ vertexai: false, apiKey: options.apiKey });
    }
  }

  async suggestFixes(request: AiSuggestFixRequest, signal?: AbortSignal): Promise<AiSuggestFixResponse> {
    if (!this.client) {
      throw new Error('Gemini provider not configured');
    }

    const prompt = buildSuggestionPrompt(request);

    const result = await this.client.models.generateContent({
      model: this.options.model,
      contents: [
        {
          role: 'user',
          parts: [{ text: `${prompt.system}\n${prompt.user}` }],
        },
      ],
      config: {
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema,
        abortSignal: signal,
      },
    });

    const text = result.text;
    const parsed = JSON.parse(text ?? '{}');
    const requestId = crypto.randomUUID();

    return {
      provider: this.name,
      requestId,
      suggestions: parsed.suggestions ?? [],
      usage: {
        inputTokens: result.usageMetadata?.promptTokenCount,
        outputTokens: result.usageMetadata?.candidatesTokenCount,
      },
    };
  }
}
