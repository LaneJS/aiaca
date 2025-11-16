import type { AxeResults } from 'axe-core';
import { normalizeAxeResults, axeRulesCovered } from './axe-normalizer';

const baseResult: AxeResults = {
  violations: [],
  passes: [],
  incomplete: [],
  inapplicable: [],
  timestamp: new Date().toISOString(),
  url: 'https://example.com',
  toolOptions: {},
  testEngine: { name: 'axe-core', version: '1.0.0' },
  testRunner: { name: 'jest' },
  testEnvironment: { userAgent: '', windowHeight: 720, windowWidth: 1280 },
};

describe('normalizeAxeResults', () => {
  it('maps axe violations to normalized issues', () => {
    const results: AxeResults = {
      ...baseResult,
      violations: [
        {
          id: 'image-alt',
          impact: 'serious',
          description: 'Images must have alternate text',
          help: 'Add alt text',
          helpUrl: 'https://example.com/rule',
          tags: [],
          nodes: [
            {
              target: ['img.hero'],
              all: [],
              any: [],
              none: [],
              html: '<img class="hero" />',
              failureSummary: '',
            },
          ],
        },
      ],
    } as AxeResults;

    const normalized = normalizeAxeResults(results);

    expect(normalized).toEqual([
      {
        id: 'image-alt-1',
        type: 'alt_missing',
        severity: 'error',
        selector: 'img.hero',
        description: 'Add alt text',
        helpUrl: 'https://example.com/rule',
      },
    ]);
  });

  it('skips unsupported rules', () => {
    const results: AxeResults = {
      ...baseResult,
      violations: [
        {
          id: 'region',
          impact: 'minor',
          description: 'Skip me',
          help: 'Skip me',
          helpUrl: '',
          tags: [],
          nodes: [
            {
              target: ['main'],
              all: [],
              any: [],
              none: [],
              html: '<main></main>',
              failureSummary: '',
            },
          ],
        },
      ],
    } as AxeResults;

    const normalized = normalizeAxeResults(results);
    expect(normalized).toHaveLength(0);
  });
});

describe('axeRulesCovered', () => {
  it('includes expected rule IDs', () => {
    expect(axeRulesCovered).toEqual(
      expect.arrayContaining([
        'image-alt',
        'color-contrast',
        'heading-order',
        'link-name',
        'button-name',
        'aria-input-field-name',
      ]),
    );
  });
});
