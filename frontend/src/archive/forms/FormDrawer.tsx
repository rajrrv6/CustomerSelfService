'use client';

import React from 'react';
import { FormContainerBase } from './FormContainerBase';

interface FormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isDirty?: boolean;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidthClass?: string; // e.g. 'max-w-lg', 'max-w-xl'
  lang?: 'en' | 'ar';
}

export function FormDrawer({
  isOpen,
  onClose,
  isDirty = false,
  title,
  children,
  footer,
  maxWidthClass = 'max-w-md',
  lang = 'en',
}: FormDrawerProps) {
  return (
    <FormContainerBase
      isOpen={isOpen}
      onClose={onClose}
      isDirty={isDirty}
      title={title}
      footer={footer}
      type="drawer"
      maxWidthClass={maxWidthClass}
      lang={lang}
    >
      {children}
    </FormContainerBase>
  );
}
