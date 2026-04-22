
/**
 * uploadFile
 */

export async function uploadFile(file: File) {
  const timestamp = Date.now();

  const formData = new FormData();

  const uploadPreset =
    (typeof process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET === 'string' &&
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) ||
    'imgtoxyz';

  const parameters: { [key: string]: string | Blob } = {
    upload_preset: uploadPreset
  };

  if ( typeof process.env.NEXT_PUBLIC_CLOUDINARY_UPLOADS_FOLDER === 'string' ) {
    parameters.folder = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOADS_FOLDER;
  }

  Object.keys(parameters).sort().forEach(key => {
    if ( typeof parameters[key] === 'undefined' ) return;
    formData.append(key, String(parameters[key]));
  });

  const signResponse = await fetch('/api/sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...parameters,
      timestamp
    })
  });
  const signBody = (await signResponse.json().catch(() => (null))) as
    | { signature?: string; error?: string } | null;
  if ( !signResponse.ok || !signBody || typeof signBody.signature !== 'string' ) {
    const message =
      signBody && typeof signBody.error === 'string'
        ? signBody.error
        : 'Failed to sign upload. Check that CLOUDINARY_API_SECRET is set.';
    throw new Error(message);
  }
  const { signature } = signBody;

  formData.append('file', file);
  formData.append('api_key', String(process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY));
  formData.append('timestamp', String(timestamp));
  formData.append('signature', signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData
  });

  if ( !response.ok ) {
    const { error } = await response.json();
    throw new Error(error.message || 'Unknown error');
  }
  
  const results = await response.json();

  const moderation = results.moderation?.find(({ kind }: { kind: string; }) => kind === 'aws_rek');

  if ( moderation?.status === 'rejected' ) {
    throw new Error('INAPPROPRIATE_CONTENT');
  }

  return results;
}