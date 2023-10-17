'use client';
import React, { useEffect, useState } from 'react';

import { NextPage } from 'next';

import { Repository as RepositoryFull } from '@/app/github/repositories/type';
import { getOctokit } from '@/app/github/service';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

export interface Repository {
  fullName: RepositoryFull['full_name'];
  name: RepositoryFull['name'];
  owner: RepositoryFull['owner']['login'];
  avatar: RepositoryFull['owner']['avatar_url'];
  avatarFallback: string;
}

const GithubRepositoriesPage: NextPage = () => {
  const [loading, setLoading] = useState(false);
  const [repositories, setRepositories] = useState<Repository[]>([]);

  const getRepositories = async (): Promise<void> => {
    setLoading(true);

    try {
      const response = await getOctokit().request('GET /user/repos', {
        per_page: 16,
        sort: 'pushed',
      });

      const data: Repository[] = response.data.map(
        (props): Repository => ({
          fullName: props.full_name,
          name: props.name,
          owner: props.owner.login,
          avatar: props.owner.avatar_url,
          avatarFallback: props.owner.login.slice(0, 2),
        })
      );

      setRepositories(data);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => void getRepositories(), []);

  return (
    <div className="flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-2xl">Repositórios</h1>
      <div className="w-full max-w-4xl space-y-8">
        {repositories.map((repository) => (
          <div className="flex items-center" key={repository.fullName}>
            <Avatar className="h-9 w-9">
              <AvatarImage src={repository.avatar} alt={repository.owner} />
              <AvatarFallback>{repository.avatarFallback}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">
                {repository.name}
              </p>
              <p className="text-muted-foreground text-sm">
                by {repository.owner}
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
