export interface RetryOptions {
  retries?: number;
  backoff?: number;
  jitter?: boolean;
  retryOn?: number[]; // e.g., [408, 429, 500, 502, 503, 504]
}