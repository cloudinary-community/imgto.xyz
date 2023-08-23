import { ReactNode } from 'react';

import { cn } from '@/lib/util';

interface ContainerProps {
  children?: ReactNode;
  className?: string;
}

const Container = ({ children, className = '' }: ContainerProps) => {
  return (
    <div className={cn(`w-full max-w-5xl my-0 mx-auto px-5`, className)}>
      { children }
    </div>
  )
}

export default Container;