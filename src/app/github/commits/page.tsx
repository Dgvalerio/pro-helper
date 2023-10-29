'use client';
import React, { InputHTMLAttributes, useMemo, useState } from 'react';

import { NextPage } from 'next';

import { CommitSkeleton } from '@/app/github/commits/skeleton';
import { useCommitsStore } from '@/app/github/commits/store';
import { Commit as CommitFull } from '@/app/github/commits/type';
import { SelectBranch } from '@/app/github/components/select-branch';
import { SelectRepository } from '@/app/github/components/select-repository';
import { Input } from '@/components/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { sortBy } from '@/utils/sort-by';

import { Search, ExternalLink } from 'lucide-react';

export interface Commit {
  sha: CommitFull['sha'];
  url: CommitFull['url'];
  date: NonNullable<CommitFull['commit']['author']>['date'];
  message: CommitFull['commit']['message'];
  author?: NonNullable<CommitFull['author']>['login'];
  avatar?: NonNullable<CommitFull['author']>['avatar_url'];
  avatarFallback?: string;
}

const GithubCommitsPage: NextPage = () => {
  const { commits: fullList, loading } = useCommitsStore();

  const [search, setSearch] = useState('');

  const handleSearch: InputHTMLAttributes<HTMLInputElement>['onChange'] = (
    event
  ): void => setSearch(event.target.value);

  const commits = useMemo(
    () =>
      fullList
        .filter((b) =>
          search.length > 0
            ? b.commit.message.toLowerCase().includes(search.toLowerCase())
            : true
        )
        .map(
          (props): Commit => ({
            sha: props.sha,
            avatar: props.author?.avatar_url,
            url: props.html_url,
            date: props.commit.author?.date,
            message: props.commit.message,
            author: props.author?.login,
            avatarFallback: props.author?.login.slice(0, 2),
          })
        )
        .sort(sortBy('date'))
        .reverse()
        .slice(0, 16),
    [fullList, search]
  );

  const openLink = async (text: string): Promise<void> =>
    void window.open(text, '_blank');

  return (
    <div className="flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-2xl">Commits</h1>
      <div className="w-full max-w-4xl space-y-4">
        <div className="flex w-full gap-4">
          <SelectRepository />
          <SelectBranch />
        </div>
        <Input.Label className="flex w-full flex-col" htmlFor="search">
          <Input.Root>
            <Input.Icon>
              <Search />
            </Input.Icon>
            <Input.Text name="search" value={search} onChange={handleSearch} />
          </Input.Root>
        </Input.Label>
        {!loading && commits.length === 0 && (
          <p>Não há commits para serem exibidos</p>
        )}
        {!loading &&
          commits.map((c) => (
            <div
              className="flex cursor-pointer items-center rounded p-4 hover:bg-zinc-50/10 active:bg-zinc-50/30"
              key={c.sha}
              onClick={openLink.bind(null, c.url)}
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src={c.avatar} alt={c.author} />
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
          ))}
        {loading && [...new Array(5)].map((_, i) => <CommitSkeleton key={i} />)}
      </div>
    </div>
  );
};

export default GithubCommitsPage;
