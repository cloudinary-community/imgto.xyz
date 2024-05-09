import { CloudinaryResource } from '@/types/cloudinary';

export interface ImageUpload {
  id: string;
  name: string;
  size: number;
  data?: string | ArrayBuffer | null;
  file: File;
  state: string;
  upload?: CloudinaryResource;
  optimized?: ImageDownload;
  avif?: ImageDownload;
  webp?: ImageDownload;
  jpeg?: ImageDownload;
  width?: number;
  height?: number;
}

export interface ImageDownload {
  url?: string;
  size?: number;
  data?: Blob;
}