import { NextResponse } from 'next/server'

import { createHashFromString } from '@/lib/util';

export async function POST(request: Request) {
  const requestFormData = await request.formData()
  const file = requestFormData.get('file') as File;
  const timestamp = Date.now();

  const formData = new FormData();

  const parameters: { [key: string]: string | Blob } = {};

  if ( typeof process.env.NEXT_PUBLIC_CLOUDINARY_UPLOADS_FOLDER === 'string' ) {
    parameters.folder = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOADS_FOLDER;
  }

  Object.keys(parameters).sort().forEach(key => {
    if ( typeof parameters[key] === 'undefined' ) return;
    formData.append(key, parameters[key]);
  });

  const paramsString = Object.keys(parameters).map(key => `${key}=${parameters[key]}`).join('&');

  const paramsHash = await createHashFromString(`${paramsString}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`);

  formData.append('file', file);
  formData.append('api_key', process.env.CLOUDINARY_API_KEY || '');
  formData.append('timestamp', String(timestamp));
  formData.append('signature', paramsHash);

  try {
    const results = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData
    }).then(r => r.json());

    return NextResponse.json(results);
  } catch(error) {
    let message = 'Unknown Error';

    if ( error instanceof Error ) {
      message = error.message;
    }

    return new Response(JSON.stringify({ error: message }), {
      status: 500
    })
  }
}