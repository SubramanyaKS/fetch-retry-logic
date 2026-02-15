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
});