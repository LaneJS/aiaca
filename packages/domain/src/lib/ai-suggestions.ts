import { z } from 'zod';
import { IssueSeverity } from './domain';

export const aiIssueContextSchema = z.object({
  id: z.string().optional(),
  type: z.string().min(2),
  severity: z.nativeEnum(IssueSeverity),
  description: z.string().min(3),
  selector: z.string().optional(),
  htmlSnippet: z.string().optional(),
  pageUrl: z.string().url().optional(),
});

export type AiIssueContext = z.infer<typeof aiIssueContextSchema>;

export const aiSuggestFixRequestSchema = z.object({
  tenantId: z.string().optional(),
  pageUrl: z.string().url().optional(),
  domSnapshot: z.string().optional(),
  issues: z.array(aiIssueContextSchema).nonempty(),
  useStub: z.boolean().optional(),
});

export type AiSuggestFixRequest = z.infer<typeof aiSuggestFixRequestSchema>;

export const aiSuggestedFixSchema = z.object({
  issueId: z.string().optional(),
  selector: z.string().optional(),
  explanation: z.string().min(5),
  suggestedFix: z.string().min(3),
  altText: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
  grounded: z.boolean().default(false),
});

export type AiSuggestedFix = z.infer<typeof aiSuggestedFixSchema>;

export const tokenUsageSchema = z.object({
  inputTokens: z.number().optional(),
  outputTokens: z.number().optional(),
});

export type TokenUsage = z.infer<typeof tokenUsageSchema>;

export const aiSuggestFixResponseSchema = z.object({
  provider: z.string(),
  requestId: z.string(),
  suggestions: z.array(aiSuggestedFixSchema),
  usage: tokenUsageSchema.optional(),
});

export type AiSuggestFixResponse = z.infer<typeof aiSuggestFixResponseSchema>;
