export interface UserProfile {
  id: string;
  name: string;
  email: string;
}

export interface SiteSummary {
  id: string;
  name: string;
  url: string;
  lastScan?: string;
  score?: number;
  issuesOpen?: number;
  status?: 'healthy' | 'attention' | 'critical';
  embedKey?: string;
}

export interface ScanSummary {
  id: string;
  siteId: string;
  createdAt: string;
  score: number;
  status: 'queued' | 'running' | 'completed' | 'failed';
  issueCount: number;
}

export interface IssueDetail {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  selector?: string;
  suggestion?: string;
  status?: 'open' | 'fixed';
  category?: string;
}

export interface ScanDetail extends ScanSummary {
  issues: IssueDetail[];
  aiSummary?: string;
}

export interface OnboardingStep {
  id: 'site' | 'scan' | 'script';
  label: string;
  description: string;
  completed: boolean;
}
