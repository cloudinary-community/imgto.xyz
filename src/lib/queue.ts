import pLimit from 'p-limit';

import { HttpError, getFileBlob } from '@/lib/util';

// Shared, module-level queues so that concurrency is capped across every batch
// of dropped files, not per batch. Reading (especially HEIC decoding) is CPU
// bound in the browser so it gets a tighter limit than network work.

export const readQueue = pLimit(3);
export const uploadQueue = pLimit(6);
export const transformQueue = pLimit(6);

/**
 * isRetryable
 * @description Network failures, rate limits (420/429), and server errors are
 *   worth retrying. Anything else (bad request, moderation) won't change.
 */

export function isRetryable(error: unknown) {
  if ( error instanceof HttpError ) {
    return [408, 420, 429].includes(error.status) || error.status >= 500;
  }
  // fetch rejects with a TypeError on network failure
  return error instanceof TypeError;
}

/**
 * withRetry
 */

interface WithRetryOptions {
  retries?: number;
  baseDelay?: number;
}

export async function withRetry<T>(fn: () => Promise<T>, { retries = 3, baseDelay = 500 }: WithRetryOptions = {}): Promise<T> {
  let attempt = 0;

  while ( true ) {
    try {
      return await fn();
    } catch(error) {
      if ( attempt >= retries || !isRetryable(error) ) throw error;

      // Exponential backoff with jitter, honoring Retry-After when given

      const retryAfter = error instanceof HttpError && error.retryAfter ? error.retryAfter * 1000 : 0;
      const delay = Math.max(retryAfter, baseDelay * 2 ** attempt) + Math.random() * baseDelay;

      await new Promise(resolve => setTimeout(resolve, delay));

      attempt++;
    }
  }
}

/**
 * fetchAssetBlob
 * @description Fetches a delivered asset once and caches the result so that
 *   measuring size, single downloads, and zipped downloads share one request.
 */

const MAX_CACHED_BLOBS = 100;
const blobCache = new Map<string, Promise<Blob>>();

export function fetchAssetBlob(url: string): Promise<Blob> {
  const cached = blobCache.get(url);

  if ( cached ) return cached;

  const request = transformQueue(() => withRetry(() => getFileBlob(url)));

  request.catch(() => blobCache.delete(url));

  blobCache.set(url, request);

  // Map preserves insertion order, so the first key is the oldest

  if ( blobCache.size > MAX_CACHED_BLOBS ) {
    const oldest = blobCache.keys().next().value;
    if ( typeof oldest === 'string' ) blobCache.delete(oldest);
  }

  return request;
}
