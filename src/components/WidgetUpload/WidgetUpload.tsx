'use client';

import { useEffect, useState } from 'react';
import { Check, DownloadIcon, LoaderCircle } from 'lucide-react';

import { toast } from 'sonner';

import { cn, formatBytes, downloadBlob, addNumbers, getUniqueFilename, HttpError } from '@/lib/util';
import { readImage } from '@/lib/image';
import { uploadFile } from '@/lib/cloudinary';
import { readQueue, uploadQueue, withRetry, fetchAssetBlob } from '@/lib/queue';
import {
  DEFAULT_TRANSFORMATION_SETTINGS,
  TransformationSettings,
  getTransformedUrl,
  resolveFormat,
} from '@/lib/transformations';
import { ImageDownload, ImageUpload } from '@/types/image';
import { CloudinaryResource } from '@/types/cloudinary';

import Dropzone from '@/components/Dropzone';
import ProgressBar from '@/components/ProgressBar';
import Button from '@/components/Button';
import Result from '@/components/Result';
import TransformationControls from '@/components/TransformationControls';

const MAX_IMAGES = 20;
const MAX_SIZE = 10 * 1000000; // 10MB

const stateMap: { [key: string]: string } = {
  ready: 'Ready',
  uploading: 'Uploading',
  finished: 'Done',
  optimizing: 'Optimizing',
}

function getImageUrl(upload: CloudinaryResource, settings: TransformationSettings) {
  return getTransformedUrl({
    ...settings,
    publicId: upload.public_id,
    originalFormat: upload.format,
  });
}

interface WidgetUploadProps {
  className?: string;
}

const WidgetUpload = ({ className }: WidgetUploadProps) => {
  const [images, setImages] = useState<Array<ImageUpload> | null>(null);
  const [archiveState, setArchiveState] = useState('ready');
  const [settings, setSettings] = useState<TransformationSettings>(DEFAULT_TRANSFORMATION_SETTINGS);

  const imageStates = images?.map(({ state }) => state);
  const uploadingCount = imageStates?.filter(state => state === 'uploading').length || 0;
  const optimizingCount = imageStates?.filter(state => ['uploaded', 'optimizing'].includes(state)).length || 0;
  const errorCount = imageStates?.filter(state => state === 'error').length || 0;
  const finishedCount = (imageStates?.filter(state => state === 'finished').length || 0) + errorCount;
  const totalCount = Array.isArray(images) ? images.length : 0;

  const isUploading = typeof uploadingCount === 'number' && uploadingCount > 0;
  const isOptimizing = typeof optimizingCount === 'number' && optimizingCount > 0;
  const isUploadComplete = totalCount === finishedCount;
  const isDisabled = !!totalCount && totalCount >= MAX_IMAGES;
  const isFinished = totalCount === finishedCount;

  const hasDownloadsAvailable = typeof finishedCount === 'number' && finishedCount > 0;

  let progress = 0;

  if ( isFinished ) {
    progress = 100;
  } else if ( typeof finishedCount === 'number' && typeof totalCount === 'number' ) {
    // If the optimization process has started, we want to show an indication that
    // progress has been made, even if that's simply just that it's started, so we
    // fake this by taking the actual process, reducing it to 7/8, and hard coding
    // an additional 1/8 that's always present until completion, resulting in
    // a consistent progress display
    progress = 12.5 + ( ( finishedCount / totalCount * 100 ) / 8 * 7 );
  }

  const totalSizeOriginal = images && addNumbers(images.map(({ size }) => size));
  const totalSizeOptimized = isUploadComplete && images && addNumbers(images.map(({ optimized }) => optimized?.size || 0));

  let globalState = 'ready';

  if ( finishedCount === totalCount ) {
    globalState = 'finished'
  } else if ( isUploading || isOptimizing ) {
    globalState = 'optimizing';
  }

  let uploadContainerClassName = '';

  if ( Array.isArray(images) && images.length > 0 ) {
    uploadContainerClassName = 'grid md:grid-cols-2 gap-10';
  }

  // Read in the images and grab the image data and sizes. Reading is CPU bound
  // (especially HEIC decoding) so it goes through the shared read queue

  useEffect(() => {
    const files = images?.filter(({ state }) => state === 'dropped');

    if ( !files || files.length === 0 ) return;

    updateImages(files.map(({ id }) => id), { state: 'reading' });

    files.forEach(async (file) => {
      try {
        const { img, data } = await readQueue(() => readImage(file.file));

        updateImages([file.id], {
          img,
          data,
          width: img.width,
          height: img.height,
          // Now that it's read, put it in an error state
          // to update the UI
          state: file.errors ? 'error' : 'read'
        });
      } catch(e) {
        updateImages([file.id], {
          state: 'error',
          errors: file.errors || ['Unable to read image.'],
        });
      }
    });
  }, [images]);

  // Upload all of the images through the shared upload queue, retrying
  // transient failures like rate limits with backoff

  useEffect(() => {
    const filesToUpload = images?.filter(({ state }) => state === 'read');

    if ( !filesToUpload || filesToUpload.length === 0 ) return;

    updateImages(filesToUpload.map(({ id }) => id), { state: 'uploading' });

    filesToUpload.forEach(async (imageToUpload) => {
      try {
        const results = await uploadQueue(() => withRetry(() => uploadFile(imageToUpload.file)));
        updateImages([imageToUpload.id], { state: 'uploaded', upload: results });
      } catch(e) {
        console.error('Failed to upload image', e);

        let message: string | undefined;

        if ( e instanceof Error ) {
          if ( e.message === 'INAPPROPRIATE_CONTENT' ) {
            message = 'An image you uploaded appears to be inappropriate and not supported by imgto.xyz. If you think this is in error, please email community@cloudinary.com.';
          } else if ( e.message.includes('minimum pixel resolution') ) {
            message = 'Images smaller than 80x80px are not supported.';
          } else if ( e instanceof HttpError && [420, 429].includes(e.status) ) {
            message = 'Too many images are being optimized right now, try again in a few minutes.';
          }
        }

        toast.error(message || 'Something went wrong, try again!');

        updateImages([imageToUpload.id], {
          state: 'error',
          ...(message && { errors: [message] }),
        });
      }
    });
  }, [images]);

  // Optimize uploaded images with the current settings. Finished images whose
  // delivered URL no longer matches the settings are re-optimized, which also
  // catches settings that changed while an image was mid-optimization

  useEffect(() => {
    const imagesToOptimize = images?.filter(({ state, upload, optimized }) => {
      if ( !upload ) return false;
      if ( state === 'uploaded' ) return true;
      return state === 'finished' && optimized?.url !== getImageUrl(upload, settings);
    });

    if ( !imagesToOptimize || imagesToOptimize.length === 0 ) return;

    updateImages(imagesToOptimize.map(({ id }) => id), { state: 'optimizing' });

    imagesToOptimize.forEach(async (image) => {
      const upload = image.upload as CloudinaryResource;
      const url = getImageUrl(upload, settings);

      try {
        const blob = await fetchAssetBlob(url);

        updateImages([image.id], {
          state: 'finished',
          optimized: {
            url,
            format: resolveFormat(settings.format, upload.format),
            size: blob.size,
          }
        });
      } catch(e) {
        console.error('Failed to optimize image', e);

        let message = 'Something went wrong optimizing your image.';

        if ( e instanceof Error && e.message === 'UNAUTHORIZED' ) {
          message = 'Someting went wrong. Try disabling any Ad Blockers and try again!';
        }

        toast.error(message);

        updateImages([image.id], { state: 'error', errors: [message] });
      }
    });
  }, [images, settings]);

  /**
   * updateImages
   */

  function updateImages(ids: Array<string>, changes: Partial<ImageUpload>) {
    setImages(prev => {
      return [...(prev || [])].map(image => {
        if ( !ids.includes(image.id) ) return image;
        return { ...image, ...changes };
      });
    });
  }

  /**
   * handleOnDownloadAll
   * @description Zips in the browser using the blobs already fetched while
   *   optimizing, so nothing is downloaded twice or proxied through the server
   */

  async function handleOnDownloadAll() {
    if ( archiveState !== 'ready' || !images ) return;

    setArchiveState('archiving');

    try {
      const { default: JSZip } = await import('jszip');
      const zip = new JSZip();
      const usedFilenames = new Set<string>();

      // Names are assigned up front so duplicates are numbered in display order

      const downloads = images
        .filter(({ state, optimized }) => state === 'finished' && !!optimized)
        .map(({ name, upload, optimized }) => {
          const download = optimized as ImageDownload;
          const baseName = upload?.original_filename || name.replace(/\.[^.]+$/, '');
          return {
            url: download.url,
            filename: getUniqueFilename(baseName, download.format, usedFilenames),
          };
        });

      await Promise.all(downloads.map(async ({ url, filename }) => {
        zip.file(filename, await fetchAssetBlob(url));
      }));

      // Images are already compressed, so skip deflating them again

      const archive = await zip.generateAsync({ type: 'blob', compression: 'STORE' });

      downloadBlob(archive, 'imgtoxyz.zip');

      setArchiveState('finished');
    } catch(e) {
      toast.error('Failed to create zip, try again!');
      setArchiveState('ready');
      return;
    }

    setTimeout(() => {
      setArchiveState('ready');
    }, 2000)
  }

  return (
    <div className={cn('', className)}>
      <div className={`${uploadContainerClassName} mb-20`}>
        <div className="grid gap-8 self-start">
          <Dropzone
            className="min-h-0"

            accept={{
              'image/avif': ['.avif'],
              'image/jpeg': ['.jpg', '.jpeg'],
              'image/png': ['.png'],
              'image/webp': ['.webp'],
              'image/jxl': ['.jxl'],
              'image/heif': ['.heic', '.heif'],
              'image/heic': ['.heic'],
            }}
            onDrop={(droppedFile) => {
              const dropDate = Date.now();

              const upload: ImageUpload = {
                id: `${dropDate}-${droppedFile.name}`,
                name: droppedFile.name,
                size: droppedFile.size,
                file: droppedFile.file,
              
                // Don't yet put it in an error state so that we can allow the image
                // to be read into the document

                state: 'dropped',
              };

              if ( droppedFile.errors ) {
                upload.errors = droppedFile.errors;
              }

              setImages(prev => {
                const nextImages = [
                  ...(prev || []),
                  upload
                ];
                return nextImages;
              });
            }}
            disabled={isDisabled}
            maxSize={MAX_SIZE}
            maxFiles={MAX_IMAGES}
          />

          <TransformationControls
            settings={settings}
            onChange={setSettings}
          />
        </div>

        {Array.isArray(images) && (
          <section>
            <h2 className="flex justify-between mb-1">
              <span className="text-xl font-bold">{ images.length } images</span>
              {totalSizeOriginal && totalSizeOptimized && (
                <span className="text-xl font-bold text-green-600">Saved { (100 - (( totalSizeOptimized / totalSizeOriginal ) * 100)).toFixed(0) }%</span>
              )}
            </h2>
            <p className="text-sm mb-5">
              Total Original Size: { totalSizeOriginal && formatBytes(totalSizeOriginal, { fixed: 0 }) }
            </p>
            <ul className={cn(
                `grid gap-2 mb-7`,
                images.length <= 16 && 'grid-cols-8',
                images.length > 16 && 'grid-cols-10'
              )
            }>
              {images.map((image) => {
                return (
                  <li
                    key={image.id}
                    className={cn(
                      `p-0.5 relative rounded-lg shadow-[0px_2px_8px_0px_rgba(0,0,0,0.15)]`,
                      image.state === 'error' ? 'bg-red-500' : 'bg-white'
                    )}
                  >
                    <a href={`#${image.id}`} className="block aspect-square relative">
                      {image.data && (
                        <img
                          className="block w-full aspect-square object-cover rounded-[.4rem] relative z-10"
                          width={image.width}
                          height={image.height}
                          src={image.data as string}
                          alt="Upload preview"
                          decoding="async"
                          loading="lazy"
                        />
                      )}
                      <span className="block absolute top-0 left-0 z-0 w-full aspect-square rounded-[.4rem] bg-white overflow-hidden">
                        <span className="block w-full h-full bg-zinc-200 animate-pulse" />
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>

            <div className="mb-6">
              {typeof progress === 'number' && (
                <ProgressBar progress={progress} />
              )}
              <div className="flex justify-between">
                <p className="text-xs font-bold">
                  { stateMap[globalState] }
                </p>
                <p className="text-xs font-bold">
                  { finishedCount } of { totalCount } Complete
                </p>
              </div>
            </div>

            {globalState === 'finished' && hasDownloadsAvailable && (
              <div className="flex justify-between mb-6">
                <div>
                  <p className="mb-2">
                    <Button onClick={handleOnDownloadAll}>
                      { archiveState === 'archiving' && (
                        <LoaderCircle className="text-white w-5 h-5 animate-spin" />
                      )}
                      {archiveState === 'ready' && (
                        <DownloadIcon className="w-5 h-5 text-white" />
                      )}
                      {archiveState === 'finished' && (
                        <Check className="text-white w-5 h-5" />
                      )}
                      Download All
                    </Button>
                  </p>
                  <p className="block text-sm font-bold">
                    Total Optimized: { totalSizeOptimized && formatBytes(totalSizeOptimized, { fixed: 0 }) }
                  </p>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
      
      {Array.isArray(images) && (
        <div className="w-full max-w-xl mx-auto">
          <ul>
            {images.map((image) => {
              return (
                <li key={image.id} id={image.id} >
                  <Result image={image} settings={settings} />
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

export default WidgetUpload;