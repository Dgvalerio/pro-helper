'use client';
import React, { FC, useMemo, useState } from 'react';

import { PopoverContentProps } from '@radix-ui/react-popover';

import { useBranchesStore } from '@/app/github/branches/store';
import { Button } from '@/components/ui/button';
import { Command } from '@/components/ui/command';
import { Popover } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import { Check, ChevronsUpDown } from 'lucide-react';

interface SelectBranchProps {
  className?: PopoverContentProps['className'];
  onChange(branch: string): void;
}

export const SelectBranch: FC<SelectBranchProps> = ({
  onChange,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  const { branches: fullBranchList, loading } = useBranchesStore();

  const onSelectItem = (currentValue: string): void => {
    onChange(currentValue);
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
    <Popover.Root onOpenChange={setOpen} open={open}>
      <Popover.Trigger asChild>
        <Button
          aria-expanded={open}
          className="w-full justify-between"
          disabled={fullBranchList.length === 0}
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
