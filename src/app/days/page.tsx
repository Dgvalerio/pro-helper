'use client';
import React, { FC, useCallback, useEffect, useState } from 'react';

import { NextPage } from 'next';

import { useDaysStore } from '@/app/days/store';
import { GroupedCommit } from '@/app/days/types';
import { useBranchesStore } from '@/app/github/branches/store';
import { SelectBranch } from '@/app/github/components/select-branch';
import { SelectRepository } from '@/app/github/components/select-repository';
import { PullRequestList } from '@/app/github/pull-requests/list-item';
import { Input } from '@/components/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';

import { Minus, Plus, Search } from 'lucide-react';

const Configurations: FC = () => {
  const { loadBranches } = useBranchesStore();
  const {
    addRepository,
    interval,
    removeRepository,
    loadCommits,
    repositories,
    setInterval,
    translate,
    setTranslate,
  } = useDaysStore();

  const [since, setSince] = useState(interval.since);
  const [until, setUntil] = useState(interval.until);
  const [selectedRepository, setSelectedRepository] = useState<string>();
  const [selectedBranch, setSelectedBranch] = useState<string>();

  const selectRepositoryHandler = (repository: string): void => {
    setSelectedRepository(repository);
    void loadBranches(repository);
  };

  const selectBranchHandler = (repository: string): void =>
    setSelectedBranch(repository);

  const addHandler = (): void => {
    if (!selectedRepository || !selectedBranch) return;

    addRepository(selectedRepository, selectedBranch);
  };

  const translateHandler = (value: boolean): void => setTranslate(value);

  const searchHandler = (): void => {
    if (since && until) setInterval({ since, until });

    if (repositories.length === 0) {
      return void toast({
        title: 'Você deve selecionar ao menos um repositório!',
        variant: 'default',
      });
    }

    void loadCommits();
  };

  return (
    <div className="flex w-full max-w-4xl rounded bg-zinc-900">
      <div className="flex flex-1 flex-col justify-center gap-2 p-4">
        <span className="text-sm font-light">Intervalo</span>
        <div className="flex items-center gap-2 pr-16">
          <Input.Root>
            <Input.Label>Desde</Input.Label>
            <Input.Text
              name="since"
              onChange={({ currentTarget }): void =>
                setSince(currentTarget.value)
              }
              type="date"
              value={since}
            />
          </Input.Root>
          <Input.Root>
            <Input.Label>Até</Input.Label>
            <Input.Text
              name="until"
              onChange={({ currentTarget }): void =>
                setUntil(currentTarget.value)
              }
              type="date"
              value={until}
            />
          </Input.Root>
        </div>
        <span className="text-sm font-light">Repositórios</span>
        <div className="flex items-center gap-2">
          <SelectRepository
            className="flex-1"
            onChange={selectRepositoryHandler}
          />
          <SelectBranch className="flex-1" onChange={selectBranchHandler} />
          <Button onClick={addHandler} variant="ghost">
            <Plus />
          </Button>
        </div>
        {repositories.map(({ repository, branch }) => (
          <div className="flex items-center gap-2" key={repository}>
            <div className="flex-1 rounded border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-zinc-400">
              {repository}
            </div>
            <div className="flex-1 rounded border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-zinc-400">
              {branch}
            </div>
            <Button
              onClick={removeRepository.bind(null, repository)}
              variant="ghost"
            >
              <Minus />
            </Button>
          </div>
        ))}
        <span className="text-sm font-light">Traduzir?</span>
        <div className="flex items-center gap-2 text-xs font-light">
          <span>Não</span>
          <Switch checked={translate} onCheckedChange={translateHandler} />
          <span>Sim</span>
        </div>
      </div>
      <aside className="flex items-center border-l border-zinc-800 p-2 pl-4">
        <Button className="h-16 w-16" onClick={searchHandler} variant="ghost">
          <Search />
        </Button>
      </aside>
    </div>
  );
};

const DaysPage: NextPage = () => {
  const { loadCommits, loading, repositories, interval } = useDaysStore();

  const [commits, setCommits] = useState<GroupedCommit[]>([]);

  const load = useCallback(async (): Promise<void> => {
    const response = await loadCommits();

    setCommits(response);
  }, [loadCommits]);

  useEffect(() => {
    if (repositories.length > 0 && interval) void load();
  }, [load, repositories.length, interval]);

  return (
    <div className="flex flex-col items-center justify-center gap-8 p-8">
      <div className="w-full max-w-4xl space-y-4 px-8 py-2 text-center">
        <h1 className="text-2xl">Dias</h1>
        <p>
          Informe o intervalo de datas, quais repositórios você tem interesse,
          os horários para dividir o dia, e até se deseja o texto traduzido.
        </p>
      </div>
      <Configurations />
      <div className="w-full max-w-4xl space-y-4">
        {!loading && commits.length === 0 && (
          <p>Não há pull requests para serem exibidos</p>
        )}
        {!loading &&
          commits.map((i) => (
            <div
              className="flex flex-col rounded border border-zinc-800"
              key={i.date}
            >
              <div className="flex">
                <div className="flex-1 border-b-2 border-zinc-800 px-4 py-2 text-sm text-zinc-400">
                  {i.date}
                </div>
              </div>
              <p className="whitespace-pre-wrap px-4 py-2 font-light">
                {i.description}
              </p>
            </div>
          ))}
        {loading &&
          [...new Array(5)].map((_, i) => <PullRequestList.Skeleton key={i} />)}
      </div>
    </div>
  );
};

export default DaysPage;
