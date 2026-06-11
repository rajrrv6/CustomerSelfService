import {
  Activity,
  Calendar,
  Shield,
  Lock,
  Mail,
  Bot,
  GitBranch,
  Layers,
  Brain,
  ShieldCheck,
  Globe,
  Database,
  TrendingUp,
  Phone,
  BarChart2,
  FileText,
  Play,
  Settings,
  Bell,
  Users
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface ClientAdminNavItem {
  id: string;
  labelKey: string;
  icon: LucideIcon;
  permission: string;
  route: string;
}

export interface ClientAdminNavSection {
  id: string;
  labelKey: string;
  items: ClientAdminNavItem[];
}

export const clientAdminNavSections: ClientAdminNavSection[] = [
  {
    id: 'ai_knowledge',
    labelKey: 'caNavAIKnowledge',
    items: [
      {
        id: 'bots',
        labelKey: 'bots',
        icon: Bot,
        permission: 'bots',
        route: '/tenant/dashboard',
      },
      {
        id: 'intents',
        labelKey: 'intents',
        icon: Layers,
        permission: 'intents',
        route: '/tenant/dashboard',
      },
      {
        id: 'dialog_flow',
        labelKey: 'dialog_flow',
        icon: GitBranch,
        permission: 'dialog_flow',
        route: '/tenant/dashboard',
      },
      {
        id: 'knowledge_base',
        labelKey: 'knowledge_base',
        icon: Brain,
        permission: 'knowledge_base',
        route: '/tenant/dashboard',
      },
      {
        id: 'training',
        labelKey: 'training',
        icon: Brain,
        permission: 'training',
        route: '/tenant/dashboard',
      },
      {
        id: 'guardrails',
        labelKey: 'guardrails',
        icon: ShieldCheck,
        permission: 'guardrails',
        route: '/tenant/dashboard',
      },
    ],
  },
  {
    id: 'channels_automation',
    labelKey: 'caNavChannels',
    items: [
      {
        id: 'channels',
        labelKey: 'channels',
        icon: Globe,
        permission: 'channels',
        route: '/tenant/dashboard',
      },
      {
        id: 'campaigns',
        labelKey: 'campaigns',
        icon: TrendingUp,
        permission: 'campaigns',
        route: '/tenant/dashboard',
      },
      {
        id: 'voice_ivr',
        labelKey: 'voice_ivr',
        icon: Phone,
        permission: 'voice_ivr',
        route: '/tenant/dashboard',
      },
      {
        id: 'automation_rules',
        labelKey: 'automation_rules',
        icon: Layers,
        permission: 'automation_rules',
        route: '/tenant/dashboard',
      },
      {
        id: 'integrations',
        labelKey: 'integrations',
        icon: Database,
        permission: 'integrations',
        route: '/tenant/dashboard',
      },
      {
        id: 'deployments',
        labelKey: 'deployments',
        icon: Play,
        permission: 'deployments',
        route: '/tenant/dashboard',
      },
    ],
  },
  {
    id: 'governance_analytics',
    labelKey: 'caNavGovernance',
    items: [
      {
        id: 'analytics_center',
        labelKey: 'analytics_center',
        icon: BarChart2,
        permission: 'analytics_center',
        route: '/tenant/dashboard',
      },
      {
        id: 'reports',
        labelKey: 'reports',
        icon: FileText,
        permission: 'reports',
        route: '/tenant/dashboard',
      },
      {
        id: 'surveys',
        labelKey: 'surveys',
        icon: TrendingUp,
        permission: 'surveys',
        route: '/tenant/dashboard',
      },
      {
        id: 'billing',
        labelKey: 'billing',
        icon: Layers,
        permission: 'billing',
        route: '/tenant/dashboard',
      },
      {
        id: 'rbac',
        labelKey: 'rbac',
        icon: ShieldCheck,
        permission: 'rbac',
        route: '/tenant/dashboard',
      },
      {
        id: 'audit_logs',
        labelKey: 'audit_logs',
        icon: FileText,
        permission: 'audit_logs',
        route: '/tenant/dashboard',
      },
    ],
  },
  {
    id: 'system_access',
    labelKey: 'caNavSystem',
    items: [
      {
        id: 'notifications',
        labelKey: 'notifications',
        icon: Bell,
        permission: 'notifications',
        route: '/tenant/dashboard',
      },
      {
        id: 'settings',
        labelKey: 'settings',
        icon: Settings,
        permission: 'settings',
        route: '/tenant/dashboard',
      },
    ],
  },
];

/**
 * Flat list of all Client Admin nav items for backward compatibility.
 */
export const clientAdminNavigation: ClientAdminNavItem[] = clientAdminNavSections.flatMap(
  (s) => s.items
);
