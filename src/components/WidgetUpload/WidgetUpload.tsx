'use client';

import { useEffect, useState } from 'react';
import { preconnect } from 'react-dom'
import { Check, DownloadIcon, LoaderCircle } from 'lucide-react';

import { getCldImageUrl } from 'next-cloudinary';
import pLimit from 'p-limit';
import { toast } from 'sonner';

import { cn, formatBytes, getFileBlob, downloadUrl, addNumbers } from '@/lib/util';
import { readImage } from '@/lib/image';
import { uploadFile } from '@/lib/cloudinary';
import { ImageUpload } from '@/types/image';

import Dropzone from '@/components/Dropzone';
import ProgressBar from '@/components/ProgressBar';
import Button from '@/components/Button';
import Result from '@/components/Result';

const MAX_IMAGES = 20;
const MAX_SIZE = 10 * 1000000; // 10MB

const stateMap: { [key: string]: string } = {
  ready: 'Ready',
  uploading: 'Uploading',
  finished: 'Done',
  optimizing: 'Optimizing',
}

interface WidgetUploadProps {
  className?: string;
}

const WidgetUpload = ({ className }: WidgetUploadProps) => {
  const [images, setImages] = useState<Array<ImageUpload> | null>(null);
  const [archiveState, setArchiveState] = useState('ready');

  const imageStates = images?.map(({ state }) => state);
  const uploadingCount = imageStates?.filter(state => state === 'uploading').length || 0;
  const optimizingCount = imageStates?.filter(state => state === 'optimizing').length || 0;
  const errorCount = imageStates?.filter(state => state === 'error').length || 0;
  const finishedCount = (imageStates?.filter(state => state === 'finished').length || 0) + errorCount;
  const totalCount = Array.isArray(images) ? images.length : 0;

  const isUploading = typeof uploadingCount === 'number' && uploadingCount > 0;
  const isOptimizing = typeof optimizingCount === 'number' && optimizingCount > 0;
  const isUploadComplete = totalCount === finishedCount;
  const isDisabled = !!totalCount && totalCount >= MAX_IMAGES;
  const isFinished = totalCount === finishedCount + errorCount;

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

  // Establish connection with Cloudinary before requests

  useEffect(() => preconnect('https://res.cloudinary.com'), []);

  // Upload all of the images

  useEffect(() => {
    const filesToUpload = images?.filter(({ state }) => state === 'read' );
    const ids = filesToUpload?.map(({ id }) => id);

    if ( !Array.isArray(filesToUpload) || filesToUpload.length === 0 ) return;

    setImages(prev => {
      return [...(prev || [])].map(image => {
        const nextImage = { ...image };
        if ( ids?.includes(nextImage.id) ) {
          nextImage.state = 'uploading';
        }
        return nextImage;
      });
    });

    (async function run() {
      const limitUploadFiles = pLimit(10);

      const uploadsQueue = filesToUpload.map((upload: any) => {
        return limitUploadFiles(() => {
          async function startUpload() {
            const imageToUpload = upload as ImageUpload;

            let results;

            try {
              results = await uploadFile(imageToUpload.file);
            } catch(e) {
              let message: string | undefined;

              if ( e instanceof Error ) {
                if ( e.message === 'INAPPROPRIATE_CONTENT' ) {
                  message = 'An image you uploaded appears to be inappropriate and not supported by imgto.xyz. If you think this is in error, please email community@cloudinary.com.';
                } else if ( e.message.includes('minimum pixel resolution') ) {
                  message = 'Images smaller than 80x80px are not supported.';
                }
              }

              toast.error(message || 'Something went wrong, try again!');

              setImages(prev => {
                return [...(prev || [])].map(image => {
                  const nextImage = { ...image };
                  if ( image.id === imageToUpload.id ) {
                    nextImage.state = 'error';

                    if ( message ) {
                      nextImage.errors = [message]
                    }
                  }
                  return nextImage;
                });
              });
              return;
            }

            setImages(prev => {
              return [...(prev || [])].map(image => {
                const nextImage = { ...image };
                if ( image.id === imageToUpload.id ) {
                  nextImage.state = 'optimizing';
                  nextImage.upload = results;
                }
                return nextImage;
              });
            });

            const optimizedUrl = getCldImageUrl({
              src: results.public_id,
              format: 'default',
              quality: 'auto:low'
            });

            let optimizedData;

            try {
              optimizedData = await getFileBlob(optimizedUrl);
            } catch(e) {
              let message = 'Unknown Error';

              if ( e instanceof Error ) {
                if ( e.message === 'UNAUTHORIZED' ) {
                  message = 'Someting went wrong. Try disabling any Ad Blockers and try again!';
                }
              }

              toast.error(message);

              setImages(prev => {
                return [...(prev || [])].map(image => {
                  const nextImage = { ...image };
                  if ( image.id === imageToUpload.id ) {
                    nextImage.state = 'error';
                  }
                  return nextImage;
                });
              });

              return;
            }

            const optimizedSize = optimizedData.size;

            const avifUrl = getCldImageUrl({
              src: results.public_id,
              format: 'avif',
              quality: 'auto:low'
            });

            const webpUrl = getCldImageUrl({
              src: results.public_id,
              format: 'webp',
              quality: 'auto:low'
            });

            const jpgUrl = getCldImageUrl({
              src: results.public_id,
              format: 'jpg',
              quality: 'auto:low'
            });

            const jxlUrl = getCldImageUrl({
              src: results.public_id,
              format: 'jxl',
              quality: 'auto:low'
            });

            const formats: Record<string, string | object> = {
              optimized: {
                url: optimizedUrl,
                data: optimizedData,
                size: optimizedSize
              },
              avif: {
                url: avifUrl,
              },
              webp: {
                url: webpUrl,
              },
              jpg: {
                url: jpgUrl,
              },
              jxl: {
                url: jxlUrl,
              },
            };

            setImages(prev => {
              return [...(prev || [])].map(image => {
                const nextImage = { ...image };
                if ( image.id === imageToUpload.id ) {
                  nextImage.state = 'finished';
                  Object.assign(nextImage, formats);
                }
                return nextImage;
              });
            });

            return {
              ...imageToUpload,
              upload
            }
          }
          return startUpload();
        });
      });

      await Promise.all(uploadsQueue);
    })();
  }, [images]);

  // Read in the images and grab the image data and sizes

  useEffect(() => {
    const files = images?.filter(({ state }) => state === 'dropped');
    const ids = files?.map(({ id }) => id);

    if ( !files || files.length === 0 ) return;

    setImages(prev => {
      return [...(prev || [])].map(image => {
        const nextImage = { ...image };
        if ( ids?.includes(nextImage.id) ) {
          nextImage.state = 'reading';
        }
        return nextImage;
      });
    });

    files.forEach(async (file) => {
      const { img, data } = await readImage(file.file);

      const imageData = {
        img,
        data,
        width: img.width,
        height: img.height,
        // Now that it's read, put it in an error state
        // to update the UI
        state: file.errors ? 'error' : 'read'
      }

      setImages(prev => {
        return [...(prev || [])].map(image => {
          let nextImage = { ...image };
          if ( image.id === file.id ) {
            nextImage = {
              ...file,
              ...imageData,
            };
          }
          return nextImage;
        });
      });
    });
  }, [images])

  /**
   * handleOnDownloadAll
   */

  async function handleOnDownloadAll() {
    if ( archiveState !== 'ready' ) return;

    setArchiveState('archiving');

    const downloads = images?.filter(({ optimized }) => !!optimized).map(({ name, upload, optimized }) => {
      return {
        name,
        format: upload?.format,
        url: optimized?.url
      }
    });

    await downloadUrl(`/api/archive?urls=${JSON.stringify(downloads)}`, 'imgtoxyz.zip');

    setArchiveState('finished');

    setTimeout(() => {
      setArchiveState('ready');
    }, 2000)
  }

  return (
    <div className={cn('', className)}>
      <div className={`${uploadContainerClassName} mb-20`}>
        <Dropzone
          className="min-h-0 self-start"

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
                  <Result image={image} />
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