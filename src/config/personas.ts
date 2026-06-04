import { UserRole } from '@/types';

export interface PersonaRegistryItem {
  value: UserRole | 'public_bot';
  labelEn: string;
  labelAr: string;
  defaultScreen: string;
  route: string;
}

export const CENTRALIZED_PERSONAS: PersonaRegistryItem[] = [
  {
    value: 'super_admin',
    labelEn: 'Super Admin',
    labelAr: 'مشرف عام النظام',
    defaultScreen: 'sa_dashboard',
    route: '/admin/infrastructure'
  },
  {
    value: 'client_admin',
    labelEn: 'Client Admin',
    labelAr: 'مدير العميل',
    defaultScreen: 'bots',
    route: '/tenant/dashboard'
  },
  {
    value: 'support_agent',
    labelEn: 'Support Agent',
    labelAr: 'وكيل الدعم',
    defaultScreen: 'agent_dashboard',
    route: '/tenant/dashboard'
  },
  {
    value: 'qa_manager',
    labelEn: 'QA Manager',
    labelAr: 'مدير الجودة',
    defaultScreen: 'qa_queue',
    route: '/tenant/dashboard'
  },
  {
    value: 'supervisor',
    labelEn: 'Supervisor',
    labelAr: 'مشرف الفريق',
    defaultScreen: 'supervisor_monitor',
    route: '/tenant/dashboard'
  },
  {
    value: 'customer',
    labelEn: 'End User',
    labelAr: 'بوابة المستخدمين',
    defaultScreen: 'customer_home',
    route: '/portal/home'
  },
  {
    value: 'public_bot',
    labelEn: 'Public / Bot',
    labelAr: 'البوت العام',
    defaultScreen: 'public',
    route: '/portal/public'
  }
];
