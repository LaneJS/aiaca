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
  passes: [
    {
      id: 'valid-lang',
      impact: 'minor',
      description: 'passes example',
      help: 'ok',
      helpUrl: 'https://example.com',
      tags: [],
      nodes: [
        {
          any: [],
          all: [{ id: 'b', impact: 'minor', message: 'msg', html: '<html>ok</html>' } as any],
          none: [],
          html: '<html lang="en">',
          target: ['html'],
          failureSummary: 'summary',
        },
      ],
    },
  ],
  incomplete: [
    {
      id: 'manual-check',
      impact: null,
      description: 'incomplete example',
      help: 'check manually',
      helpUrl: 'https://example.com',
      tags: [],
      nodes: [
        {
          any: [],
          all: [],
          none: [{ id: 'c', impact: 'moderate', message: 'msg', html: '<div>maybe</div>' } as any],
          html: '<div>maybe</div>',
          target: ['div'],
          failureSummary: 'summary',
        },
      ],
    },
  ],
  inapplicable: [
    {
      id: 'frame-focusable',
      impact: null,
      description: 'inapplicable example',
      help: 'not applicable',
      helpUrl: 'https://example.com',
      tags: [],
      nodes: [
        {
          any: [],
          all: [],
          none: [],
          html: '<frame>',
          target: ['frame'],
          failureSummary: 'summary',
        },
      ],
    },
  ],
  timestamp: new Date().toISOString(),
  url: 'https://example.com',
} as unknown as AxeResults;

describe('redactAxeResults', () => {
  it('removes html snippets from nodes and checks', () => {
    const redacted = redactAxeResults(sampleResults);

    expect(redacted.violations[0].nodes[0]).not.toHaveProperty('html');
    expect(redacted.violations[0].nodes[0].any?.[0]).not.toHaveProperty('html');
    expect(redacted.passes[0].nodes[0]).not.toHaveProperty('html');
    expect(redacted.passes[0].nodes[0].all?.[0]).not.toHaveProperty('html');
    expect(redacted.incomplete[0].nodes[0]).not.toHaveProperty('html');
    expect(redacted.incomplete[0].nodes[0].none?.[0]).not.toHaveProperty('html');
    expect(redacted.inapplicable[0].nodes[0]).not.toHaveProperty('html');
  });
});
