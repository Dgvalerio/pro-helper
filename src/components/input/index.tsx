import React, {
  ComponentPropsWithoutRef,
  ElementRef,
  FC,
  forwardRef,
  InputHTMLAttributes,
  ReactNode,
} from 'react';

import { Root } from '@radix-ui/react-label';
import { Slot } from '@radix-ui/react-slot';

import { cn } from '@/lib/utils';

import { cva, type VariantProps } from 'class-variance-authority';

const inputRootVariants = cva(
  [
    'flex flex-1 items-center gap-1 rounded bg-white px-2 file:bg-transparent dark:bg-zinc-950 text-zinc-400 transition-colors duration-75 focus-within:text-zinc-100',
    'focus-within:ring-2 focus-within:ring-zinc-950 focus-within:ring-offset-2 dark:ring-offset-zinc-950 dark:focus-within:ring-zinc-300',
  ],
  {
    variants: {
      error: { true: 'bg-red-900/20 text-red-900/80 ring-1 ring-red-900/80' },
    },
  }
);

export namespace InputProps {
  export interface Root extends VariantProps<typeof inputRootVariants> {
    children: ReactNode;
  }

  export interface Icon {
    children: ReactNode;
  }

  export interface Text extends InputHTMLAttributes<HTMLInputElement> {
    name: string;
  }

  export interface Error {
    error?: string;
  }
}

const InputRoot: FC<InputProps.Root> = ({ children, error }) => (
  <div className={inputRootVariants({ error })}>{children}</div>
);

const InputLabel = forwardRef<
  ElementRef<typeof Root>,
  ComponentPropsWithoutRef<typeof Root>
>(({ className, ...props }, ref) => (
  <Root
    className={cn(
      'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      className
    )}
    ref={ref}
    {...props}
  />
));

InputLabel.displayName = Root.displayName;

const InputIcon: FC<InputProps.Icon> = ({ children }) => (
  <Slot className="h-4 w-4">{children}</Slot>
);

const InputText = forwardRef<HTMLInputElement, InputProps.Text>(
  ({ className, type, ...props }, ref) => (
    <input
      className={cn(
        'flex h-10 w-full rounded-md bg-transparent px-3 py-2 text-sm outline-none ring-offset-white file:border-0 file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:placeholder:text-zinc-400',
        className
      )}
      ref={ref}
      type={type}
      {...props}
    />
  )
);

InputText.displayName = 'InputText';

const InputError: FC<InputProps.Error> = ({ error, ...props }) =>
  error ? <p {...props}>{error}</p> : <></>;

export const Input = {
  Root: InputRoot,
  Label: InputLabel,
  Text: InputText,
  Icon: InputIcon,
  Error: InputError,
};
