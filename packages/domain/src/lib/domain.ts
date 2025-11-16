import { z } from 'zod';

export enum ScanStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum IssueSeverity {
  CRITICAL = 'CRITICAL',
  SERIOUS = 'SERIOUS',
  MODERATE = 'MODERATE',
  MINOR = 'MINOR',
}

export enum IssueStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  IGNORED = 'IGNORED',
}

export enum ApiKeyType {
  SERVICE = 'SERVICE',
  EMBED = 'EMBED',
  INTERNAL = 'INTERNAL',
}

export enum SuggestionType {
  TEXT = 'TEXT',
  SNIPPET = 'SNIPPET',
  STYLE = 'STYLE',
}

const uuidSchema = z.string().uuid();
const timestampSchema = z.string();

export const userSchema = z.object({
  id: uuidSchema,
  email: z.string().email(),
  passwordHash: z.string().min(10),
  fullName: z.string().optional(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export type User = z.infer<typeof userSchema>;

export const siteSchema = z.object({
  id: uuidSchema,
  userId: uuidSchema,
  name: z.string().min(2),
  baseUrl: z.string().url(),
  isActive: z.boolean(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});
export type Site = z.infer<typeof siteSchema>;

export const scanSchema = z.object({
  id: uuidSchema,
  siteId: uuidSchema,
  status: z.nativeEnum(ScanStatus),
  scanType: z.string().min(3),
  startedAt: timestampSchema.optional(),
  completedAt: timestampSchema.optional(),
  accessibilityScore: z.number().min(0).max(100).optional(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});
export type Scan = z.infer<typeof scanSchema>;

export const scanIssueSchema = z.object({
  id: uuidSchema,
  scanId: uuidSchema,
  issueType: z.string().min(2),
  severity: z.nativeEnum(IssueSeverity),
  status: z.nativeEnum(IssueStatus),
  selector: z.string().optional(),
  htmlContext: z.string().optional(),
  description: z.string().min(2),
  pageUrl: z.string().url().optional(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});
export type ScanIssue = z.infer<typeof scanIssueSchema>;

export const aiSuggestionSchema = z.object({
  id: uuidSchema,
  scanIssueId: uuidSchema,
  suggestionType: z.nativeEnum(SuggestionType),
  suggestion: z.string().min(3),
  rationale: z.string().optional(),
  applied: z.boolean(),
  createdAt: timestampSchema,
});
export type AiSuggestion = z.infer<typeof aiSuggestionSchema>;

export const apiKeySchema = z.object({
  id: uuidSchema,
  userId: uuidSchema,
  keyType: z.nativeEnum(ApiKeyType),
  keyValue: z.string().min(8),
  label: z.string().optional(),
  createdAt: timestampSchema,
  lastUsedAt: timestampSchema.optional(),
  revokedAt: timestampSchema.optional(),
});
export type ApiKey = z.infer<typeof apiKeySchema>;

export const embedKeySchema = z.object({
  id: uuidSchema,
  siteId: uuidSchema,
  keyValue: z.string().min(8),
  createdAt: timestampSchema,
  lastUsedAt: timestampSchema.optional(),
  revokedAt: timestampSchema.optional(),
});
export type EmbedKey = z.infer<typeof embedKeySchema>;

export function validateSite(payload: unknown): Site {
  return siteSchema.parse(payload);
}

export function validateScanIssue(payload: unknown): ScanIssue {
  return scanIssueSchema.parse(payload);
}

export function validateApiKey(payload: unknown): ApiKey {
  return apiKeySchema.parse(payload);
}
