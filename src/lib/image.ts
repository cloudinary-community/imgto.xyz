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
  return new Promise((resolve, reject) => {
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

    reader.readAsDataURL(file);
  })  
}