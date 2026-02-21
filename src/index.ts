import { RetryOptions } from "./types";
import { FetchError } from "./error";
const DEFAULT_OPTIONS: Required<RetryOptions> = {
  retries: 3,
  backoff: 1000,
  jitter: true,
  retryOn: [408, 429, 500, 502, 503, 504],
  maxBackoff: 30000
};

export async function fetchRetry(
  url: string | URL,
  options: RequestInit & { retry?: RetryOptions } = {}
): Promise<Response> {
  const { retry = {}, ...fetchOptions } = options;
  const config = { ...DEFAULT_OPTIONS, ...retry };

  try {
    const response = await fetch(url, fetchOptions);
    if (!response.ok && config.retries > 0 && config.retryOn.includes(response.status)) {
      throw new FetchError(response.statusText, response.status, response.headers);
    }
    return response

  } catch (error) {
    if (config.retries > 0) {
      let delay: number | undefined

      if (error instanceof FetchError && error.status == 429) {
        const retryAfter = error.headers?.get("Retry-After");
        if (retryAfter) {
          const seconds = Number(retryAfter);
          if (!isNaN(seconds)) {
            delay = seconds * 1000;
          } else {
            const parsed = Date.parse(retryAfter);
            if (!isNaN(parsed)) {
              delay = parsed - Date.now();
              if (delay < 0) delay = 0;
            }
          }
        }
      }
      if (delay === undefined) {
        const jitter = config.jitter ? Math.random() * config.backoff : 0;
        delay = config.backoff + jitter;
      }
      if (config.maxBackoff !== undefined) {
        delay = Math.min(delay, config.maxBackoff);
      }

      const sleep = (ms: number, signal?: AbortSignal) => new Promise<void>((resolve, reject) => {
        if (signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'));
        const id = setTimeout(() => {
          cleanup();
          resolve();
        }, ms);
        const onAbort = () => {
          clearTimeout(id);
          cleanup();
          reject(new DOMException('Aborted', 'AbortError'));
        };
        function cleanup() {
          signal?.removeEventListener('abort', onAbort);
        }
        signal?.addEventListener('abort', onAbort, { once: true });
      });

      await sleep(delay, fetchOptions.signal as AbortSignal | undefined);
      return fetchRetry(url, { ...fetchOptions, retry: { ...config, retries: config.retries - 1, backoff: Math.min(config.backoff * 2, config.maxBackoff ?? Infinity) } })
    }
    throw error
  }
}