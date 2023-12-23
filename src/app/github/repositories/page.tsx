'use client';
import React, { useEffect, useMemo, useState } from 'react';

import { NextPage } from 'next';

import { SearchInput } from '@/app/github/components/search-input';
import { RepositoryList } from '@/app/github/repositories/list-item';
import { useRepositoriesStore } from '@/app/github/repositories/store';
import {
  Repository as RepositoryFull,
  SimpleRepository,
} from '@/app/github/repositories/type';

const parseRepositories = (
  repositories: RepositoryFull[],
  search: string
): SimpleRepository[] =>
  repositories
    .filter((repo) =>
      search.length > 0
        ? repo.full_name.toLowerCase().includes(search.toLowerCase())
        : true
    )
    .slice(0, 16)
    .map(
      (props): SimpleRepository => ({
        fullName: props.full_name,
        name: props.name,
        private: props.private,
        language: props.language,
        owner: props.owner.login,
        avatar: props.owner.avatar_url,
        avatarFallback: props.owner.login.slice(0, 2),
      })
    );

const GithubRepositoriesPage: NextPage = () => {
  const {
    repositories: fullList,
    loadRepositories,
    loading,
  } = useRepositoriesStore();

  const [search, setSearch] = useState<string>('');

  useEffect(() => void loadRepositories(), [loadRepositories]);

  const repositories = useMemo(
    () => parseRepositories(fullList, search),
    [fullList, search]
  );

  return (
    <div className="flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-2xl">Repositórios</h1>
      <div className="w-full max-w-4xl space-y-4">
        <SearchInput onChange={setSearch} search={search} />
        {!loading &&
          repositories.map((repository) => (
            <RepositoryList.Item key={repository.fullName} {...repository} />
          ))}
        {loading &&
          [...new Array(5)].map((_, i) => <RepositoryList.Skeleton key={i} />)}
      </div>
    </div>
  );
};

export default GithubRepositoriesPage;
