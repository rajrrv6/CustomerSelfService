import type { CountryOption, LanguageOption } from '../types';

export const REGISTER_MOCK_API_DELAY_MS = 1100;
export const REGISTER_MOCK_OTP_VERIFY_DELAY_MS = 850;
export const REGISTER_MOCK_RESEND_DELAY_MS = 600;
export const REGISTER_RESEND_COOLDOWN_SECONDS = 30;
export const REGISTER_MOCK_OTP = '123456';

export const REGISTER_LANGUAGE_OPTIONS: LanguageOption[] = [
  { value: 'en', labelEn: 'English', labelAr: 'الإنجليزية' },
  { value: 'ar', labelEn: 'Arabic', labelAr: 'العربية' },
];

export const REGISTER_COUNTRY_OPTIONS: CountryOption[] = [
  { value: 'sa', dialingCode: '+966', labelEn: 'Saudi Arabia', labelAr: 'السعودية' },
  { value: 'ae', dialingCode: '+971', labelEn: 'United Arab Emirates', labelAr: 'الإمارات العربية المتحدة' },
  { value: 'kw', dialingCode: '+965', labelEn: 'Kuwait', labelAr: 'الكويت' },
  { value: 'qa', dialingCode: '+974', labelEn: 'Qatar', labelAr: 'قطر' },
  { value: 'om', dialingCode: '+968', labelEn: 'Oman', labelAr: 'عُمان' },
];

export const REGISTER_SPLIT_BENEFITS = [
  {
    id: 'policy',
    stat: 'Policy-aware',
    titleEn: 'Enterprise validation rules',
    titleAr: 'قواعد تحقق مؤسسية',
    descriptionEn: 'Strict password, contact, and consent checks before the account is provisioned.',
    descriptionAr: 'فحوصات صارمة لكلمة المرور وبيانات الاتصال والموافقة قبل تهيئة الحساب.',
  },
  {
    id: 'otp',
    stat: 'OTP secured',
    titleEn: 'Mobile verification flow',
    titleAr: 'تدفق تحقق الجوال',
    descriptionEn: 'A simulated 6-digit OTP protects the onboarding handoff.',
    descriptionAr: 'رمز تحقق مكوّن من 6 أرقام يحاكي حماية عملية الإعداد.',
  },
  {
    id: 'locale',
    stat: 'EN / AR',
    titleEn: 'Localized bilingual UX',
    titleAr: 'تجربة ثنائية اللغة',
    descriptionEn: 'English and Arabic layouts mirror automatically with the selected locale.',
    descriptionAr: 'تنعكس واجهة الإنجليزية والعربية تلقائياً حسب اللغة المختارة.',
  },
];

export const REGISTER_METRICS = [
  { labelEn: 'Average onboarding time', labelAr: 'متوسط وقت الإعداد', value: '2.4 min' },
  { labelEn: 'OTP verification rate', labelAr: 'معدل التحقق', value: '99.2%' },
  { labelEn: 'Self-service activation', labelAr: 'التفعيل الذاتي', value: '24/7' },
];