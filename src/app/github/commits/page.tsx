'use client';
import React, {
  FC,
  InputHTMLAttributes,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { NextPage } from 'next';

import { useBranchesStore } from '@/app/github/branches/store';
import { useCommitsStore } from '@/app/github/commits/store';
import { Commit as CommitFull } from '@/app/github/commits/type';
import { useRepositoriesStore } from '@/app/github/repositories/store';
import { Input } from '@/components/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Command } from '@/components/ui/command';
import { Popover } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { sortBy } from '@/utils/sort-by';

import { Search, ChevronsUpDown, Check, ExternalLink } from 'lucide-react';

export interface Commit {
  sha: CommitFull['sha'];
  url: CommitFull['url'];
  date: NonNullable<CommitFull['commit']['author']>['date'];
  message: CommitFull['commit']['message'];
  author?: NonNullable<CommitFull['author']>['login'];
  avatar?: NonNullable<CommitFull['author']>['avatar_url'];
  avatarFallback?: string;
}

const SelectRepository: FC = () => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  const { loadBranches } = useBranchesStore();
  const {
    repositories: fullRepositoryList,
    loadRepositories,
    loading,
  } = useRepositoriesStore();

  const onSelectItem = (currentValue: string): void => {
    void loadBranches(currentValue);
    setValue(currentValue === value ? '' : currentValue);
    setOpen(false);
  };

  useEffect(() => void loadRepositories(), [loadRepositories]);

  const items: { label: string; value: string }[] = useMemo(
    () =>
      fullRepositoryList.map((props): { value: string; label: string } => ({
        value: props.full_name,
        label: props.full_name.replace('/', ': '),
      })),
    [fullRepositoryList]
  );

  const inputLabel = useMemo(() => 'Selecione um repositório...', []);
  const searchLabel = useMemo(() => 'Pesquisar repositório...', []);
  const emptyLabel = useMemo(() => 'Nenhum repositório encontrado.', []);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? items.find(
                (item) => item.value.toLowerCase() === value.toLowerCase()
              )?.label
            : inputLabel || 'Select...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </Popover.Trigger>
      <Popover.Content className="w-96 p-0">
        <Command.Root>
          <Command.Input placeholder={searchLabel || 'Search...'} />
          <Command.Empty>{emptyLabel || 'No data found.'}</Command.Empty>
          <Command.Group>
            {loading && (
              <p className="animate-pulse px-8 py-1.5 text-sm">Carregando...</p>
            )}
            {!loading &&
              items.map((item) => (
                <Command.Item
                  key={item.value}
                  value={item.value}
                  onSelect={onSelectItem}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === item.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {item.label}
                </Command.Item>
              ))}
          </Command.Group>
        </Command.Root>
      </Popover.Content>
    </Popover.Root>
  );
};

const SelectBranch: FC = () => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  const { loadCommits } = useCommitsStore();
  const { branches: fullBranchList, loading, repository } = useBranchesStore();

  const onSelectItem = (currentValue: string): void => {
    void loadCommits(repository, currentValue);
    setValue(currentValue === value ? '' : currentValue);
    setOpen(false);
  };

  const items: { label: string; value: string }[] = useMemo(
    () =>
      fullBranchList.map((props): { value: string; label: string } => ({
        value: props.name,
        label: props.name,
      })),
    [fullBranchList]
  );

  const inputLabel = useMemo(() => 'Selecione uma branch...', []);
  const searchLabel = useMemo(() => 'Pesquisar branch...', []);
  const emptyLabel = useMemo(() => 'Nenhuma branch encontrada.', []);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={fullBranchList.length === 0}
        >
          {value
            ? items.find(
                (item) => item.value.toLowerCase() === value.toLowerCase()
              )?.label
            : inputLabel || 'Select...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </Popover.Trigger>
      <Popover.Content className="w-96 p-0">
        <Command.Root>
          <Command.Input placeholder={searchLabel || 'Search...'} />
          <Command.Empty>{emptyLabel || 'No data found.'}</Command.Empty>
          <Command.Group>
            {loading && (
              <p className="animate-pulse px-8 py-1.5 text-sm">Carregando...</p>
            )}
            {!loading &&
              items.map((item) => (
                <Command.Item
                  key={item.value}
                  value={item.value}
                  onSelect={onSelectItem}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === item.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {item.label}
                </Command.Item>
              ))}
          </Command.Group>
        </Command.Root>
      </Popover.Content>
    </Popover.Root>
  );
};

const GithubCommitsPage: NextPage = () => {
  const { commits: fullList, loading } = useCommitsStore();

  const [search, setSearch] = useState('');

  const handleSearch: InputHTMLAttributes<HTMLInputElement>['onChange'] = (
    event
  ): void => setSearch(event.target.value);

  const commits = useMemo(
    () =>
      fullList
        .filter((b) =>
          search.length > 0
            ? b.commit.message.toLowerCase().includes(search.toLowerCase())
            : true
        )
        .map(
          (props): Commit => ({
            sha: props.sha,
            avatar: props.author?.avatar_url,
            url: props.html_url,
            date: props.commit.author?.date,
            message: props.commit.message,
            author: props.author?.login,
            avatarFallback: props.author?.login.slice(0, 2),
          })
        )
        .sort(sortBy('date'))
        .reverse()
        .slice(0, 16),
    [fullList, search]
  );

  const openLink = async (text: string): Promise<void> =>
    void window.open(text, '_blank');

  return (
    <div className="flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-2xl">Commits</h1>
      <div className="w-full max-w-4xl space-y-4">
        <div className="flex w-full gap-4">
          <SelectRepository />
          <SelectBranch />
        </div>
        <Input.Label className="flex w-full flex-col" htmlFor="search">
          <Input.Root>
            <Input.Icon>
              <Search />
            </Input.Icon>
            <Input.Text name="search" value={search} onChange={handleSearch} />
          </Input.Root>
        </Input.Label>
        {!loading && commits.length === 0 && (
          <p>Não há commits para serem exibidos</p>
        )}
        {!loading &&
          commits.map((c) => (
            <div
              className="flex cursor-pointer items-center rounded p-4 hover:bg-zinc-50/10 active:bg-zinc-50/30"
              key={c.sha}
              onClick={openLink.bind(null, c.url)}
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src={c.avatar} alt={c.author} />
                <AvatarFallback>{c.avatarFallback}</AvatarFallback>
              </Avatar>
              <div className="ml-4">
                <p className="text-md font-medium leading-none">{c.message}</p>
                <p className="text-muted-foreground text-sm text-zinc-500">
                  Enviado por <b>{c.author}</b>
                </p>
              </div>
              <div className="ml-auto font-medium" title="Copiar">
                <ExternalLink className="text-zinc-700" />
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

export default GithubCommitsPage;
