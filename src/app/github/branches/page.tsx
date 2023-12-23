'use client';
import React, { useMemo, useState } from 'react';

import { NextPage } from 'next';

import { BranchList } from '@/app/github/branches/list-item';
import { useBranchesStore } from '@/app/github/branches/store';
import {
  BranchWithLatestAuthor,
  SimpleBranch,
} from '@/app/github/branches/type';
import { SearchInput } from '@/app/github/components/search-input';
import { SelectRepository } from '@/app/github/components/select-repository';
import { sortBy } from '@/utils/sort-by';

const parseBranches = (
  branches: BranchWithLatestAuthor[],
  search: string
): SimpleBranch[] =>
  branches
    .filter(({ name }) =>
      search.length > 0
        ? name.toLowerCase().includes(search.toLowerCase())
        : true
    )
    .sort(sortBy('update', true))
    .slice(0, 16)
    .map(
      (props): SimpleBranch => ({
        name: props.name,
        sha: props.commit.sha,
        avatar: props.author.avatar,
        user: props.author.login,
        update: props.update
          ? new Date(props.update).toLocaleString()
          : undefined,
      })
    );

const GithubBranchesPage: NextPage = () => {
  const { branches: fullList, loadBranches, loading } = useBranchesStore();

  const [search, setSearch] = useState<string>('');

  const branches = useMemo(
    () => parseBranches(fullList, search),
    [fullList, search]
  );

  return (
    <div className="flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-2xl">Branches</h1>
      <div className="w-full max-w-4xl space-y-4">
        <SelectRepository onChange={loadBranches} />
        <SearchInput onChange={setSearch} search={search} />
        {branches.length === 0 && <p>Não há branches para serem exibidas</p>}
        {branches.map((b) => (
          <BranchList.Item key={b.sha} {...b} />
        ))}
        {loading &&
          [...new Array(5)].map((_, i) => <BranchList.Skeleton key={i} />)}
      </div>
    </div>
  );
};

export default GithubBranchesPage;
