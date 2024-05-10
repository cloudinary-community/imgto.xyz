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