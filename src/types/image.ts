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
  width?: number;
  height?: number;
  errors?: boolean | string | Array<string>;
}

export interface ImageDownload {
  url: string;
  format: string;
  size?: number;
}
