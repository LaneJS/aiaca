import { AiSuggestFixRequest, AiSuggestFixResponse } from '@aiaca/domain';
import { GoogleGenAI, Schema, Type } from '@google/genai';
import crypto from 'crypto';
import { buildSuggestionPrompt } from '../prompt/prompt-builder';
import { SuggestionProvider } from './types';
import { logger } from '../app/logger';

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

/**
 * Strips markdown code block wrappers from JSON responses.
 * Handles cases where LLMs wrap JSON in ```json or ``` blocks.
 */
function stripMarkdownCodeBlocks(text: string): string {
  // Remove ```json\n...\n``` or ```\n...\n``` wrappers
  const codeBlockPattern = /^```(?:json)?\s*\n?([\s\S]*?)\n?```$/;
  const match = text.trim().match(codeBlockPattern);
  return match ? match[1].trim() : text.trim();
}

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

    const payload = {
      model: this.options.model,
      contents: [
        {
          role: 'user',
          parts: [{ text: `${prompt.system}\n${prompt.user}` }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema,
      },
    };

    const result = await (this.client.models.generateContent as (
      params: typeof payload,
      options?: { signal?: AbortSignal },
    ) => Promise<any>)(payload, { signal });

    const rawText =
      result.text ??
      result.candidates?.flatMap((candidate) => candidate.content?.parts?.map((part) => part.text ?? '') ?? []).join('') ??
        '';

    logger.debug({
      message: 'gemini.raw_response',
      rawText,
      usageMetadata: result.usageMetadata,
    });

    const cleanedText = stripMarkdownCodeBlocks(rawText);

    logger.debug({
      message: 'gemini.cleaned_response',
      cleanedText,
    });

    const parsed = JSON.parse(cleanedText || '{}');
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
