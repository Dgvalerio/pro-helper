'use client';
import React, { useMemo, useState } from 'react';

import { NextPage } from 'next';

import { SearchInput } from '@/app/github/components/search-input';
import { SelectRepository } from '@/app/github/components/select-repository';
import { PullRequestList } from '@/app/github/pull-requests/list-item';
import { usePullRequestsStore } from '@/app/github/pull-requests/store';
import {
  PullRequests,
  SimplePullRequest,
} from '@/app/github/pull-requests/type';
import { sortBy } from '@/utils/sort-by';

const parsePulls = (items: PullRequests, search: string): SimplePullRequest[] =>
  items
    .filter(({ body }) =>
      search.length > 0
        ? body?.toLowerCase().includes(search.toLowerCase())
        : true
    )
    .sort(sortBy('updated_at', true))
    .slice(0, 16)
    .map(
      (props): SimplePullRequest => ({
        state: props.state,
        user: props.user!.login,
        avatar: props.user!.avatar_url,
        created: new Date(props.created_at).toLocaleString(),
        updated: new Date(props.updated_at).toLocaleString(),
        title: props.title,
        body: props.body,
        url: props.html_url,
      })
    );

const GithubPullRequestsPage: NextPage = () => {
  const { pulls: fullList, loadPulls, loading } = usePullRequestsStore();

  const [search, setSearch] = useState<string>('');

  const items = useMemo(() => parsePulls(fullList, search), [fullList, search]);

  return (
    <div className="flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-2xl">Pull Requests</h1>
      <div className="w-full max-w-4xl space-y-4">
        <SelectRepository onChange={loadPulls} />
        <SearchInput search={search} onChange={setSearch} />
        {items.length === 0 && <p>Não há pull requests para serem exibidos</p>}
        {items.map((i) => (
          <PullRequestList.Item key={i.updated} {...i} />
        ))}
        {loading &&
          [...new Array(5)].map((_, i) => <PullRequestList.Skeleton key={i} />)}
      </div>
    </div>
  );
};

export default GithubPullRequestsPage;
