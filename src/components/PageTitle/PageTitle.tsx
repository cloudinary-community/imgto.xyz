import { ReactNode } from 'react';

import { cn } from '@/lib/util';

interface PageTitleProps {
  children?: ReactNode;
  className?: string;
}

const PageTitle = ({ children, className = '' }: PageTitleProps) => {
  return (
    <h1 className={cn(`text-3xl md:text-5xl font-black mb-12`, className)}>
      { children }
    </h1>
  )
}

export default PageTitle;