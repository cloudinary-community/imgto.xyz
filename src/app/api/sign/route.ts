import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// This endpoint is public, so only sign the exact parameters the app uploads
// with. Otherwise anyone could get signatures for arbitrary upload options.

const UPLOAD_PRESET = 'imgtoxyz';
const MAX_TIMESTAMP_DRIFT = 10 * 60; // 10 minutes, in seconds

export async function POST(request: Request) {
  const body = await request.json().catch(() => undefined);

  if ( !body || typeof body !== 'object' ) {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { timestamp, upload_preset, folder, ...rest } = body;

  const isValidTimestamp = typeof timestamp === 'number' && Math.abs(Date.now() / 1000 - timestamp) <= MAX_TIMESTAMP_DRIFT;
  const isValidFolder = typeof folder === 'undefined' || folder === process.env.NEXT_PUBLIC_CLOUDINARY_UPLOADS_FOLDER;

  if ( !isValidTimestamp || upload_preset !== UPLOAD_PRESET || !isValidFolder || Object.keys(rest).length > 0 ) {
    return Response.json({ error: 'Invalid upload parameters' }, { status: 400 });
  }

  const parameters = { timestamp, upload_preset, ...(folder && { folder }) };
  const signature = cloudinary.utils.api_sign_request(parameters, String(process.env.CLOUDINARY_API_SECRET));

  return Response.json({ signature });
}
