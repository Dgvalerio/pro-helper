import React, { FC } from 'react';

import { Skeleton } from '@/components/ui/skeleton';

export const RepositorySkeleton: FC = () => (
  <div className="flex cursor-wait items-center rounded p-4 hover:bg-zinc-50/20 active:bg-zinc-50/30">
    <Skeleton className="h-9 w-9 rounded-full" />
    <div className="ml-4 space-y-1">
      <Skeleton className="h-4 w-64" />
      <Skeleton className="h-4 w-32" />
    </div>
    <Skeleton className="ml-auto h-4 w-32" />
    <Skeleton className="ml-4 h-6 w-6" />
  </div>
);
