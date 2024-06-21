"use client";

import { useState, useEffect, useRef } from 'react';
import { LoaderCircle, DownloadIcon, ArrowRight, ChevronDown } from 'lucide-react';

import { downloadUrl, formatBytes } from '@/lib/util';
import { getImageFormatFromType } from '@/lib/image';
import { ImageDownload, ImageUpload } from '@/types/image';

import Button from '@/components/Button';
import DownloadButton from '@/components/DownloadButton';

const DOWNLOAD_FORMATS = ['avif', 'webp', 'jpg', 'jxl']

interface DownloadProps {
  image: ImageUpload;
}

const Result = ({ image }: DownloadProps) => {
  const asButtonContainerRef = useRef<HTMLDivElement | null>(null);
  const [asDropdownOpen, setAsDropdownOpen] = useState(false);

  const downloadName = image.upload?.original_filename;
  const formatFormatted = getImageFormatFromType(image.file.type, true);

  const hasError = image.state === 'error' || image.errors;

  async function downloadFile(url: string, format: string) {
    if ( typeof image?.optimized?.url !== 'string' ) return;
    await downloadUrl(url, `${downloadName}.${format}`, { downloadBlob: true });
  }

  function handleDocumentOnClick(event: MouseEvent) {
    if ( asButtonContainerRef.current && !event.composedPath().includes(asButtonContainerRef.current) ) {
      setAsDropdownOpen(false);
    }
  }

  useEffect(() => {
    document.body.addEventListener('click', handleDocumentOnClick);
    return () => {
      document.body.removeEventListener('click', handleDocumentOnClick);
    }
  }, []);

  return (
    <div className="flex w-full gap-4 sm:gap-10 mb-10">
      <span className="relative w-24 sm:w-32 self-start shadow-[0px_2px_8px_0px_rgba(0,0,0,0.15)]">
        {image.data && (
          <img
            className="block rounded relative z-10 aspect-square object-cover"
            width={image.width}
            height={image.height}
            src={image.data as string }
            alt="Upload preview"
            loading="lazy"
            decoding="async"
          />
        )}
        <span className={`block absolute top-0 left-0 z-0 w-full rounded aspect-square bg-zinc-300 animate-pulse`} />
      </span>
      <div className="grid -mt-1 sm:mt-0">
        <h3 className="font-bold truncate mb-1">
          { image.name }
        </h3>
        <p className="flex flex-col xs:flex-row gap-2 xs:gap-2 xs:items-center sm:text-lg mb-4">

          <span className="flex items-center gap-2">
            <span className="text-purple-700 font-semibold bg-purple-100 border border-purple-400 rounded text-xs px-[.4em] py-[.2em] mr-1">
              { formatFormatted }
            </span>

            <span>{ image.size && formatBytes(image.size, { fixed: 0 }) }</span>
          </span>

          { !hasError && image?.optimized?.size && (
            <span className="flex items-center gap-2 h-6">
              <ArrowRight className="w-4 h-4 text-green-700" />
              <span className="font-bold text-green-600">
                {formatBytes(image?.optimized?.size, { fixed: 0 }) }
              </span>
            </span>
          )}


          { !hasError && !image?.optimized?.size && (
            <span className="flex items-center gap-2 h-6">
              <ArrowRight className="w-4 h-4 text-green-700" />
              <LoaderCircle className="w-4 h-4 animate-spin text-zinc-400" />
            </span>
          )}
        </p>

        <div className="flex justify-between mb-6">
          {['finished'].includes(image.state) && (
            <>
              <div className="flex gap-2 sm:gap-4 flex-col xs:flex-row">
                <Button
                  onClick={async () => {
                    if ( !image?.optimized?.url || !image.upload?.format ) return;
                    await downloadFile(image.optimized.url, image.upload.format);
                  }}
                >
                  <DownloadIcon className="w-5 h-5 text-white" />
                  Download
                </Button>

                <div ref={asButtonContainerRef} className="flex items-center relative">
                  <Button
                    className="bg-white hover:bg-white active:bg-white text-zinc-500 hover:text-zinc-400 border-2 border-zinc-400"
                    onClick={() => setAsDropdownOpen(!asDropdownOpen)}
                    size="xs"
                  >
                    Download As
                    <ChevronDown className="w-5 h-5" />
                  </Button>
                  {asDropdownOpen && (
                    <ul className="absolute top-[calc(100%_+_.5em)] left-0 min-w-full text-left whitespace-nowrap bg-white shadow-lg rounded px-2 py-2">
                      {DOWNLOAD_FORMATS
                        .filter(format => image?.[format as keyof ImageUpload])
                        .map(format => {
                          const download = image[format as keyof ImageUpload] as ImageDownload;
                          return (
                            <li key={format} className="font-semibold mb-1">
                              <DownloadButton
                                className="text-zinc-800 hover:text-zinc-500 px-2 py-1"
                                url={download?.url || ''}
                                filename={`${downloadName}.${format}`}
                                title={`Dowload as .${ format }`}
                                preload
                                showSize
                              >
                                .{ format }
                              </DownloadButton>
                            </li>
                          )
                      })}
                    </ul>
                  )}
                </div>
              </div>
            </>
          )}

          {!hasError && ['dropped', 'reading', 'read', 'uploading', 'optimizing'].includes(image.state) && (
            <div className="flex gap-4">
              <Button disabled>
                <LoaderCircle className="w-5 h-5 text-white animate-spin" />
                Optimizing
              </Button>
            </div>
          )}

          {hasError && (
            <>
              {Array.isArray(image.errors) && (
                <ul className="grid gap-1">
                  {image.errors.map((reason, index) => {
                    return (
                      <li key={index} className="text-sm text-red-700 bg-red-100 border-red-400 px-2 py-1 rounded">{ reason }</li>
                    );
                  })}
                </ul>
              )}
              {!Array.isArray(image.errors) && (
                <p>
                  Failed to optimize image.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Result;