import React, { FC } from 'react';

import { SimpleRepository } from '@/app/github/repositories/type';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

import { Lock, Unlock } from 'lucide-react';

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

const Item: FC<SimpleRepository> = (repository) => (
  <div className="flex items-center rounded p-4 hover:bg-zinc-50/10">
    <Avatar className="h-9 w-9">
      <AvatarImage alt={repository.owner} src={repository.avatar} />
      <AvatarFallback>{repository.avatarFallback}</AvatarFallback>
    </Avatar>
    <div className="ml-4">
      <p className="text-sm font-medium leading-none">{repository.name}</p>
      <p className="text-muted-foreground text-sm">by {repository.owner}</p>
    </div>
    <div className="ml-auto font-medium">{repository.language}</div>
    <div
      className="ml-4 font-medium"
      title={repository.private ? 'Privado' : 'Público'}
    >
      {repository.private ? (
        <Lock className="text-red-800" />
      ) : (
        <Unlock className="text-green-800" />
      )}
    </div>
  </div>
);

export const RepositoryList = {
  Item,
  Skeleton: RepositorySkeleton,
};
