'use client';
import React, { useEffect, useState } from 'react';

import { NextPage } from 'next';

import { Endpoints } from '@octokit/types';

import { getOctokit } from '@/app/github/service';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

export type Repositories = Endpoints['GET /user/repos']['response']['data'];
export type Repository = Repositories[number];
export interface RepositoryDto {
  fullName: Repository['full_name'];
  name: Repository['name'];
  owner: {
    login: Repository['owner']['login'];
    avatar: Repository['owner']['avatar_url'];
  };
}

const getRepositories = async (): Promise<RepositoryDto[]> => {
  const response = await getOctokit().request('GET /user/repos', {
    per_page: 16,
    sort: 'pushed',
  });

  return response.data.map((props) => ({
    fullName: props.full_name,
    name: props.name,
    owner: { login: props.owner.login, avatar: props.owner.avatar_url },
  }));
};

const GithubRepositoriesPage: NextPage = () => {
  const [loading, setLoading] = useState(false);
  const [repositories, setRepositories] = useState<RepositoryDto[]>([]);

  useEffect(() => {
    setLoading(true);
    getRepositories()
      .then((data) => setRepositories(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-2xl">Repositórios</h1>
      <div className="w-full max-w-4xl space-y-8">
        {repositories.map((repository) => (
          <div className="flex items-center" key={repository.fullName}>
            <Avatar className="h-9 w-9">
              <AvatarImage
                src={repository.owner.avatar}
                alt={repository.owner.login}
              />
              <AvatarFallback>{repository.owner.login[0]}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">
                {repository.name}
              </p>
              <p className="text-muted-foreground text-sm">
                by {repository.owner.login}
              </p>
            </div>
            <div className="ml-auto font-medium">Ver Branches</div>
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
