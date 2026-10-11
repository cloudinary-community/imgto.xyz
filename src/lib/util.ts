import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * createHashFromString
 * @via https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest#converting_a_digest_to_a_hex_string
 */

export async function createHashFromString(data: string, algorithm = 'SHA-256') {
  if (!data) throw new Error('Failed to create hash. Data undefined.');
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest(algorithm, encoder.encode(data))
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string
  return hashHex;
}

/**
 * addCommas
 * @via Thanks ChatGPT
 */

export function addCommas(number: number | string) {
  if ( !['string', 'number'].includes(typeof number) ) return number;

  const num = `${number}`;
  const [whole, decimal] = num.split('.');
  let digits = whole.split('');
  let counter = 0;

  // Iterate through the digits from right to left
  for (var i = digits.length - 1; i >= 0; i--) {
    // Increment the counter
    counter++;

    // If the counter is a multiple of 3 and we're not at the leftmost digit, add a comma
    if (counter % 3 === 0 && i !== 0) {
      digits.splice(i, 0, ",");
    }
  }

  let joined = digits.join('');

  if ( decimal ) {
    joined = `${joined}.${decimal}`;
  }

  return joined;
}

/**
 * formatBytes
 */

interface FormatBytesOptions {
  type?: string;
  limit?: number;
  fixed?: number;
  commas?: boolean;
}

export function formatBytes(bytes: number, { type = 'kb', limit, fixed = 0, commas = true }: FormatBytesOptions = {}) {
  let amount = bytes;

  if ( typeof amount !== 'number' ) return amount;

  if ( limit && amount >= 1000000 ) {
    type = 'gb'
  } else if ( limit && amount >= limit * 1000 ) {
    type = 'mb';
  } else if ( limit && amount >= limit ) {
    type = 'kb';
  }

  if ( type === 'gb' ) {
    amount = amount / 1000000000;
  } else if ( type === 'mb' ) {
    amount = amount / 1000000;
  } else if ( type === 'kb' ) {
    amount = amount / 1000;
  }

  let formatted;

  if ( fixed > 0 && amount % 1 !== 0 ) {
    formatted = amount.toFixed(fixed)
  } else if ( fixed === 0 ) {
    formatted = Math.ceil(amount);
  }

  if ( commas && formatted ) {
    formatted = addCommas(formatted);
  }

  return `${formatted} ${type}`;
}

/**
 * HttpError
 */

export class HttpError extends Error {
  status: number;
  retryAfter?: number;

  constructor(message: string, status: number, retryAfter?: number) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

/**
 * getFileBlob
 */

export async function getFileBlob(url: string) {
  const response = await fetch(url);

  if ( !response.ok ) {
    const retryAfter = parseInt(response.headers.get('Retry-After') || '') || undefined;
    const message = response.status === 401 ? 'UNAUTHORIZED' : 'UNKNOWN_ERROR';
    throw new HttpError(message, response.status, retryAfter);
  }

  const blob = await response.blob();

  return blob;
}

/**
 * downloadBlob
 */

export function downloadBlob(blob: Blob, filename: string = 'file') {
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');

  a.href = blobUrl;
  a.download = filename;
  a.style.display = 'none';

  // Some browsers (Firefox) require the link to be in the document to download

  document.body.appendChild(a);
  a.click();
  a.remove();

  // Give the browser a moment to start the download before releasing the blob

  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
}

/**
 * downloadUrl
 */

export async function downloadUrl(url: string, filename: string = 'file') {
  const blob = await getFileBlob(url);
  downloadBlob(blob, filename);
}

/**
 * getUniqueFilename
 * @description Appends a counter to avoid collisions, ex: photo.jpg, photo-1.jpg
 */

export function getUniqueFilename(name: string, extension: string, used: Set<string>) {
  let filename = `${name}.${extension}`;
  let counter = 1;

  while ( used.has(filename.toLowerCase()) ) {
    filename = `${name}-${counter}.${extension}`;
    counter++;
  }

  used.add(filename.toLowerCase());

  return filename;
}

/**
 * addNumbers
 */

export function addNumbers(numbers: Array<number>) {
  return numbers.reduce((prev, curr) => prev + curr, 0);
}