import { describe, it, expect, vi } from 'vitest';
import { fetchRetry } from '../src/index';

describe('fetchRetry', () => {
  it('should retry 2 times and then succeed', async () => {
    // We "mock" the global fetch function
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 500 }) 
      .mockResolvedValueOnce({ ok: false, status: 500 }) 
      .mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve({ data: 'success' }) }); // 3rd succeeds

    globalThis.fetch = mockFetch;

    const res = await fetchRetry('https://api.test.com', {
      retry: { retries: 3, backoff: 10 }
    });

    expect(res.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it('does not forward the `retry` option to the underlying fetch call', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({ ok: true, status: 200 });
    globalThis.fetch = mockFetch;

    await fetchRetry('https://api.test.com', {
      method: 'GET',
      retry: { retries: 1, backoff: 10 }
    } as any);

    const calledOptions = mockFetch.mock.calls[0][1];
    expect(calledOptions).not.toHaveProperty('retry');
  });

  it('honors numeric `Retry-After` (seconds) header before retrying', async () => {
    vi.useFakeTimers();

    const firstResp = { ok: false, status: 429, statusText: 'Too Many Requests', headers: { get: (n: string) => n === 'Retry-After' ? '1' : null } };
    const secondResp = { ok: true, status: 200 };

    const mockFetch = vi.fn()
      .mockResolvedValueOnce(firstResp)
      .mockResolvedValueOnce(secondResp);

    globalThis.fetch = mockFetch;

    const p = fetchRetry('https://api.test.com', { retry: { retries: 1, backoff: 10 } });

    // advance timers to allow the Retry-After (1s) delay to elapse
    await Promise.resolve();
    vi.advanceTimersByTime(1000);

    const res = await p;
    expect(res.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });
});