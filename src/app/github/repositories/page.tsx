'use client';
import React, {
  InputHTMLAttributes,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { NextPage } from 'next';

import { useRepositoriesStore } from '@/app/github/repositories/store';
import { Repository as RepositoryFull } from '@/app/github/repositories/type';
import { Input } from '@/components/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

import { Search, Lock, Unlock } from 'lucide-react';

export interface Repository {
  fullName: RepositoryFull['full_name'];
  name: RepositoryFull['name'];
  private: RepositoryFull['private'];
  language: RepositoryFull['language'];
  owner: RepositoryFull['owner']['login'];
  avatar: RepositoryFull['owner']['avatar_url'];
  avatarFallback: string;
}

const GithubRepositoriesPage: NextPage = () => {
  const {
    repositories: fullList,
    loadRepositories,
    loading,
  } = useRepositoriesStore();

  const [repository, setRepository] = useState<string>('');

  const handleSearch: InputHTMLAttributes<HTMLInputElement>['onChange'] = (
    event
  ): void => setRepository(event.target.value);

  useEffect(() => void loadRepositories(), [loadRepositories]);

  const repositories = useMemo(
    () =>
      fullList
        .filter((repo) =>
          repository.length > 0
            ? repo.full_name.toLowerCase().includes(repository.toLowerCase())
            : true
        )
        .slice(0, 16)
        .map(
          (props): Repository => ({
            fullName: props.full_name,
            name: props.name,
            private: props.private,
            language: props.language,
            owner: props.owner.login,
            avatar: props.owner.avatar_url,
            avatarFallback: props.owner.login.slice(0, 2),
          })
        ),
    [fullList, repository]
  );

  return (
    <div className="flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-2xl">Repositórios</h1>
      <div className="w-full max-w-4xl space-y-4">
        <Input.Label className="flex w-full flex-col" htmlFor="repository">
          <Input.Root>
            <Input.Icon>
              <Search />
            </Input.Icon>
            <Input.Text
              name="repository"
              value={repository}
              onChange={handleSearch}
            />
          </Input.Root>
        </Input.Label>
        {repositories.map((repository) => (
          <div
            className="flex items-center rounded p-4 hover:bg-zinc-50/10"
            key={repository.fullName}
          >
            <Avatar className="h-9 w-9">
              <AvatarImage src={repository.avatar} alt={repository.owner} />
              <AvatarFallback>{repository.avatarFallback}</AvatarFallback>
            </Avatar>
            <div className="ml-4">
              <p className="text-sm font-medium leading-none">
                {repository.name}
              </p>
              <p className="text-muted-foreground text-sm">
                by {repository.owner}
              </p>
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

export default GithubRepositoriesPage;
