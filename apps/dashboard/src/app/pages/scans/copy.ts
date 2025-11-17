export const severityCopy = {
  high: {
    label: 'High',
    description: 'People may be blocked from using or buying because a control is missing a label, focus, or contrast.',
  },
  medium: {
    label: 'Medium',
    description: 'The page works but is frustrating, such as unclear focus order or headings that skip levels.',
  },
  low: {
    label: 'Low',
    description: 'Polish that improves consistency, like clearer link text or optional alt text updates.',
  },
} as const;

export const issueTypeCopy = [
  {
    label: 'Text alternatives',
    description: 'Missing or vague alt text for images. We suggest concise descriptions and apply safe defaults via the auto-fix script.',
  },
  {
    label: 'Color and contrast',
    description: 'Text and interactive elements must have enough contrast to be readable in different lighting.',
  },
  {
    label: 'Structure',
    description: 'Headings and landmarks should be in a clear order so screen reader users can jump around quickly.',
  },
  {
    label: 'Forms',
    description: 'Inputs need labels, clear errors, and helpful instructions so people can submit without guesswork.',
  },
];
