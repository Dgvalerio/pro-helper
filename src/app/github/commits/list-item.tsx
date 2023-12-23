import React, { FC } from 'react';

import { SimpleCommit } from '@/app/github/commits/type';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

import { ExternalLink } from 'lucide-react';

const openLink = async (text: string): Promise<void> =>
  void window.open(text, '_blank');

const Item: FC<SimpleCommit> = (c) => (
  <div
    className="flex cursor-pointer items-center rounded p-4 hover:bg-zinc-50/10 active:bg-zinc-50/30"
    onClick={openLink.bind(null, c.url)}
  >
    <Avatar className="h-9 w-9">
      <AvatarImage alt={c.author} src={c.avatar} />
      <AvatarFallback>{c.avatarFallback}</AvatarFallback>
    </Avatar>
    <div className="ml-4">
      <p className="text-md font-medium leading-none">{c.message}</p>
      <p className="text-muted-foreground text-sm text-zinc-500">
        Enviado por <b>{c.author}</b>
      </p>
    </div>
    <div className="ml-auto font-medium" title="Copiar">
      <ExternalLink className="text-zinc-700" />
    </div>
  </div>
);

const ItemSkeleton: FC = () => (
  <div className="flex cursor-wait items-center rounded p-4 hover:bg-zinc-50/20 active:bg-zinc-50/30">
    <Skeleton className="h-9 w-9 rounded-full" />
    <div className="ml-4 space-y-1">
      <Skeleton className="h-4 w-64" />
      <Skeleton className="h-4 w-32" />
    </div>
    <Skeleton className="ml-auto h-6 w-6" />
  </div>
);

export const CommitList = { Item, Skeleton: ItemSkeleton };
