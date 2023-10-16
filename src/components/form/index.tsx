'use client';

import { HTMLAttributes, ReactNode } from 'react';
import {
  FieldValues,
  FormProvider,
  SubmitHandler,
  useFormContext,
  Path,
  UseFormReturn,
} from 'react-hook-form';

import { Input, InputProps } from '@/components/input';
import { cn } from '@/lib/utils';

export namespace FormProps {
  export interface Root<TFieldValues extends FieldValues>
    extends UseFormReturn<TFieldValues> {
    children: ReactNode;
    className?: HTMLAttributes<HTMLFormElement>['className'];
    submitHandler: SubmitHandler<TFieldValues>;
  }

  export interface Field<TFieldValues extends FieldValues>
    extends Omit<InputProps.Text, 'required'> {
    name: Path<TFieldValues>;
    label: string;
    notRequired?: boolean;
    icon?: ReactNode;
  }
}

const FormRoot = <TFieldValues extends FieldValues>({
  children,
  className,
  submitHandler,
  ...props
}: FormProps.Root<TFieldValues>): ReactNode => (
  <FormProvider {...props}>
    <form
      className={cn('flex w-96 flex-col justify-stretch gap-4', className)}
      onSubmit={props.handleSubmit(submitHandler)}
    >
      {children}
    </form>
  </FormProvider>
);

const FormField = <TFieldValues extends FieldValues>({
  name,
  label,
  notRequired,
  icon: Icon,
  ...props
}: FormProps.Field<TFieldValues>): ReactNode => {
  const {
    register,
    formState: { errors },
  } = useFormContext<TFieldValues>();

  return (
    <Input.Label className="flex flex-col gap-1" htmlFor={name}>
      <span className="py-2">{label}</span>
      <Input.Root error={!!errors[name]}>
        {Icon && <Input.Icon>{Icon}</Input.Icon>}
        <Input.Text required={!notRequired} {...props} {...register(name)} />
      </Input.Root>
      <Input.Error
        error={errors[name] ? String(errors[name]?.message) : undefined}
      />
    </Input.Label>
  );
};

export const Form = {
  Root: FormRoot,
  Field: FormField,
};
