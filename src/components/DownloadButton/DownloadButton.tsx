"use client";

import { Download, LoaderCircle } from 'lucide-react';
import { MouseEvent, useEffect, useState } from 'react';

import { cn, downloadUrl, formatBytes } from '@/lib/util';

interface DownloadButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  filename?: string;
  url: string;
  className?: string;
  preload?: boolean;
  showSize?: boolean;
}

const DownloadButton = ({ children, url, filename = 'file', onClick, className, preload = false, showSize = false, ...rest }: DownloadButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [size, setSize] = useState<number | undefined>();

  useEffect(() => {
    if ( preload ) {
      (async function run() {
        setIsLoading(true);

        const image = await fetch(url);

        if ( showSize ) {
          const blob = await image.blob();
          setSize(blob.size);
        }

        setIsLoading(false);
      })();
    }
  }, [preload])

  async function handleOnClick(event: MouseEvent<HTMLButtonElement>) {
    if ( isLoading ) return;

    setIsLoading(true);
    
    await downloadUrl(url, filename, { downloadBlob: true });

    setIsLoading(false);

    if ( typeof onClick === 'function' ) {
      onClick(event);
    }
  }

  return (
    <button
      {...rest}
      onClick={handleOnClick}
      className={cn(
        'flex items-center gap-2',
        className,
        isLoading && 'text-zinc-500'
      )}
    >
      { !isLoading && <Download className="w-4 h-4" /> }
      { isLoading && <LoaderCircle className="w-4 h-4 animate-spin" /> }
      <span className="text-sm">{ children }</span>
      { size && showSize && (<span className="text-xs text-zinc-500">({ formatBytes(size, { fixed: 0 }) })</span>) }
    </button>
  )
}

export default DownloadButton;