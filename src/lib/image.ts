/**
 * resizeImage
 */

export function resizeImage(image: HTMLImageElement | HTMLCanvasElement, { width, height }: { width: number; height: number; }) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = width;
  canvas.height = height;

  // 2-step processing: https://stackoverflow.com/questions/19262141/resize-image-with-javascript-canvas-smoothly

  const oc = document.createElement('canvas');
  const octx = oc.getContext('2d');

  oc.width = (image.width - width) / 2;
  oc.height = (oc.width / image.width) * image.height;

  octx?.drawImage(image, 0, 0, oc.width, oc.height);

  ctx?.drawImage(oc, 0, 0, width, height);

  const dataurl = canvas.toDataURL('image/webp');

  return dataurl;
}

/**
 * readImage
 */

interface ReadImageReturn {
  img: HTMLImageElement;
  data: string | ArrayBuffer | null;
}

export function readImage(file: File): Promise<ReadImageReturn> {
  return new Promise(async (resolve, reject) => {
    const reader = new FileReader;

    reader.onload = function() {
      const img = new Image;

      img.onerror = function() {
        reject(null);
      }

      img.onload = function() {
        resolve({
          data: reader.result,
          img
        });
      };

      img.src = reader.result as string;
    };

    // HEIF/HEIC files aren't currently supported in most desktop browsers meaning 
    // if we try to decode them, we'll get an error. This allows us to support these
    // file types loading asynchronously a package that decode it for us into a jpg

    const isHeif = file.type === 'image/heif' || file.type === 'image/heic';

    if ( isHeif && typeof window !== 'undefined' ) {
      const heic2any = (await import('heic2any')).default;
      file = await heic2any({ blob: file, toType: 'image/jpeg' }) as File;
    }

    reader.readAsDataURL(file);
  })
}

/**
 * getImageFormatFromType
 */

const formatsMap: Record<string, string> = {
  avif: 'AVIF',
  jpg: 'JPG',
  jpeg: 'JPG',
  jxl: 'JXL',
  png: 'PNG',
  webp: 'WebP',
  heif: 'HEIF',
  heic: 'HEIC',
}

export function getImageFormatFromType(type: string, formatted = false) {
  const split = type.split('/');
  const format = split[split.length - 1];

  if ( formatted ) return formatsMap[format] || format;

  if ( ['jpeg', 'jpg'].includes(format) ) {
    return 'jpg';
  }

  return format;
}