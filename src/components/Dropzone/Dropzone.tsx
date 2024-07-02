'use client';

import {  useCallback, useEffect, useRef, useState } from 'react';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { dropTargetForExternal, monitorForExternal, } from '@atlaskit/pragmatic-drag-and-drop/external/adapter';
import { containsFiles, getFiles } from '@atlaskit/pragmatic-drag-and-drop/external/file';
import { preventUnhandled } from '@atlaskit/pragmatic-drag-and-drop/prevent-unhandled';

import { cn } from '@/lib/util';
import Button from '../Button';

interface UserUpload {
	type: 'image';
	dataUrl: string;
	name: string;
	size: number;
  file: File;
  status: string;
  errors?: Array<string>;
};

interface DropzoneProps {
  className?: string;
  onDrop?: (upload: UserUpload) => void;
  disabled?: boolean;
  maxSize?: number;
  maxFiles?: number;
  accept?: Record<string, Array<string>>;
}

// Based on example: https://atlassian.design/components/pragmatic-drag-and-drop/examples#file

const Dropzone = ({ className = '', onDrop, disabled = false, maxFiles, maxSize = 0, accept }: DropzoneProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const countRef = useRef<number>(0);
	const [state, setState] = useState<'idle' | 'potential' | 'over'>('idle');
	const [uploads, setUploads] = useState<UserUpload[]>([]);

  let dropzoneStyles = 'w-full text-center bg-white dark:bg-slate-950 rounded-2xl';

  if ( state === 'over' && !disabled ) {
    dropzoneStyles = `${dropzoneStyles} relative shadow-blue-400/60 before:content-["_"] before:block before:w-full before:h-full before:bg-blue-500 before:blur-lg dark:before:blur-xl before:opacity-60 before:absolute before:top-0 before:right-0 before:z-[-1] before:animate-faderight before:bg-[length:400%] before:bg-gradient-to-r before:from-blue-500 dark:before:from-blue-400 before:from-[10%] before:via-purple-600 dark:before:via-purple-500 before:to-blue-500 dark:before:to-blue-400 before:to-[90%]`;
  } else if ( disabled ) {
    dropzoneStyles = `${dropzoneStyles} shadow-[0px_4px_14px_0px_rgba(0,0,0,0.15)] shadow-red-200 dark:shadow-slate-900`;
  } else {
    dropzoneStyles = `${dropzoneStyles} shadow-[0px_4px_14px_0px_rgba(0,0,0,0.15)] shadow-zinc-200 dark:shadow-slate-900`;
  }

   // Creating a stable reference so that we can use it in our unmount effect.
   // If we used uploads as a dependency in the second `useEffect` it would run
   // every time the uploads changed, which is not desirable.

  const stableUploadsRef = useRef<UserUpload[]>(uploads);
    
  useEffect(() => {
    stableUploadsRef.current = uploads;
  }, [uploads]);

  useEffect(() => {
    return () => {
      // MDN recommends explicitly releasing the object URLs when possible,
      // instead of relying just on the browser's garbage collection.
      stableUploadsRef.current.forEach((upload) => {
        URL.revokeObjectURL(upload.dataUrl);
      });
    };
  }, []);

  // Set up and mount the programatic drag and drop instance

  useEffect(() => {
    const dropzone = ref.current;
    
    if ( !dropzone ) throw new Error('Unable to mount dropzone.');

    return combine(
      dropTargetForExternal({
        element: dropzone,
        canDrop: containsFiles,
        onDragEnter: () => setState('over'),
        onDragLeave: () => setState('potential'),
        onDrop: async ({ source }) => {
          const files = await getFiles({ source });

          files.forEach((file) => addUpload(file));
        },
      }),
      monitorForExternal({
        canMonitor: containsFiles,
        onDragStart: () => {
          setState('potential');
          preventUnhandled.start();
        },
        onDrop: () => {
          setState('idle');
          preventUnhandled.stop();
        },
      }),
    );
  }, []);


  // We trigger the file input manually when clicking the button. This also
  // works when selecting the button using a keyboard.
  //
  // We do this for two reasons:
  //
  // 1. Styling file inputs is very limited.
  // 2. Associating the button as a label for the input only gives us pointer
  //    support, but does not work for keyboard.

  const inputRef = useRef<HTMLInputElement>(null);

  const onInputTriggerClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  /**
   * addUpload
   */

  const addUpload = useCallback((file: File | null) => {
    if ( !file ) return;

    const acceptedFileType = isAcceptedFileType(file.type);
    const exceedsFileSize = typeof maxSize === 'number' ? file.size > maxSize : false;
    const exceedMaxFiles = typeof maxFiles === 'number' ? countRef.current >= maxFiles : false;
    const isRejected = !acceptedFileType || exceedsFileSize || exceedMaxFiles;

    const upload: UserUpload = {
      type: 'image',
      dataUrl: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      file,
      status: isRejected ? 'rejected' : 'accepted',
    };

    const errors = [];

    if ( !acceptedFileType ) {
      errors.push('File type not accepted.');
    }

    if ( exceedsFileSize ) {
      errors.push(`File size exceeds limit.`);
    }

    if ( exceedMaxFiles ) {
      errors.push(`Max allowed number of files reached.`);
    }

    if ( errors.length > 0 ) {
      upload.errors = errors;
    }

    countRef.current = countRef.current + 1;
    
    setUploads((current) => [...current, upload]);

    if ( typeof onDrop === 'function' ) {
      onDrop(upload);
    }
  }, []);

  // Add uploads that are selected using the file input element

  const onFileInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.currentTarget.files ?? []);
    files.forEach(addUpload);
  }, [addUpload]);

  /**
   * isAcceptedFileType
   */

  function isAcceptedFileType(fileType: string) {
    if ( typeof accept !== 'object' || accept[fileType] ) return true;
    return false;
  }

  function getAcceptedFileTypes(accept: Record<string, Array<string>> | undefined): string | undefined {
    if (!accept) return undefined;
    
    let acceptedMimeTypes = [] as string[];
    Object.entries(accept).forEach(([mimeType, extensions]) => {
      if (mimeType === 'image/heif') acceptedMimeTypes.push(...extensions); // The browser does not support the image/heif MIME type, so we need to add the extensions
      else acceptedMimeTypes.push(mimeType);
    });

    return acceptedMimeTypes.join(', ');
  }

  return (
    <>
      <div className={cn(dropzoneStyles, className)}>
        <div className="z-0">
          {!disabled && (
            <div
              ref={ref}
              data-testid="drop-target"
              className="px-6 py-10 sm:py-16"
            >
              <p>
                <svg className="w-full max-w-[6em] fill-zinc-400 dark:fill-zinc-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
                  <path d="M537.6 226.6c4.1-10.7 6.4-22.4 6.4-34.6 0-53-43-96-96-96-19.7 0-38.1 6-53.3 16.2C367 64.2 315.3 32 256 32c-88.4 0-160 71.6-160 160 0 2.7.1 5.4.2 8.1C40.2 219.8 0 273.2 0 336c0 79.5 64.5 144 144 144h368c70.7 0 128-57.3 128-128 0-61.9-44-113.6-102.4-125.4zM393.4 288H328v112c0 8.8-7.2 16-16 16h-48c-8.8 0-16-7.2-16-16V288h-65.4c-14.3 0-21.4-17.2-11.3-27.3l105.4-105.4c6.2-6.2 16.4-6.2 22.6 0l105.4 105.4c10.1 10.1 2.9 27.3-11.3 27.3z"></path>
                </svg>
                <strong className="block text-2xl font-bold mb-1">Drop an Image</strong>
                <span className="block mb-2">or</span>
                <span className="block">
                  <Button onClick={onInputTriggerClick}>Upload a File</Button>
                </span>
              </p>

              <p className="text-xs mt-4 text-zinc-600 dark:text-zinc-400">
                Maximum of 20 images at a time up to 10 mb each
              </p>

              <input
                ref={inputRef}
                id="file-input"
                className="sr-only"
                onChange={onFileInputChange}
                type="file"
                accept={getAcceptedFileTypes(accept)}
                multiple
              />
            </div>
          )}
          {disabled && (
            <div className="opacity-70 px-6 py-10 sm:py-16">
              <p>
                <svg className="w-full max-w-[6em] fill-red-500 dark:fill-zinc-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
                  <path d="M537.6 226.6c4.1-10.7 6.4-22.4 6.4-34.6 0-53-43-96-96-96-19.7 0-38.1 6-53.3 16.2C367 64.2 315.3 32 256 32c-88.4 0-160 71.6-160 160 0 2.7.1 5.4.2 8.1C40.2 219.8 0 273.2 0 336c0 79.5 64.5 144 144 144h368c70.7 0 128-57.3 128-128 0-61.9-44-113.6-102.4-125.4zM393.4 288H328v112c0 8.8-7.2 16-16 16h-48c-8.8 0-16-7.2-16-16V288h-65.4c-14.3 0-21.4-17.2-11.3-27.3l105.4-105.4c6.2-6.2 16.4-6.2 22.6 0l105.4 105.4c10.1 10.1 2.9 27.3-11.3 27.3z"></path>
                </svg>
                <strong className="block text-2xl font-bold mb-1">Maximum Images Reached</strong>
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Dropzone;