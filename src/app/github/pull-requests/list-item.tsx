import React, { FC } from 'react';

import { SimplePullRequest } from '@/app/github/pull-requests/type';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { copyToClipboard } from '@/utils/copy-to-clipboard';

import { Copy } from 'lucide-react';

const ItemSkeleton: FC = () => (
  <div className="flex cursor-wait items-center rounded p-4 hover:bg-zinc-50/20 active:bg-zinc-50/30">
    <Skeleton className="h-9 w-9 rounded-full" />
    <div className="ml-4 space-y-1">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-4 w-64" />
    </div>
    <Skeleton className="ml-auto h-4 w-40" />
    <Skeleton className="ml-4 h-6 w-6" />
  </div>
);

const Item: FC<SimplePullRequest> = (i) => (
  <div
    className="flex cursor-pointer items-center rounded p-4 hover:bg-zinc-50/10 active:bg-zinc-50/30"
    onClick={copyToClipboard.bind(null, i.url)}
  >
    <Avatar className="h-9 w-9">
      <AvatarImage alt={i.user} src={i.avatar} />
      <AvatarFallback>{i.user}</AvatarFallback>
    </Avatar>
    <div className="ml-4">
      <p className="text-md font-medium leading-none">{i.title}</p>
      <p className="text-muted-foreground text-sm text-zinc-500">
        Criado por <b>{i.user}</b> em <i>{i.created}</i>
      </p>
    </div>
    <div className="ml-auto text-sm text-zinc-500">{i.updated}</div>
    <div className="ml-4 font-medium" title="Copiar">
      <Copy className="text-zinc-700" />
    </div>
  </div>
);

export const PullRequestList = { Item, Skeleton: ItemSkeleton };
