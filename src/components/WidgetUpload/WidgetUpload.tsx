'use client';
import { useEffect, useState } from 'react';
import { getCldImageUrl } from 'next-cloudinary';
import pLimit from 'p-limit';

import { cn, formatBytes, getFileBlob, downloadBlob, downloadUrl, addNumbers } from '@/lib/util';

import Dropzone from '@/components/Dropzone';
import ProgressBar from '@/components/ProgressBar';
import Button from '@/components/Button';

const MAX_IMAGES = 20;
const MAX_SIZE = 10; // #MB

const stateMap: { [key: string]: string } = {
  ready: 'Ready',
  uploading: 'Uploading',
  finished: 'Done',
  optimizing: 'Optimizing',
}

interface WidgetUploadProps {
  className?: string;
}

interface CloudinaryResult {
  secure_url: string;
  bytes: number;
}

interface Image {
  id: string;
  name: string;
  size: number;
  data?: string | ArrayBuffer | null;
  file: File;
  state: string;
  upload?: CloudinaryResult;
  optimizedUrl?: string;
  optimizedSize?: number;
  optimizedData?: Blob;
}

const WidgetUpload = ({ className }: WidgetUploadProps) => {
  const [images, setImages] = useState<Array<Image> | null>(null);

  const imageStates = images?.map(({ state }) => state);
  const uploadingCount = imageStates?.filter(state => state === 'uploading').length;
  const finishedCount = imageStates?.filter(state => state === 'finished').length;
  const totalCount = Array.isArray(images) ? images.length : 0;

  const isUploadComplete = totalCount === finishedCount;
  const isDisabled = !!totalCount && totalCount >= MAX_IMAGES;

  const totalSizeOriginal = images && addNumbers(images.map(({ size }) => size));
  const totalSizeOptimized = isUploadComplete && images && addNumbers(images.map(({ optimizedSize }) => optimizedSize || 0));

  let globalState = 'ready';
  
  if ( finishedCount === totalCount ) {
    globalState = 'finished'
  } else if ( typeof uploadingCount === 'number' && uploadingCount > 0 ) {
    globalState = 'uploading';
  }

  let uploadContainerClassName = '';

  if ( Array.isArray(images) && images.length > 0 ) {
    uploadContainerClassName = 'grid md:grid-cols-2 gap-10';
  }

  useEffect(() => {
    const filesToUpload = images?.filter(({ state }) => state === 'read');

    if ( !Array.isArray(filesToUpload) || filesToUpload.length === 0 ) return;

    (async function run() {
      const limitUploadFiles = pLimit(4);

      const uploadsQueue = filesToUpload.map((upload) => {
        return limitUploadFiles(() => {
          async function uploadFile() {
            const imageToUpload = upload as Image;

            setImages(prev => {
              return [...(prev || [])].map(image => {
                const nextImage = {...image};
                if ( image.id === imageToUpload.id ) {
                  nextImage.state = 'uploading';
                }
                return nextImage;
              });
            });

            const formData = new FormData();

            formData.append('file', imageToUpload.file);

            const results = await fetch('/api/upload', {
              method: 'POST',
              body: formData
            }).then(r => r.json());

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
              format: 'default'
            });

            const optimizedData = await getFileBlob(optimizedUrl);
            const optimizedSize = optimizedData.size;

            setImages(prev => {
              return [...(prev || [])].map(image => {
                const nextImage = { ...image };
                if ( image.id === imageToUpload.id ) {
                  nextImage.state = 'finished';
                  nextImage.optimizedUrl = optimizedUrl;
                  nextImage.optimizedSize = optimizedSize;
                  nextImage.optimizedData = optimizedData;
                }
                return nextImage;
              });
            });

            return {
              ...imageToUpload,
              upload
            }
          }
          return uploadFile();
        });
      });

      await Promise.all(uploadsQueue);
    })();
  }, [images]);

  /**
   * handleOnDrop
   */

  async function handleOnDrop(acceptedFiles: Array<File>) {
    const dropDate = Date.now();

    const uploads = acceptedFiles.map(acceptedFile => {
      const image: Image = {
        id: `${dropDate}-${acceptedFile.name}`,
        name: acceptedFile.name,
        size: acceptedFile.size,
        file: acceptedFile,
        state: 'dropped'
      }
      return image;
    })

    setImages(prev => {
      const nextImages = [
        ...(prev || []),
        ...uploads
      ];
      return nextImages;
    });

    const limitReadFiles = pLimit(1);

    const filesQueue = uploads.map(upload => {
      return limitReadFiles(() => {
        return new Promise((resolve) => {
          const file = new FileReader;

          file.onload = function() {
            requestAnimationFrame(() => {
              const results = {
                ...upload,
                data: file.result,
                state: 'read'
              }

              setImages(prev => {
                return [...(prev || [])].map(image => {
                  let nextImage = { ...image };
                  if ( image.id === upload.id ) {
                    nextImage = { ...results };
                  }
                  return nextImage;
                });
              });

              resolve(results);
            })
          }

          file.readAsDataURL(upload.file)
        })
      });
    });

    await Promise.all(filesQueue);
  }

  function handleOnDownloadAll() {
    const downloads = images?.filter(({ optimizedUrl }) => !!optimizedUrl).map(({ name, optimizedUrl }) => {
      return {
        name,
        optimizedUrl
      }
    });
    downloadUrl(`/api/archive?urls=${JSON.stringify(downloads)}`, 'imgtoxyz.zip');
  }

  return (
    <div className={cn('', className)}>
      <div className={`${uploadContainerClassName} mb-20`}>
        <Dropzone
          className="min-h-0 self-start"
          onDrop={handleOnDrop}
          disabled={isDisabled}
          maxSize={MAX_SIZE}
          maxFiles={MAX_IMAGES}
        />
        {Array.isArray(images) && (
          <section>
            <h2 className="flex justify-between mb-5">
              <span className="text-xl font-bold">{ images.length } images</span>
              {totalSizeOriginal && totalSizeOptimized && (
                <span className="text-xl font-bold text-green-600">Saved { (( totalSizeOptimized / totalSizeOriginal ) * 100).toFixed(0) }%</span>
              )}
            </h2>
            <ul className="grid grid-cols-8 gap-2 mb-7">
              {images.map((image, index) => {
                return (
                  <li key={image.id} className="p-1 relative rounded-lg shadow-[0px_2px_8px_0px_rgba(0,0,0,0.15)]">
                    <a href={`#image-${index}`}>
                      {image.data && (
                        <img className="block aspect-square object-cover rounded" src={image.data as string} alt="Upload preview" />  
                      )}
                      {!image.data && (
                        <span className="block aspect-square w-full rounded bg-slate-200" />
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
            <div className="mb-6">
              {typeof finishedCount === 'number' && typeof totalCount === 'number' && (
                <ProgressBar progress={finishedCount / totalCount * 100} />
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
            <div className="flex justify-between mb-6">
              <ul>
                <li className="text-xs mb-2">Total Original: { totalSizeOriginal && formatBytes(totalSizeOriginal, { fixed: 0 }) }</li>
                <li className="text-xs">Total Optimized: { totalSizeOptimized && formatBytes(totalSizeOptimized, { fixed: 0 }) }</li>
              </ul>
              {globalState === 'finished' && (
                <p>
                  <Button onClick={handleOnDownloadAll}>
                    <svg className="fill-white w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
                      <path d="M537.6 226.6c4.1-10.7 6.4-22.4 6.4-34.6 0-53-43-96-96-96-19.7 0-38.1 6-53.3 16.2C367 64.2 315.3 32 256 32c-88.4 0-160 71.6-160 160 0 2.7.1 5.4.2 8.1C40.2 219.8 0 273.2 0 336c0 79.5 64.5 144 144 144h368c70.7 0 128-57.3 128-128 0-61.9-44-113.6-102.4-125.4zm-132.9 88.7L299.3 420.7c-6.2 6.2-16.4 6.2-22.6 0L171.3 315.3c-10.1-10.1-2.9-27.3 11.3-27.3H248V176c0-8.8 7.2-16 16-16h48c8.8 0 16 7.2 16 16v112h65.4c14.2 0 21.4 17.2 11.3 27.3z"></path>
                    </svg>
                    Download All
                  </Button>
                </p>
              )}
            </div>
          </section>
        )}
      </div>
      {Array.isArray(images) && (
        <div className="w-full max-w-2xl mx-auto">
          <ul>
            {images.map((image, index) => {
              // Fake the progress with simply the steps for now until we can get real upload progress
              let imageProgress = 0;

              if ( image.state === 'uploading' ) {
                imageProgress = 33;
              } else if ( image.state === 'optimizing' ) {
                imageProgress = 66
              } else if ( image.state === 'finished' ) {
                imageProgress = 100;
              }

              function handleOnDownload() {
                if ( !(image?.optimizedData instanceof Blob) ) return;
                downloadBlob(image.optimizedData, image.name);
              }

              return (
                <li key={image.id} id={`image-${index}`} className="flex w-full gap-10 mb-10">
                  <span className="w-full max-w-[12em] self-start shadow-[0px_2px_8px_0px_rgba(0,0,0,0.15)]">
                    {image.data && (
                      <img className="block rounded" src={image.data as string} alt="Upload preview" />
                    )}
                    {!image.data && (
                      <span className="block aspect-video w-full rounded bg-slate-200" />
                    )}
                  </span>
                  <div className="grow">
                    <h3 className="font-bold mb-4">{ image.name }</h3>
                    <div className="mb-5">
                      <ProgressBar progress={imageProgress} />
                      <div className="flex justify-between">
                        <p className="text-xs font-bold">
                          { stateMap[image.state] }
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between mb-6">
                      <ul>
                        <li className="text-xs mb-2">Total Original: { image.size && formatBytes(image.size) }</li>
                        <li className="text-xs">Total Optimized: { image.optimizedSize && formatBytes(image.optimizedSize) }</li>
                      </ul>
                      <p>
                        {image.optimizedData && (
                          <Button onClick={handleOnDownload} size="xs">
                            <svg className="fill-white w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
                              <path d="M537.6 226.6c4.1-10.7 6.4-22.4 6.4-34.6 0-53-43-96-96-96-19.7 0-38.1 6-53.3 16.2C367 64.2 315.3 32 256 32c-88.4 0-160 71.6-160 160 0 2.7.1 5.4.2 8.1C40.2 219.8 0 273.2 0 336c0 79.5 64.5 144 144 144h368c70.7 0 128-57.3 128-128 0-61.9-44-113.6-102.4-125.4zm-132.9 88.7L299.3 420.7c-6.2 6.2-16.4 6.2-22.6 0L171.3 315.3c-10.1-10.1-2.9-27.3 11.3-27.3H248V176c0-8.8 7.2-16 16-16h48c8.8 0 16 7.2 16 16v112h65.4c14.2 0 21.4 17.2 11.3 27.3z"></path>
                            </svg>
                            Download
                          </Button>
                        )}
                      </p>
                    </div>
                  </div>
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