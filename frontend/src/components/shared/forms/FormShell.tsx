'use client';

import React from 'react';
import { UseFormReturn, FormProvider, FieldValues } from 'react-hook-form';

interface FormShellProps<TFieldValues extends FieldValues = FieldValues> {
  methods: UseFormReturn<TFieldValues>;
  onSubmit: (values: TFieldValues) => void;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function FormShell({
  methods,
  onSubmit,
  children,
  className = 'space-y-5',
  id,
}: FormShellProps<any>) {
  return (
    <FormProvider {...methods}>
      <form
        id={id}
        onSubmit={methods.handleSubmit(onSubmit)}
        className={className}
        noValidate
      >
        {children}
      </form>
    </FormProvider>
  );
}
