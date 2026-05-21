'use client';

import React from 'react';
import { CustomerPortalLayout } from '@/components/customer-portal/shared/CustomerPortalLayout';

export function CustomerPortalView({
  activeSubScreen,
  setActiveSubScreen
}: {
  activeSubScreen: string;
  setActiveSubScreen: (sub: string) => void;
}) {
  return (
    <CustomerPortalLayout
      activeSubScreen={activeSubScreen}
      setActiveSubScreen={setActiveSubScreen}
    />
  );
}
