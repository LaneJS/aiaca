import { AiSuggestFixRequest, AiSuggestFixResponse } from '@aiaca/domain';

export interface SuggestionProvider {
  name: string;
  suggestFixes(request: AiSuggestFixRequest, signal?: AbortSignal): Promise<AiSuggestFixResponse>;
}
