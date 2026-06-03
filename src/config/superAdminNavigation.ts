import {
  LayoutDashboard,
  Brain,
  BarChart2,
  Database,
  Phone,
  Layers,
  FileText
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface SuperAdminNavItem {
  id: string;
  labelKey: string;
  icon: LucideIcon;
  permission: string;
  route: string;
}

export const superAdminNavigation: SuperAdminNavItem[] = [
  {
    id: 'sa_dashboard',
    labelKey: 'saDashboard',
    icon: LayoutDashboard,
    permission: 'sa_dashboard',
    route: '/admin/infrastructure',
  },
  {
    id: 'sa_master_data',
    labelKey: 'saMasterData',
    icon: Brain,
    permission: 'sa_master_data',
    route: '/admin/infrastructure',
  },
  {
    id: 'sa_analytics',
    labelKey: 'saAnalytics',
    icon: BarChart2,
    permission: 'sa_analytics',
    route: '/admin/infrastructure',
  },
  {
    id: 'sa_infra',
    labelKey: 'saInfrastructure',
    icon: Database,
    permission: 'sa_infra',
    route: '/admin/infrastructure',
  },
  {
    id: 'sa_telephony',
    labelKey: 'saTelephony',
    icon: Phone,
    permission: 'sa_telephony',
    route: '/admin/infrastructure',
  },
  {
    id: 'sa_billing',
    labelKey: 'saBilling',
    icon: Layers,
    permission: 'sa_billing',
    route: '/admin/infrastructure',
  },
  {
    id: 'sa_audit',
    labelKey: 'saAudit',
    icon: FileText,
    permission: 'sa_audit',
    route: '/admin/infrastructure',
  },
];
