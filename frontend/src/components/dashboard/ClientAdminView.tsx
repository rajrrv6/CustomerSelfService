'use client';

import React from 'react';
import { ClientAdminLayout } from '@/components/client-admin/shared/ClientAdminLayout';

export function ClientAdminView({ activeSubScreen }: { activeSubScreen: string }) {
  return <ClientAdminLayout activeSubScreen={activeSubScreen} />;
}
