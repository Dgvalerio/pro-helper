'use client';
import React, { FC, useMemo, useState } from 'react';

import { useCommitsStore } from '@/app/github/commits/store';
import { useRepositoryCollaboratorsStore } from '@/app/github/users/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Command } from '@/components/ui/command';
import { Popover } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import { Check, ChevronsUpDown } from 'lucide-react';

interface Option {
  label: string;
  value: string;
  avatar: string;
}

export const SelectUser: FC = () => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  const { loadCommits } = useCommitsStore();
  const {
    collaborators: fullList,
    loading,
    repository,
  } = useRepositoryCollaboratorsStore();

  const onSelectItem = (currentValue: string): void => {
    void loadCommits({ fullName: repository, user: currentValue });
    setValue(currentValue === value ? '' : currentValue);
    setOpen(false);
  };

  const items: Option[] = useMemo(
    () =>
      fullList.map(
        (props): Option => ({
          value: props.login,
          label: props.login,
          avatar: props.avatar_url,
        })
      ),
    [fullList]
  );

  const inputLabel = useMemo(() => 'Selecione um usuário...', []);
  const searchLabel = useMemo(() => 'Pesquisar usuário...', []);
  const emptyLabel = useMemo(() => 'Nenhum usuário encontrado.', []);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={fullList.length === 0}
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
                  <Avatar className="mr-4 h-9 w-9">
                    <AvatarImage src={item.avatar} alt={item.value} />
                    <AvatarFallback>{item.label}</AvatarFallback>
                  </Avatar>
                  {item.label}
                </Command.Item>
              ))}
          </Command.Group>
        </Command.Root>
      </Popover.Content>
    </Popover.Root>
  );
};
