import { cn } from '@/lib/util';

interface ProgressBarProps {
  className?: string;
  progress?: number;
}

const ProgressBar = ({ className = '', progress = 0 }: ProgressBarProps) => {
  let progressStyles = 'block h-full bg-green-500 transition-[width] animate-faderight';

  if ( progress > 0 && progress < 100 ) {
    progressStyles = cn(progressStyles, 'bg-[length:400%] bg-gradient-to-r from-green-500 from-[20%] via-green-600 to-green-500 to-[80%]');
  }

  return (
    <span className={cn(`block h-5 w-full rounded-sm overflow-hidden bg-zinc-200 dark:bg-zinc-600 mb-2`, className)}>
      <span className={progressStyles} style={{ width: `${progress}%` }}>
        <span className="sr-only">{ progress }% Complete</span>
      </span>
    </span>
  )
}

export default ProgressBar;