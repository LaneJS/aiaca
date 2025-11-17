import type { EmbedConfig, FeatureToggles, ScriptAttributes } from './types';
export declare function readScriptAttributes(): ScriptAttributes | null;
export declare function fetchEmbedConfig(attributes: ScriptAttributes, fetchImpl?: typeof fetch): Promise<EmbedConfig | null>;
export declare function deriveFeatures(config: EmbedConfig | null, attributes: ScriptAttributes): FeatureToggles;
