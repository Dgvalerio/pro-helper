'use client';
import React, { FC, useEffect, useMemo, useState } from 'react';

import { useBranchesStore } from '@/app/github/branches/store';
import { useRepositoriesStore } from '@/app/github/repositories/store';
import { Button } from '@/components/ui/button';
import { Command } from '@/components/ui/command';
import { Popover } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import { Check, ChevronsUpDown } from 'lucide-react';

export const SelectRepository: FC = () => {
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
