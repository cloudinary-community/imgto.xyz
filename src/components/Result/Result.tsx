"use client";

import { LoaderCircle, DownloadIcon } from 'lucide-react';

import { downloadUrl, formatBytes } from '@/lib/util';
import { ImageDownload, ImageUpload } from '@/types/image';

import ProgressBar from '@/components/ProgressBar';
import Button from '@/components/Button';

const DOWNLOAD_FORMATS = ['avif', 'webp', 'jpg']

const stateMap: { [key: string]: string } = {
  ready: 'Ready',
  uploading: 'Uploading',
  finished: 'Done',
  optimizing: 'Optimizing',
}

interface DownloadProps {
  image: ImageUpload;
}

const Result = ({ image }: DownloadProps) => {
  const downloadName = image.upload?.original_filename;

  let imageProgress = 0;

  if ( image.state === 'uploading' ) {
    imageProgress = 33;
  } else if ( image.state === 'optimizing' ) {
    imageProgress = 66
  } else if ( image.state === 'finished' ) {
    imageProgress = 100;
  }

  async function downloadFile(url: string, format: string) {
    if ( typeof image?.optimized?.url !== 'string' ) return;
    await downloadUrl(url, `${downloadName}.${format}`, { downloadBlob: true });
  }
  
  return (
    <div className="flex w-full gap-10 mb-10">
      <span className="relative w-full max-w-[12em] self-start shadow-[0px_2px_8px_0px_rgba(0,0,0,0.15)]">
        {image.data && (
          <img
            className="block rounded relative z-10 aspect-square object-cover"
            width={image.width}
            height={image.height}
            src={image.data as string }
            alt="Upload preview"
            loading="lazy"
          />
        )}
        <span className={`block absolute top-0 left-0 z-0 w-full rounded aspect-square bg-zinc-300 animate-pulse`} />
      </span>
      <div className="grow">
        <h3 className="font-bold mb-1">{ image.name }</h3>
        <p className="text-sm mb-4">
          Original Size: { image.size && formatBytes(image.size, { fixed: 0 }) }
        </p>
        <div className="mb-4">
          <ProgressBar progress={imageProgress} />
          <div className="flex justify-between">
            <p className="text-xs font-bold">
              { stateMap[image.state] }
            </p>
          </div>
        </div>
        <div className="flex justify-between mb-6">
            {['finished'].includes(image.state) && (
              <>
                <p>
                  <Button
                    onClick={async () => {
                      if ( !image?.optimized?.url || !image.upload?.format ) return;
                      await downloadFile(image.optimized.url, image.upload.format);
                    }}
                  >
                    <DownloadIcon className="w-5 h-5 text-white" />
                    Download { image.upload?.format?.toUpperCase() }
                  </Button>
                  {image?.optimized?.size && (
                    <span className="block text-sm font-semibold mt-2">Optimized Size: {formatBytes(image?.optimized?.size, { fixed: 0 }) }</span>
                  )}
                </p>
                <ul>
                  {DOWNLOAD_FORMATS
                    .filter(format => image?.[format as keyof ImageUpload])
                    .map(format => {
                      const download = image[format as keyof ImageUpload] as ImageDownload;
                      return (
                        <li key={format} className="text-sm mb-1">
                          <button
                            className="text-blue-600 hover:underline"
                            onClick={async () => {
                              if ( !download?.url ) return;
                              await downloadFile(download.url, format);
                            }}
                          >
                            Dowload as .{ format }
                          </button>
                        </li>
                      )
                  })}
                </ul>
              </>
            )}
            
            {['dropped', 'reading', 'read', 'uploading', 'optimizing'].includes(image.state) && (
              <>
                <p>
                  <Button disabled>
                    <LoaderCircle className="w-5 h-5 text-white animate-spin" />
                    Optimizing
                  </Button>
                  <span className="block text-sm font-semibold animate-pulse text-transparent bg-zinc-200 rounded mt-2">Loading Size</span>
                </p>
                <ul>
                  {DOWNLOAD_FORMATS.map(format => {
                    return (
                      <li key={format} className="text-sm mb-1">
                        <span className="animate-pulse text-transparent bg-zinc-200 rounded">
                          Loading .{ format }
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </>
            )}
        </div>
      </div>
    </div>
  )
}

export default Result;