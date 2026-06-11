import {
  LayoutDashboard,
  Brain,
  BarChart2,
  Database,
  Phone,
  Layers,
  FileText,
  Bell,
  Settings,
  LifeBuoy,
  Users,
  ServerCog,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface SuperAdminNavItem {
  id: string;
  labelKey: string;
  icon: LucideIcon;
  permission: string;
  route: string;
}

export interface SuperAdminNavSection {
  /** Unique section identifier used for keying */
  id: string;
  /** Key into the translation object (TranslationKeys) for the section label */
  labelKey: string;
  items: SuperAdminNavItem[];
}

export const superAdminNavSections: SuperAdminNavSection[] = [
  {
    id: 'main',
    labelKey: 'saNavMain',
    items: [
      {
        id: 'sa_dashboard',
        labelKey: 'saDashboard',
        icon: LayoutDashboard,
        permission: 'sa_dashboard',
        route: '/admin/infrastructure',
      },
    ],
  },
  {
    id: 'platform_management',
    labelKey: 'saNavPlatformMgmt',
    items: [
      {
        id: 'sa_master_data',
        labelKey: 'saMasterData',
        icon: Brain,
        permission: 'sa_master_data',
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
        id: 'sa_system_ops',
        labelKey: 'saSystemOps',
        icon: ServerCog,
        permission: 'sa_system_ops',
        route: '/admin/infrastructure',
      },
    ],
  },
  {
    id: 'tenant_management',
    labelKey: 'saNavTenantMgmt',
    items: [
      {
        id: 'sa_tenant_management',
        labelKey: 'saTenantManagement',
        icon: Users,
        permission: 'sa_tenant_management',
        route: '/admin/infrastructure',
      },
    ],
  },
  {
    id: 'operations',
    labelKey: 'saNavOperations',
    items: [
      {
        id: 'sa_analytics',
        labelKey: 'saAnalytics',
        icon: BarChart2,
        permission: 'sa_analytics',
        route: '/admin/infrastructure',
      },
      {
        id: 'sa_billing',
        labelKey: 'saBilling',
        icon: Layers,
        permission: 'sa_billing',
        route: '/admin/infrastructure',
      },
    ],
  },
  {
    id: 'governance',
    labelKey: 'saNavGovernance',
    items: [
      {
        id: 'sa_audit',
        labelKey: 'saAudit',
        icon: FileText,
        permission: 'sa_audit',
        route: '/admin/infrastructure',
      },
    ],
  },
  {
    id: 'system',
    labelKey: 'saNavSystem',
    items: [
      {
        id: 'sa_notifications',
        labelKey: 'saNotifications',
        icon: Bell,
        permission: 'sa_notifications',
        route: '/admin/infrastructure',
      },
      {
        id: 'sa_settings',
        labelKey: 'saSettings',
        icon: Settings,
        permission: 'sa_settings',
        route: '/admin/infrastructure',
      },
    ],
  },
  {
    id: 'support',
    labelKey: 'saNavSupport',
    items: [
      {
        id: 'sa_help',
        labelKey: 'saHelp',
        icon: LifeBuoy,
        permission: 'sa_help',
        route: '/admin/infrastructure',
      },
    ],
  },
];

/**
 * Flat list of all SA nav items — retained for backward compatibility
 * with any consumers that iterate over a flat array.
 */
export const superAdminNavigation: SuperAdminNavItem[] = superAdminNavSections.flatMap(
  (s) => s.items
);
