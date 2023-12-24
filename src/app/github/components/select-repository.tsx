'use client';
import React, { FC, useEffect, useMemo, useState } from 'react';

import { PopoverContentProps } from '@radix-ui/react-popover';

import { useRepositoriesStore } from '@/app/github/repositories/store';
import { Button } from '@/components/ui/button';
import { Command } from '@/components/ui/command';
import { Popover } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import { Check, ChevronsUpDown } from 'lucide-react';

interface SelectRepositoryProps {
  className?: PopoverContentProps['className'];
  onChange(repository: string): void;
}

export const SelectRepository: FC<SelectRepositoryProps> = ({
  onChange,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  const {
    repositories: fullRepositoryList,
    loadRepositories,
    loading,
  } = useRepositoriesStore();

  const onSelectItem = (currentValue: string): void => {
    onChange(currentValue);
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
    <Popover.Root onOpenChange={setOpen} open={open}>
      <Popover.Trigger asChild>
        <Button
          aria-expanded={open}
          className="w-full justify-between"
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
      <Popover.Content className={cn('w-96 p-0', className)}>
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
                  {item.label}
                </Command.Item>
              ))}
          </Command.Group>
        </Command.Root>
      </Popover.Content>
    </Popover.Root>
  );
};
