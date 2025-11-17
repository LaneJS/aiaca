import client from 'prom-client';

const register = new client.Registry();

client.collectDefaultMetrics({ register });

export const scanCounter = new client.Counter({
  name: 'scanner_scans_total',
  help: 'Total number of scans processed by the scanner service',
  registers: [register],
});

export const scanDuration = new client.Histogram({
  name: 'scanner_scan_duration_seconds',
  help: 'Observed duration of scan requests',
  buckets: [0.5, 1, 2, 3, 5, 8, 13, 21],
  registers: [register],
});

export const metricsRegister = register;
