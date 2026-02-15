import { RetryOptions } from "./types";

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  retries: 3,
  backoff: 1000,
  jitter: true,
  retryOn: [408, 429, 500, 502, 503, 504]
};

export async function fetchRetry(
  url: string | URL,
  options: RequestInit & { retry?: RetryOptions } = {}
): Promise<Response> {
  const { retry = {}, ...fetchOptions} = options;
  const config = { ...DEFAULT_OPTIONS, ...retry };
  
  try {
    const response = await fetch(url, options);
    if (!response.ok && config.retries>0 && config.retryOn.includes(response.status)) throw new Error(response.statusText);
    return response
    
  } catch (error) {
    if(config.retries>0){
        const delay = config.backoff +(config.jitter?Math.random()*100:0);
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchRetry(url,{...fetchOptions,retry: { ...config, retries: config.retries - 1,backoff: config.backoff * 2 }})
    }
    throw error   
  }
}