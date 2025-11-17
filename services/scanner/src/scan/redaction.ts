import type { AxeResults } from 'axe-core';

const scrubNode = (node: AxeResults['violations'][number]['nodes'][number]) => {
  const { html, any, all, none, ...rest } = node as any;
  const scrubChecks = (checks?: { html?: string }[]) =>
    checks?.map((check) => {
      const { html: _html, ...remaining } = check as any;
      return remaining;
    }) ?? [];

  return {
    ...rest,
    any: scrubChecks(any),
    all: scrubChecks(all),
    none: scrubChecks(none),
  };
};

/**
 * Removes HTML snippets from axe results so sensitive page content is not retained.
 */
export const redactAxeResults = (results: AxeResults): AxeResults => {
  return {
    ...results,
    violations: results.violations.map((violation) => ({
      ...violation,
      nodes: violation.nodes.map((node) => scrubNode(node)),
    })),
  };
};
