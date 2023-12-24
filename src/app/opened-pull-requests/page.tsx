'use client';
import React, { useCallback, useEffect, useState } from 'react';

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

import { Minus, Plus, Search } from 'lucide-react';

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
  const { addRepository, removeRepository, loadPulls, loading, repositories } =
    useOpenedPullRequestsStore();

  const [pulls, setPulls] = useState<SimplePullRequest[]>([]);
  const [selectedRepository, setSelectedRepository] = useState<string>();

  const load = useCallback(async (): Promise<void> => {
    const response = await loadPulls();

    setPulls(parsePulls(response));
  }, [loadPulls]);

  const selectHandler = (repository: string): void =>
    setSelectedRepository(repository);

  const addHandler = (): void => {
    if (!selectedRepository) return;
    addRepository(selectedRepository);
    void load();
  };

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="flex flex-col items-center justify-center gap-8 p-8">
      <div className="flex items-center gap-1">
        <h1 className="text-2xl">Pull Requests</h1>
      </div>
      <div className="flex w-full max-w-4xl rounded bg-zinc-900">
        <aside className="flex items-center p-4 pl-8">
          <Button className="h-16 w-16" onClick={loadPulls} variant="ghost">
            <Search />
          </Button>
        </aside>
        <main className="flex flex-1 flex-col justify-center gap-3 p-4">
          <div className="flex items-center gap-4">
            <SelectRepository className="flex-1" onChange={selectHandler} />
            <Button onClick={addHandler} variant="ghost">
              <Plus />
            </Button>
          </div>
          {repositories.map((repository) => (
            <div className="flex items-center gap-4" key={repository}>
              <div className="flex-1 rounded border border-zinc-800 bg-zinc-950 px-4 py-2 text-zinc-400">
                {repository}
              </div>
              <Button
                onClick={removeRepository.bind(null, repository)}
                variant="ghost"
              >
                <Minus />
              </Button>
            </div>
          ))}
        </main>
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
