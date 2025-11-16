export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  userId: string;
  email: string;
  token: string;
}

export interface CreateSiteRequest {
  name: string;
  url: string;
}

export interface SiteResponse {
  id: string;
  name: string;
  url: string;
  embedKey: string;
  createdAt: string;
}

export type ScanStatus = 'QUEUED' | 'COMPLETED';
export type IssueSeverity = 'ERROR' | 'WARNING';

export interface ScanIssueDto {
  id: string | null;
  type: string;
  severity: IssueSeverity;
  description: string;
  selector: string | null;
  suggestion?: string | null;
}

export interface ScanSummary {
  id: string;
  createdAt: string;
  status: ScanStatus;
  score: number | null;
}

export interface ScanDetail {
  id: string | null;
  siteId: string | null;
  createdAt: string;
  status: ScanStatus;
  score: number | null;
  issues: ScanIssueDto[];
}

export interface CreateScanRequest {
  pageUrl: string;
}

export interface PublicScanRequest {
  url: string;
}

export interface PublicIssue {
  type: string;
  severity: IssueSeverity;
  description: string;
  selector: string | null;
}

export interface PublicScanResponse {
  url: string;
  score: number | null;
  issues: PublicIssue[];
}

export interface EmbedConfigDto {
  siteId: string;
  embedKey: string;
  autoFixes: string[];
  enableSkipLink: boolean;
}
