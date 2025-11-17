import type { AxeResults } from 'axe-core';
import { redactAxeResults } from './redaction';

const sampleResults = {
  violations: [
    {
      id: 'link-name',
      impact: 'serious',
      description: 'Links must have discernible text',
      help: 'Provide accessible name',
      helpUrl: 'https://example.com',
      tags: [],
      nodes: [
        {
          any: [{ id: 'a', impact: 'serious', message: 'msg', html: '<a>text</a>' } as any],
          all: [],
          none: [],
          html: '<a href="/">Home</a>',
          target: ['a'],
          failureSummary: 'summary',
        },
      ],
    },
  ],
  passes: [],
  incomplete: [],
  inapplicable: [],
  timestamp: new Date().toISOString(),
  url: 'https://example.com',
} as unknown as AxeResults;

describe('redactAxeResults', () => {
  it('removes html snippets from nodes and checks', () => {
    const redacted = redactAxeResults(sampleResults);

    expect(redacted.violations[0].nodes[0]).not.toHaveProperty('html');
    expect(redacted.violations[0].nodes[0].any?.[0]).not.toHaveProperty('html');
  });
});
