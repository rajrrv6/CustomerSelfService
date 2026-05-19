export interface TranslationKeys {
  appName: string;
  roleSwitcher: string;
  theme: string;
  language: string;
  logout: string;
  search: string;
  filters: string;
  actions: string;
  status: string;
  priority: string;
  save: string;
  cancel: string;
  edit: string;
  delete: string;
  create: string;
  export: string;
  active: string;
  unassigned: string;
  resolved: string;
  escalated: string;
  urgent: string;
  high: string;
  medium: string;
  low: string;
  submit: string;
  dashboard: string;
  unifiedInbox: string;
  conversations: string;
  tickets: string;
  botManagement: string;
  personaEditor: string;
  intentManagement: string;
  dialogBuilder: string;
  knowledgeBase: string;
  safetyGuardrails: string;
  omnichannel: string;
  analytics: string;
  qaCoaching: string;
  workforceMgmt: string;
  integrations: string;
  customerPortal: string;
  publicBotWidget: string;
  systemSettings: string;
  llmRegistry: string;
  asrTtsRegistry: string;
  costBenchmarks: string;
  crossTenantAnalytics: string;
  vectorDbStatus: string;
  sipTrunkConfig: string;
}

export const translations: Record<'en' | 'ar', TranslationKeys> = {
  en: {
    appName: 'AI-Native mPaaS CX',
    roleSwitcher: 'Select Role',
    theme: 'Theme',
    language: 'Language',
    logout: 'Sign Out',
    search: 'Search...',
    filters: 'Filters',
    actions: 'Actions',
    status: 'Status',
    priority: 'Priority',
    save: 'Save Changes',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    create: 'Create New',
    export: 'Export Data',
    active: 'Active',
    unassigned: 'Unassigned',
    resolved: 'Resolved',
    escalated: 'Escalated',
    urgent: 'Urgent',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    submit: 'Submit',
    dashboard: 'Dashboard',
    unifiedInbox: 'Unified Inbox',
    conversations: 'Conversations',
    tickets: 'Ticketing System',
    botManagement: 'Bot Management',
    personaEditor: 'Persona Editor',
    intentManagement: 'Intent & Slots',
    dialogBuilder: 'Dialog Flow Builder',
    knowledgeBase: 'RAG & Knowledge Base',
    safetyGuardrails: 'Safety & Guardrails',
    omnichannel: 'Omnichannel Channels',
    analytics: 'Analytics & CSAT',
    qaCoaching: 'QA & Coaching',
    workforceMgmt: 'Workforce Planning',
    integrations: 'ERP & CRM Integrations',
    customerPortal: 'Customer Portal',
    publicBotWidget: 'Public Bot Widget',
    systemSettings: 'Global System Settings',
    llmRegistry: 'LLM Model Registry',
    asrTtsRegistry: 'ASR/TTS Provider Registry',
    costBenchmarks: 'Model Cost Benchmarks',
    crossTenantAnalytics: 'Cross-Tenant Analytics',
    vectorDbStatus: 'Vector DB Clusters',
    sipTrunkConfig: 'SIP Trunk Voice Config'
  },
  ar: {
    appName: 'منصة mPaaS لخدمة العملاء الذكية',
    roleSwitcher: 'اختر الدور',
    theme: 'المظهر',
    language: 'اللغة',
    logout: 'تسجيل الخروج',
    search: 'بحث...',
    filters: 'تصفية',
    actions: 'إجراءات',
    status: 'الحالة',
    priority: 'الأولوية',
    save: 'حفظ التغييرات',
    cancel: 'إلغاء',
    edit: 'تعديل',
    delete: 'حذف',
    create: 'إنشاء جديد',
    export: 'تصدير البيانات',
    active: 'نشط',
    unassigned: 'غير معين',
    resolved: 'تم حلها',
    escalated: 'تم تصعيدها',
    urgent: 'عاجل جداً',
    high: 'عالية',
    medium: 'متوسطة',
    low: 'منخفضة',
    submit: 'إرسال',
    dashboard: 'لوحة القيادة',
    unifiedInbox: 'البريد الوارد الموحد',
    conversations: 'المحادثات المباشرة',
    tickets: 'نظام التذاكر الدعم',
    botManagement: 'إدارة البوتات والذكاء الاصطناعي',
    personaEditor: 'محرر شخصية البوت',
    intentManagement: 'إدارة النوايا والفتحات',
    dialogBuilder: 'مخطط تدفق الحوار',
    knowledgeBase: 'قاعدة المعرفة والـ RAG',
    safetyGuardrails: 'حواجز الأمان والسلامة',
    omnichannel: 'القنوات والاتصالات',
    analytics: 'التحليلات ومؤشر رضا العملاء',
    qaCoaching: 'الجودة والتدريب التوجيهي',
    workforceMgmt: 'تخطيط القوى العاملة',
    integrations: 'تكاملات الأنظمة والـ CRM',
    customerPortal: 'بوابة العميل المفتوحة',
    publicBotWidget: 'ويدجت البوت العام',
    systemSettings: 'إعدادات النظام العامة',
    llmRegistry: 'سجل نماذج الذكاء الاصطناعي LLM',
    asrTtsRegistry: 'سجل موفري التعرف وتحويل الكلام (ASR/TTS)',
    costBenchmarks: 'مقارنات تكاليف النماذج',
    crossTenantAnalytics: 'تحليلات المشتركين المتعددة',
    vectorDbStatus: 'حالة مجموعات قواعد بيانات المتجهات',
    sipTrunkConfig: 'إعدادات خطوط الاتصال SIP Trunk'
  }
};
