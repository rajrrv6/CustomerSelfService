export function getAiPrompts(lang: 'en' | 'ar') {
  return [
    {
      text: lang === 'ar' ? 'كيف يمكنني استرداد قيمة اشتراك SaaS؟' : 'How to request a SaaS subscription refund',
      query: 'refund'
    },
    {
      text: lang === 'ar' ? 'إعداد OAuth لموصلات API' : 'Setting up OAuth client API connectors',
      query: 'oauth'
    },
    {
      text: lang === 'ar' ? 'إعادة تعيين تفاصيل تسجيل الدخول المغلقة' : 'Resetting locked registry login',
      query: 'registry login'
    },
  ];
}

export function getSavedSearches() {
  return [
    { query: 'refund ORD-99881' },
    { query: 'Stripe 403 Forbidden scopes' },
    { query: 'SLA priority matrix' }
  ];
}

export function getQuickPrompts(lang: 'en' | 'ar') {
  return [
    { label: lang === 'ar' ? 'استرجاع اشتراك' : 'Refund subscription', query: 'refund' },
    { label: lang === 'ar' ? 'إعداد OAuth' : 'Setup OAuth client', query: 'oauth' },
    { label: lang === 'ar' ? 'حساب مغلق' : 'Locked account login', query: 'login' }
  ];
}
