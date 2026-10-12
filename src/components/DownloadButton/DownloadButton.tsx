"use client";

import { Download, LoaderCircle } from 'lucide-react';
import { MouseEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { cn, downloadBlob, formatBytes } from '@/lib/util';
import { fetchAssetBlob } from '@/lib/queue';

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

  // Preloading warms the shared cache so the click downloads instantly

  useEffect(() => {
    if ( !preload ) return;

    let isCurrent = true;

    setIsLoading(true);
    setSize(undefined);

    fetchAssetBlob(url)
      .then(blob => {
        if ( isCurrent && showSize ) setSize(blob.size);
      })
      .catch(() => {})
      .finally(() => {
        if ( isCurrent ) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    }
  }, [preload, url, showSize]);

  async function handleOnClick(event: MouseEvent<HTMLButtonElement>) {
    if ( isLoading ) return;

    setIsLoading(true);

    try {
      downloadBlob(await fetchAssetBlob(url), filename);
    } catch(e) {
      toast.error('Failed to download image, try again!');
    }

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
