export interface UserProfile {
  id: string;
  name: string;
  email: string;
  subscriptionStatus?: 'NONE' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED' | 'TRIALING';
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

export interface EmbedConfig {
  siteId: string;
  features?: Record<string, unknown>;
  updatedAt?: string;
}

export interface SiteSchedule {
  cadence: 'daily' | 'weekly' | 'monthly';
  timeUtc: string;
  timezone: string;
  windowStart?: string;
  windowEnd?: string;
  nextRun?: string;
  lastRun?: string;
  isActive: boolean;
}

export interface ScanShareLink {
  link: string;
  expiresAt?: string;
}

export interface NotificationSettings {
  emailEnabled: boolean;
  slackWebhookUrl?: string;
  webhookUrl?: string;
  digestCadence?: 'daily' | 'weekly';
}

export interface Plan {
  id: string;
  code: string;
  name: string;
  description?: string;
  status?: string;
  metadata?: Record<string, unknown>;
}

export interface Price {
  id: string;
  planId: string;
  amount: number;
  currency: string;
  interval: string;
  intervalCount: number;
  trialPeriodDays?: number;
  active: boolean;
}

export interface Subscription {
  id: string;
  accountId: string;
  status: string;
  items?: SubscriptionItem[];
}

export interface SubscriptionItem {
  priceId: string;
  quantity?: number;
}
