import { LoaderCircle, DownloadIcon } from 'lucide-react';

import { downloadUrl, formatBytes } from '@/lib/util';

import ProgressBar from '@/components/ProgressBar';
import Button from '@/components/Button';

const DOWNLOAD_FORMATS = ['avif', 'webp', 'jpg']

const stateMap: { [key: string]: string } = {
  ready: 'Ready',
  uploading: 'Uploading',
  finished: 'Done',
  optimizing: 'Optimizing',
}

interface ImageDownload {
  url?: string;
  size?: number;
  data?: Blob;
}

interface Image {
  id: string;
  name: string;
  format: string;
  size: number;
  data?: string | ArrayBuffer | null;
  file: File;
  state: string;
  upload?: CloudinaryResult;
  original?: ImageDownload;
  avif?: ImageDownload;
  webp?: ImageDownload;
  jpeg?: ImageDownload;
}

interface CloudinaryResult {
  bytes: number;
  public_id: string;
  secure_url: string;
}

interface DownloadProps {
  image: Image;
}

const Download = ({ image }: DownloadProps) => {
  let imageProgress = 0;

  if ( image.state === 'uploading' ) {
    imageProgress = 33;
  } else if ( image.state === 'optimizing' ) {
    imageProgress = 66
  } else if ( image.state === 'finished' ) {
    imageProgress = 100;
  }

  async function downloadFile(url: string, name: string, format: string) {
    if ( typeof image?.original?.url !== 'string' ) return;
    await downloadUrl(url, `${name}.${format}`, { downloadBlob: true });
  }
  
  return (
    <div className="flex w-full gap-10 mb-10">
      <span className="relative w-full max-w-[12em] self-start shadow-[0px_2px_8px_0px_rgba(0,0,0,0.15)]">
        {image.data && (
          <img className="block rounded" src={image.data as string} alt="Upload preview" />
        )}
        {!image.data && (
          <span className="block aspect-video w-full rounded bg-zinc-200" />
        )}
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
                      if ( !image?.original?.url ) return;
                      await downloadFile(image.original.url, image.name, image.format);
                    }}
                  >
                    <DownloadIcon className="w-5 h-5 text-white" />
                    Download { image.format?.toUpperCase() }
                  </Button>
                  {image?.original?.size && (
                    <span className="block text-sm font-semibold mt-2">Optimized Size: {formatBytes(image?.original?.size, { fixed: 0 }) }</span>
                  )}
                </p>
                <ul>
                  {DOWNLOAD_FORMATS
                    .filter(format => image?.[format as keyof Image])
                    .map(format => {
                      const download = image[format as keyof Image] as ImageDownload;
                      return (
                        <li key={format} className="text-sm mb-1">
                          <button
                            className="text-blue-600 hover:underline"
                            onClick={async () => {
                              if ( !download?.url ) return;
                              await downloadFile(download.url, image.name, format);
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
            
            {['dropped', 'read', 'uploading', 'optimizing'].includes(image.state) && (
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

export default Download;