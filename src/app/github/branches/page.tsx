'use client';
import React, { InputHTMLAttributes, useMemo, useState } from 'react';

import { NextPage } from 'next';

import { useBranchesStore } from '@/app/github/branches/store';
import { BranchWithLatestAuthor } from '@/app/github/branches/type';
import { SelectRepository } from '@/app/github/components/select-repository';
import { Input } from '@/components/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import { sortBy } from '@/utils/sort-by';

import { Search, Copy } from 'lucide-react';

export interface Branch {
  name: BranchWithLatestAuthor['name'];
  sha: BranchWithLatestAuthor['commit']['sha'];
  user: BranchWithLatestAuthor['author']['login'];
  avatar: BranchWithLatestAuthor['author']['avatar'];
  update: BranchWithLatestAuthor['update'];
}

const GithubBranchesPage: NextPage = () => {
  const { branches: fullList, loading } = useBranchesStore();

  const [branch, setBranch] = useState<string>('');

  const handleSearch: InputHTMLAttributes<HTMLInputElement>['onChange'] = (
    event
  ): void => setBranch(event.target.value);

  const branches = useMemo(
    () =>
      fullList
        .filter((b) =>
          branch.length > 0
            ? b.name.toLowerCase().includes(branch.toLowerCase())
            : true
        )
        .sort(sortBy('update'))
        .reverse()
        .slice(0, 16)
        .map(
          (props): Branch => ({
            name: props.name,
            sha: props.commit.sha,
            avatar: props.author.avatar,
            user: props.author.login,
            update: props.update
              ? new Date(props.update).toLocaleString()
              : undefined,
          })
        ),
    [fullList, branch]
  );

  const copyToClipboard = async (text: string): Promise<void> => {
    await navigator.clipboard.writeText(text);
    toast({ title: `"${text}" copiado para área de transferência` });
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-2xl">Branches</h1>
      <div className="w-full max-w-4xl space-y-4">
        <SelectRepository />
        <Input.Label className="flex w-full flex-col" htmlFor="branch">
          <Input.Root>
            <Input.Icon>
              <Search />
            </Input.Icon>
            <Input.Text name="branch" value={branch} onChange={handleSearch} />
          </Input.Root>
        </Input.Label>
        {branches.length === 0 && <p>Não há branches para serem exibidas</p>}
        {branches.map((b) => (
          <div
            className="flex cursor-pointer items-center rounded p-4 hover:bg-zinc-50/10 active:bg-zinc-50/30"
            key={b.sha}
            onClick={copyToClipboard.bind(null, b.name)}
          >
            <Avatar className="h-9 w-9">
              <AvatarImage src={b.avatar} alt={b.user} />
              <AvatarFallback>{b.user}</AvatarFallback>
            </Avatar>
            <div className="ml-4">
              <p className="text-md font-medium leading-none">{b.name}</p>
              <p className="text-muted-foreground text-sm text-zinc-500">
                Última atualização por <b>{b.user}</b>
              </p>
            </div>
            <div className="ml-auto text-sm text-zinc-500">{b.update}</div>
            <div className="ml-4 font-medium" title="Copiar">
              <Copy className="text-zinc-700" />
            </div>
          </div>
        ))}
        {loading &&
          [...new Array(5)].map((_, i) => (
            <div className="flex items-center" key={i}>
              <Skeleton className="h-9 w-9" />
              <div className="ml-4 space-y-1">
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="ml-auto h-4 w-32" />
            </div>
          ))}
      </div>
    </div>
  );
};

export default GithubBranchesPage;
