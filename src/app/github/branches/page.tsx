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
import { BranchWithLatestAuthor } from '@/app/github/branches/type';
import { useRepositoriesStore } from '@/app/github/repositories/store';
import { Input } from '@/components/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Command } from '@/components/ui/command';
import { Popover } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { sortBy } from '@/utils/sort-by';

import { Search, ChevronsUpDown, Check, Copy } from 'lucide-react';

export interface Branch {
  name: BranchWithLatestAuthor['name'];
  sha: BranchWithLatestAuthor['commit']['sha'];
  user: BranchWithLatestAuthor['author']['login'];
  avatar: BranchWithLatestAuthor['author']['avatar'];
  update: BranchWithLatestAuthor['update'];
}

const Combobox: FC = () => {
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

const GithubBranchesPage: NextPage = () => {
  const { branches: fullList, loading } = useBranchesStore();

  const [branch, setBranch] = useState<string>('');

  const handleSearch: InputHTMLAttributes<HTMLInputElement>['onChange'] = (
    event
  ): void => setBranch(event.target.value);

  const branches = useMemo(
    () =>
      fullList
        .filter((b) =>
          branch.length > 0
            ? b.name.toLowerCase().includes(branch.toLowerCase())
            : true
        )
        .sort(sortBy('update'))
        .reverse()
        .slice(0, 16)
        .map(
          (props): Branch => ({
            name: props.name,
            sha: props.commit.sha,
            avatar: props.author.avatar,
            user: props.author.login,
            update: props.update
              ? new Date(props.update).toLocaleString()
              : undefined,
          })
        ),
    [fullList, branch]
  );

  const copyToClipboard = async (text: string): Promise<void> => {
    await navigator.clipboard.writeText(text);
    toast({ title: `"${text}" copiado para área de transferência` });
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-2xl">Branches</h1>
      <div className="w-full max-w-4xl space-y-4">
        <Combobox />
        <Input.Label className="flex w-full flex-col" htmlFor="branch">
          <Input.Root>
            <Input.Icon>
              <Search />
            </Input.Icon>
            <Input.Text name="branch" value={branch} onChange={handleSearch} />
          </Input.Root>
        </Input.Label>
        {branches.length === 0 && <p>Não há branches para serem exibidas</p>}
        {branches.map((b) => (
          <div
            className="flex cursor-pointer items-center rounded p-4 hover:bg-zinc-50/10 active:bg-zinc-50/30"
            key={b.sha}
            onClick={copyToClipboard.bind(null, b.name)}
          >
            <Avatar className="h-9 w-9">
              <AvatarImage src={b.avatar} alt={b.user} />
              <AvatarFallback>{b.user}</AvatarFallback>
            </Avatar>
            <div className="ml-4">
              <p className="text-md font-medium leading-none">{b.name}</p>
              <p className="text-muted-foreground text-sm text-zinc-500">
                Última atualização por <b>{b.user}</b>
              </p>
            </div>
            <div className="ml-auto text-sm text-zinc-500">{b.update}</div>
            <div className="ml-4 font-medium" title="Copiar">
              <Copy className="text-zinc-700" />
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

export default GithubBranchesPage;
