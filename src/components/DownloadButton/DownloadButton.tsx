import { Download, LoaderCircle } from 'lucide-react';
import { MouseEvent, useState } from 'react';

import { cn, downloadUrl } from '@/lib/util';

interface DownloadButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  filename?: string;
  url: string;
  className?: string;
}

const DownloadButton = ({ children, url, filename = 'file', onClick, className, ...rest }: DownloadButtonProps) => {
  const [isDownloading, setIsDownloading] = useState(false);

  async function handleOnClick(event: MouseEvent<HTMLButtonElement>) {
    if ( isDownloading ) return;

    setIsDownloading(true);
    
    await downloadUrl(url, filename, { downloadBlob: true });

    setIsDownloading(false);

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
        className
      )}
    >
      { !isDownloading && <Download className="w-4 h-4" /> }
      { isDownloading && <LoaderCircle className="w-4 h-4 animate-spin" /> }
      { children }
    </button>
  )
}

export default DownloadButton;