import {
  Counter,
  Histogram,
  Registry,
  collectDefaultMetrics,
} from "prom-client";

const register: Registry = new Registry();

collectDefaultMetrics({ register });

const requestCounter: Counter = new Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "path", "status_code"],
});

const requestDurationHistogram: Histogram = new Histogram({
  name: "http_request_duration_seconds",
  help: "Histogram of HTTP request durations in seconds",
  labelNames: ["method", "path", "status_code"],
  buckets: [0.05, 0.1, 0.2, 0.5, 1, 2, 5],
});

register.registerMetric(requestCounter);
register.registerMetric(requestDurationHistogram);

export const increaseRequestCounter = (
  method: string,
  path: string,
  statusCode: string
): void => {
  requestCounter.inc({ method: method, path: path, status_code: statusCode });
};

export const observeRequestDuration = (
  method: string,
  path: string,
  statusCode: string,
  durationInMillis: number
): void => {
  const durationInSeconds = durationInMillis / 1000;
  requestDurationHistogram.observe(
    { method: method, path: path, status_code: statusCode },
    durationInSeconds
  );
};

export const getMetrics = async (): Promise<string> => {
  return await register.metrics();
};
