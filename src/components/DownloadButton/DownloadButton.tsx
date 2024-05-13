import { MouseEvent, useState } from 'react';

interface DownloadButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  filename?: string;
  url: string;
}

const DownloadButton = ({ children, url, filename = 'file', onClick, ...rest }: DownloadButtonProps) => {
  const [progress, setProgress] = useState<number>(0);

  console.log('progress', progress)

  async function handleOnClick(event: MouseEvent<HTMLButtonElement>) {
    console.log('start')
    const response = await fetch(url);
console.log('response', response)
    if ( !response?.body ) return;

    const contentLength = response.headers.get('Content-Length');
    const totalLength = typeof contentLength === 'string' && parseInt(contentLength)

    const reader = response.body.getReader();
    const chunks = [];

    let receivedLength = 0;

    while (true) {
      const { done, value } = await reader.read();

      if ( done ) break;

      chunks.push(value);

      receivedLength = receivedLength + value.length;

      if ( typeof totalLength === 'number' ) {
        const step = receivedLength / totalLength * 100;
        console.log('step', step)
        setProgress(step);
      }
    }
    
    const blob = new Blob(chunks);
    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement('a');

    a.href = blobUrl;
    a.download = filename;

    function handleOnClick() {
      setTimeout(() => URL.revokeObjectURL(blobUrl), 150);
      removeEventListener('click', handleOnClick);
    };
  
    a.addEventListener('click', handleOnClick, false);
    a.click();

    if ( typeof onClick === 'function' ) {
      onClick(event);
    }
  }

  return (
    <button {...rest} onClick={handleOnClick}>
      { progress > 0 && progress < 100 && (
        <>loading</>
      )}
      { children }
    </button>
  )
}

export default DownloadButton;