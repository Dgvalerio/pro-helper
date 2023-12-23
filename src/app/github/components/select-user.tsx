'use client';
import React, { FC, useMemo, useState } from 'react';

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

interface SelectUserProps {
  onChange(user: string): void;
}

export const SelectUser: FC<SelectUserProps> = ({ onChange }) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  const { collaborators: fullList, loading } =
    useRepositoryCollaboratorsStore();

  const onSelectItem = (currentValue: string): void => {
    onChange(currentValue);
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
    <Popover.Root onOpenChange={setOpen} open={open}>
      <Popover.Trigger asChild>
        <Button
          aria-expanded={open}
          className="w-full justify-between"
          disabled={fullList.length === 0}
          role="combobox"
          variant="outline"
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
                  onSelect={onSelectItem}
                  value={item.value}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === item.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <Avatar className="mr-4 h-9 w-9">
                    <AvatarImage alt={item.value} src={item.avatar} />
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
