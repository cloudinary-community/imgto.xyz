import { MouseEventHandler, ReactNode } from 'react';

import { cn } from '@/lib/util';

interface ButtonProps {
  children?: ReactNode;
  className?: string;
  onClick?: any; // @todo: Fix this type
  size?: string;
  href?: string;
  download?: boolean;
}

const Button = ({ children, className = '',  onClick, size = 'sm', href, download }: ButtonProps) => {

  let sizeClassName = 'text-sm py-2.5 px-6';

  if ( size === 'xs' ) {
    sizeClassName = 'text-xs py-2 px-4';
  }

  if ( typeof href === 'string' ) {
    return (
      <a
        href={href}
        onClick={onClick}
        className={cn(`inline-flex items-center justify-between gap-2 text-white hover:text-white bg-blue-500 hover:bg-blue-400 active:bg-blue-600 rounded font-black uppercase ${sizeClassName}`, className)}
        download={download}
      >
        { children }
      </a>
    );
  }

  return (
    <button onClick={onClick} className={cn(`inline-flex items-center justify-between gap-2 text-white bg-blue-500 hover:bg-blue-400 active:bg-blue-600 rounded font-black uppercase ${sizeClassName}`, className)}>
      { children }
    </button>
  )
}

export default Button;