import type { AxeResults, ImpactValue } from 'axe-core';
import { type IssueSeverity, type IssueType, type NormalizedIssue } from '../types/scan';

const RULE_TYPE_MAP: Record<string, IssueType> = {
  'image-alt': 'alt_missing',
  'area-alt': 'alt_missing',
  'aria-allowed-attr': 'form_label',
  label: 'form_label',
  'form-field-multiple-labels': 'form_label',
  'color-contrast': 'contrast',
  'heading-order': 'heading_structure',
  'page-has-heading-one': 'heading_structure',
  'link-name': 'link_semantics',
  'button-name': 'button_semantics',
  'aria-input-field-name': 'keyboard_focusability',
};

const severityFromImpact = (impact?: ImpactValue): IssueSeverity => {
  if (impact === 'critical' || impact === 'serious') {
    return 'error';
  }
  return 'warning';
};

const selectorFromTargets = (targets: AxeResults['violations'][number]['nodes'][number]['target']) => {
  if (!targets || targets.length === 0) return 'unknown';
  const first = targets[0];
  return Array.isArray(first) ? first.join(' ') : String(first);
};

export const normalizeAxeResults = (results: AxeResults): NormalizedIssue[] => {
  const issues: NormalizedIssue[] = [];

  for (const violation of results.violations) {
    const mappedType = RULE_TYPE_MAP[violation.id];
    if (!mappedType) continue;

    violation.nodes.forEach((node, index) => {
      issues.push({
        id: `${violation.id}-${index + 1}`,
        type: mappedType,
        severity: severityFromImpact(violation.impact),
        selector: selectorFromTargets(node.target),
        description: violation.help || violation.description,
        helpUrl: violation.helpUrl,
      });
    });
  }

  return issues;
};

export const axeRulesCovered = Object.keys(RULE_TYPE_MAP);
