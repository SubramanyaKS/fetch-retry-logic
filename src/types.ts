export interface RetryOptions {
  retries?: number;
  backoff?: number;
  jitter?: boolean;
  retryOn?: number[];
  maxBackoff?: number;
}