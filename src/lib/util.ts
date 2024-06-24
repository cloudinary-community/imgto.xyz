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
 * getFileSize
 */

export async function getFileBlob(url: string) {
  const response = await fetch(url);

  if ( !response.ok ) {
    if ( response.status === 401 ) {
      throw new Error('UNAUTHORIZED');
    }
    throw new Error('UNKNOWN_ERROR');
  }

  const blob = await response.blob();

  return blob;
}

/**
 * downloadUrl
 */

interface DownloadUrlOptions {
  downloadBlob?: boolean;
}

export async function downloadUrl(url: string, filename: string = 'file', options?: DownloadUrlOptions) {
  const { downloadBlob = false } = options || {};
  let downloadUrl = url;

  if ( downloadBlob ) {
    const blob = await getFileBlob(url);
    const blobUrl = URL.createObjectURL(blob);
    downloadUrl = blobUrl;
  }

  const a = document.createElement('a');

  a.href = downloadUrl;
  a.download = filename;

  function handleOnClick() {
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 150);
    removeEventListener('click', handleOnClick);
  };

  a.addEventListener('click', handleOnClick, false);

  a.click();
}

/**
 * addNumbers
 */

export function addNumbers(numbers: Array<number>) {
  return numbers.reduce((prev, curr) => prev + curr, 0);
}