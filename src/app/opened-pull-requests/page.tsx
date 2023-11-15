'use client';
import React, { useState } from 'react';

import { NextPage } from 'next';

import { SelectRepository } from '@/app/github/components/select-repository';
import { PullRequestList } from '@/app/github/pull-requests/list-item';
import {
  PullRequests,
  SimplePullRequest,
} from '@/app/github/pull-requests/type';
import { useOpenedPullRequestsStore } from '@/app/opened-pull-requests/store';
import { Button } from '@/components/ui/button';
import { sortBy } from '@/utils/sort-by';

import { Settings } from 'lucide-react';

const parsePulls = (items: PullRequests): SimplePullRequest[] =>
  items.sort(sortBy('updated_at', true)).map(
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

const OpenedPullRequestsPage: NextPage = () => {
  const [pulls, setPulls] = useState<SimplePullRequest[]>([]);
  const { addRepository, loadPulls, loading, repositories } =
    useOpenedPullRequestsStore();

  const load = async (repository: string): Promise<void> => {
    addRepository(repository);

    const response = await loadPulls();

    setPulls(parsePulls(response));
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 p-8">
      <div className="flex items-center gap-1">
        <h1 className="text-2xl">Pull Requests</h1>
        <Button variant="ghost">
          <Settings />
        </Button>
      </div>
      <div>
        <h2>Repositórios</h2>
        <div>
          <SelectRepository onChange={addRepository} />
        </div>
      </div>
      <div className="w-full max-w-4xl space-y-4">
        {!loading && pulls.length === 0 && (
          <p>Não há pull requests para serem exibidos</p>
        )}
        {!loading &&
          pulls.map((i) => <PullRequestList.Item key={i.updated} {...i} />)}
        {loading &&
          [...new Array(5)].map((_, i) => <PullRequestList.Skeleton key={i} />)}
      </div>
    </div>
  );
};

export default OpenedPullRequestsPage;
