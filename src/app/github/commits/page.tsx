'use client';
import React, { useMemo, useState } from 'react';

import { NextPage } from 'next';

import { useBranchesStore } from '@/app/github/branches/store';
import { CommitList } from '@/app/github/commits/list-item';
import { useCommitsStore } from '@/app/github/commits/store';
import { Commit as CommitFull, SimpleCommit } from '@/app/github/commits/type';
import { SearchInput } from '@/app/github/components/search-input';
import { SelectBranch } from '@/app/github/components/select-branch';
import { SelectRepository } from '@/app/github/components/select-repository';
import { SelectUser } from '@/app/github/components/select-user';
import { sortBy } from '@/utils/sort-by';

const parseCommits = (commits: CommitFull[], search: string): SimpleCommit[] =>
  commits
    .filter((b) =>
      search.length > 0
        ? b.commit.message.toLowerCase().includes(search.toLowerCase())
        : true
    )
    .map(
      (props): SimpleCommit => ({
        sha: props.sha,
        avatar: props.author?.avatar_url,
        url: props.html_url,
        date: props.commit.author?.date,
        message: props.commit.message,
        author: props.author?.login,
        avatarFallback: props.author?.login.slice(0, 2),
      })
    )
    .sort(sortBy('date', true))
    .slice(0, 16);

const GithubCommitsPage: NextPage = () => {
  const { repository, loadBranches } = useBranchesStore();
  const { commits: fullList, loadCommits, loading } = useCommitsStore();

  const [search, setSearch] = useState('');

  const onSelectUser = (user: string): void =>
    void loadCommits({ fullName: repository, user });

  const onSelectBranch = (branchSha: string): void =>
    void loadCommits({ fullName: repository, branchSha });

  const commits = useMemo(
    () => parseCommits(fullList, search),
    [fullList, search]
  );

  return (
    <div className="flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-2xl">Commits</h1>
      <div className="w-full max-w-4xl space-y-4">
        <div className="flex w-full gap-4">
          <SelectRepository onChange={loadBranches} />
          <SelectBranch onChange={onSelectBranch} />
          <SelectUser onChange={onSelectUser} />
        </div>
        <SearchInput onChange={setSearch} search={search} />
        {loading ? (
          [...new Array(5)].map((_, i) => <CommitList.Skeleton key={i} />)
        ) : (
          <>
            {commits.length === 0 && <p>Não há commits para serem exibidos</p>}
            {commits.map((c) => (
              <CommitList.Item key={c.sha} {...c} />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default GithubCommitsPage;
