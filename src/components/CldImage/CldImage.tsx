"use client";

import { CldImage as CldImageDefault, CldImageProps }  from 'next-cloudinary';
import { PlaceholderValue } from 'next/dist/shared/lib/get-img-props';

const CldImage = (props: CldImageProps) => {
  const width = parseInt(`${props.width}`);
  const height = parseInt(`${props.height}`);

  const shimmer = (w: number, h: number) => `
    <svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <linearGradient id="g">
          <stop stop-color="#fff" offset="20%" />
          <stop stop-color="#f9f9f9" offset="50%" />
          <stop stop-color="#fff" offset="70%" />
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="#fff" />
      <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
      <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
    </svg>`
  
  const toBase64 = (str: string) =>
    typeof window === 'undefined'
      ? Buffer.from(str).toString('base64')
      : window.btoa(str)
  
  const dataUrl = `data:image/svg+xml;base64,${toBase64(shimmer(width, height))}`;

  return <CldImageDefault {...props} placeholder={dataUrl as PlaceholderValue} />
}

export default CldImage;