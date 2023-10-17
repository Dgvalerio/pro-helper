import { FC, HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

const Skeleton: FC<HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => (
  <div
    className={cn(
      'animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800',
      className
    )}
    {...props}
  />
);

export { Skeleton };
