
/**
 * uploadFile
 */

export async function uploadFile(file: File) {
  const timestamp = Date.now();

  const formData = new FormData();

  const parameters: { [key: string]: string | Blob } = {
    eager: 'q_auto:low'
  };

  if ( typeof process.env.NEXT_PUBLIC_CLOUDINARY_UPLOADS_FOLDER === 'string' ) {
    parameters.folder = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOADS_FOLDER;
  }

  Object.keys(parameters).sort().forEach(key => {
    if ( typeof parameters[key] === 'undefined' ) return;
    formData.append(key, String(parameters[key]));
  });

  const { signature } = await fetch('/api/sign', {
    method: 'POST',
    body: JSON.stringify({
      ...parameters,
      timestamp
    })
  }).then(r => r.json());

  formData.append('file', file);
  formData.append('api_key', String(process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY));
  formData.append('timestamp', String(timestamp));
  formData.append('signature', signature);

  const results = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData
  }).then(r => r.json());

  return results;
}