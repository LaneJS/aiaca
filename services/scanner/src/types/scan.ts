export type IssueType =
  | 'alt_missing'
  | 'contrast'
  | 'heading_structure'
  | 'form_label'
  | 'link_semantics'
  | 'button_semantics'
  | 'keyboard_focusability';

export type IssueSeverity = 'error' | 'warning';

export interface NormalizedIssue {
  id: string;
  type: IssueType;
  severity: IssueSeverity;
  selector: string;
  description: string;
  helpUrl?: string;
}

export type WaitUntilOption = 'load' | 'domcontentloaded' | 'networkidle' | 'commit';

export interface ScanRequestBody {
  url: string;
  htmlSnapshot?: string;
  waitUntil?: WaitUntilOption;
}

export interface ScanResult {
  url: string;
  issues: NormalizedIssue[];
  rawAxe?: unknown;
}
