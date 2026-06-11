'use client';

import React from 'react';
import { SuperAdminLayout } from '@/components/super-admin/shared/SuperAdminLayout';

export function SuperAdminView({ activeSubScreen }: { activeSubScreen: string }) {
  return <SuperAdminLayout activeSubScreen={activeSubScreen} />;
}
