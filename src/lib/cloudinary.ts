import { HttpError } from '@/lib/util';

/**
 * uploadFile
 */

export async function uploadFile(file: File) {
  // Cloudinary expects a Unix timestamp in seconds

  const timestamp = Math.round(Date.now() / 1000);

  const formData = new FormData();

  const parameters: { [key: string]: string | Blob } = {
    upload_preset: 'imgtoxyz'
  };

  // An empty folder is treated as unset so the client and /api/sign agree on
  // exactly which parameters get signed

  if ( process.env.NEXT_PUBLIC_CLOUDINARY_UPLOADS_FOLDER ) {
    parameters.folder = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOADS_FOLDER;
  }

  Object.keys(parameters).sort().forEach(key => {
    if ( typeof parameters[key] === 'undefined' ) return;
    formData.append(key, String(parameters[key]));
  });

  const signResponse = await fetch('/api/sign', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ...parameters,
      timestamp
    })
  });

  if ( !signResponse.ok ) {
    throw new HttpError('Failed to sign upload', signResponse.status);
  }

  const { signature } = await signResponse.json();

  formData.append('file', file);
  formData.append('api_key', String(process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY));
  formData.append('timestamp', String(timestamp));
  formData.append('signature', signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData
  });

  if ( !response.ok ) {
    const { error } = await response.json().catch(() => ({ error: undefined }));
    const retryAfter = parseInt(response.headers.get('Retry-After') || '') || undefined;
    throw new HttpError(error?.message || 'Unknown error', response.status, retryAfter);
  }
  
  const results = await response.json();

  const moderation = results.moderation?.find(({ kind }: { kind: string; }) => kind === 'aws_rek');

  if ( moderation?.status === 'rejected' ) {
    throw new Error('INAPPROPRIATE_CONTENT');
  }

  return results;
}