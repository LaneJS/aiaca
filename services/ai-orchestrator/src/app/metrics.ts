import client from 'prom-client';

const register = new client.Registry();
client.collectDefaultMetrics({ register });

export const suggestionCounter = new client.Counter({
  name: 'ai_suggestions_total',
  help: 'Total number of AI suggestion requests handled',
  registers: [register],
});

export const issuesPerSuggestion = new client.Histogram({
  name: 'ai_suggestion_issue_count',
  help: 'Distribution of issue counts per suggestion request',
  buckets: [1, 3, 5, 10, 15, 20],
  registers: [register],
});

export const metricsRegister = register;
