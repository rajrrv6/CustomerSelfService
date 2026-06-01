'use client';

import React from 'react';
import { FormContainerBase } from './FormContainerBase';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDirty?: boolean;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidthClass?: string; // e.g. 'max-w-md', 'max-w-lg'
  lang?: 'en' | 'ar';
}

export function FormModal({
  isOpen,
  onClose,
  isDirty = false,
  title,
  children,
  footer,
  maxWidthClass = 'max-w-md',
  lang = 'en',
}: FormModalProps) {
  return (
    <FormContainerBase
      isOpen={isOpen}
      onClose={onClose}
      isDirty={isDirty}
      title={title}
      footer={footer}
      type="modal"
      maxWidthClass={maxWidthClass}
      lang={lang}
    >
      {children}
    </FormContainerBase>
  );
}
