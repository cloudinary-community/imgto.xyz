import { CloudinaryResource } from '@/types/cloudinary';

export interface ImageUpload {
  img?: HTMLImageElement;
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
  jxl?: ImageDownload;
  width?: number;
  height?: number;
  errors?: boolean | string | Array<string>;
}

export interface ImageDownload {
  url?: string;
  size?: number;
  data?: Blob;
}