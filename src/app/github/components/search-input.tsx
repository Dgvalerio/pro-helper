import React, { FC, InputHTMLAttributes } from 'react';

import { Input } from '@/components/input';

import { Search } from 'lucide-react';

interface SearchInputProps {
  search: string;
  onChange(search: string): void;
}

export const SearchInput: FC<SearchInputProps> = ({ search, onChange }) => {
  const handleSearch: InputHTMLAttributes<HTMLInputElement>['onChange'] = (
    event
  ): void => onChange(event.target.value);

  return (
    <Input.Label className="flex w-full flex-col" htmlFor="branch">
      <Input.Root>
        <Input.Icon>
          <Search />
        </Input.Icon>
        <Input.Text name="search" onChange={handleSearch} value={search} />
      </Input.Root>
    </Input.Label>
  );
};
