# 🚀 fetch-retry-logic
A lightweight ( < 1kb), zero-dependency wrapper for the native Fetch API that adds exponential backoff, jitter, and customizable retry logic.

## Why use this?
Network requests fail. Whether it's a spotty mobile connection or a temporary server overload (503), failing immediately creates a poor user experience. fetch-retry-logic helps your app stay resilient by retrying failed requests automatically.

- Zero Dependencies: Uses the native fetch you already know.
- Exponential Backoff: Prevents "retry storms" by waiting longer after each failure.
- Jitter Support: Randomizes delays to prevent synchronized server hits.
- TypeScript First: Full type safety for your options.

## 📦 Installation

```bash
npm install fetch-retry-logic
```

## 🛠️ Usage
Use it exactly like a normal fetch, but with an optional retry configuration object.
```ts
import { fetchRetry } from 'fetch-retry-logic';

const response = await fetchRetry('https://api.example.com/data', {
  method: 'GET',
  retry: {
    retries: 5,
    backoff: 1000,
    jitter: true,
    retryOn: [500, 503, 429]
  }
});

const data = await response.json();

```
## ⚙️ Configuration Options


| Option | Type | Default | Descreption |
|-------|-----|-----------|------|
| retries | number | 3 |Total number of retry attempts |
| backoff | number | 1000 | Base delay in milliseconds. Doubles each attempt.|
| jitter | boolean | true | Adds a small random offset to the backoff delay. |
| retryOn | number[] | [408, 429, 500, 502, 503, 504] |HTTP status codes that trigger a retry.|

## 🧪 Testing

This library is fully tested with Vitest. To run the tests:

```bash
npm test
```

## 📄 License

MIT
