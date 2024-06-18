'use client';

import { useCallback } from 'react';
import { DropEvent, FileRejection, useDropzone } from 'react-dropzone';

import { cn } from '@/lib/util';
import Button from '../Button';

interface DropzoneProps {
  className?: string;
  onDrop?: Function;
  disabled?: boolean;
  maxSize?: number;
  maxFiles?: number;
}

const Dropzone = ({ className = '', onDrop, disabled = false, maxFiles, maxSize = 0 }: DropzoneProps) => {
  const handleOnDrop = useCallback((acceptedFiles: Array<File>, rejectedFiles: Array<FileRejection>, event: DropEvent) => {
    if ( typeof onDrop === 'function' ) {
      onDrop(acceptedFiles, rejectedFiles, event)
    }
  }, [])
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleOnDrop,
    accept: {
      'image/avif': ['.avif'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxFiles,
    maxSize: maxSize * 1000000, // 10mb
    disabled
  });

  let dropzoneStyles = 'w-full text-center bg-white dark:bg-zinc-900 rounded-2xl';

  if ( isDragActive && !disabled ) {
    dropzoneStyles = `${dropzoneStyles} relative shadow-blue-400/60 before:content-["_"] before:block before:w-full before:h-full before:bg-blue-500 before:blur-lg dark:before:blur-xl before:opacity-60 before:absolute before:top-0 before:right-0 before:z-[-1] before:animate-faderight before:bg-[length:400%] before:bg-gradient-to-r before:from-blue-500 dark:before:from-blue-400 before:from-[10%] before:via-purple-600 dark:before:via-purple-500 before:to-blue-500 dark:before:to-blue-400 before:to-[90%]`;
  } else if ( disabled ) {
    dropzoneStyles = `${dropzoneStyles} shadow-[0px_4px_14px_0px_rgba(0,0,0,0.15)] shadow-red-200 dark:shadow-zinc-900`;
  } else {
    dropzoneStyles = `${dropzoneStyles} shadow-[0px_4px_14px_0px_rgba(0,0,0,0.15)] shadow-zinc-200 dark:shadow-zinc-900`;
  }

  return (
    <div className={cn(dropzoneStyles, className)}>
      <div className="z-0">
        {!disabled && (
          <div {...getRootProps()} className="px-6 py-10 sm:py-16">
            <input {...getInputProps()} />
            <p>
              <svg className="w-full max-w-[6em] fill-zinc-400 dark:fill-zinc-400 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
                <path d="M537.6 226.6c4.1-10.7 6.4-22.4 6.4-34.6 0-53-43-96-96-96-19.7 0-38.1 6-53.3 16.2C367 64.2 315.3 32 256 32c-88.4 0-160 71.6-160 160 0 2.7.1 5.4.2 8.1C40.2 219.8 0 273.2 0 336c0 79.5 64.5 144 144 144h368c70.7 0 128-57.3 128-128 0-61.9-44-113.6-102.4-125.4zM393.4 288H328v112c0 8.8-7.2 16-16 16h-48c-8.8 0-16-7.2-16-16V288h-65.4c-14.3 0-21.4-17.2-11.3-27.3l105.4-105.4c6.2-6.2 16.4-6.2 22.6 0l105.4 105.4c10.1 10.1 2.9 27.3-11.3 27.3z"></path>
              </svg>
              <strong className="block text-2xl font-bold mb-1">Drop an Image</strong>
              <span className="block mb-2">or</span>
              <span className="block">
                <Button>Upload a File</Button>
              </span>
            </p>
            <p className="text-xs mt-4 text-zinc-600 dark:text-zinc-400">
              Maximum of 20 images at a time up to 10 mb each
            </p>
          </div>
        )}
        {disabled && (
          <div className="opacity-70">
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
  )
}

export default Dropzone;