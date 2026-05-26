'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Globe2,
  Loader2,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  UserCircle2,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { translations } from '@/i18n/translations';
import {
  REGISTER_COUNTRY_OPTIONS,
  REGISTER_LANGUAGE_OPTIONS,
  REGISTER_METRICS,
  REGISTER_SPLIT_BENEFITS,
} from './mock/constants';
import { useRegisterSession } from './hooks/useRegisterSession';
import { useToastQueue } from './hooks/useToastQueue';
import { validateRegisterForm } from './validation/registerValidation';
import type { RegisterFormErrors, RegisterFormValues } from './types';
import { RegisterField } from './components/RegisterField';
import { PasswordVisibilityToggle } from './components/PasswordVisibilityToggle';
import { ToastStack } from './components/ToastStack';

const INITIAL_VALUES: RegisterFormValues = {
  fullName: '',
  email: '',
  mobile: '',
  password: '',
  confirmPassword: '',
  preferredLanguage: 'en',
  country: '',
  acceptTerms: false,
};

export function RegisterForm() {
  const router = useRouter();
  const { lang, setLang } = useApp();
  const t = translations[lang];
  const isRtl = lang === 'ar';
  const { submitRegistration } = useRegisterSession();
  const { toasts, pushToast, removeToast } = useToastQueue();

  const [values, setValues] = useState<RegisterFormValues>({ ...INITIAL_VALUES, preferredLanguage: lang });
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [touched, setTouched] = useState<Record<keyof RegisterFormValues, boolean>>({
    fullName: false,
    email: false,
    mobile: false,
    password: false,
    confirmPassword: false,
    preferredLanguage: false,
    country: false,
    acceptTerms: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  useEffect(() => {
    setValues((current) => ({ ...current, preferredLanguage: lang }));
  }, [lang]);

  const validationMessages = useMemo(() => t.auth.register.validation, [t.auth.register.validation]);

  const updateValidation = (nextValues: RegisterFormValues) => validateRegisterForm(nextValues, validationMessages).errors;

  const getFieldError = (field: keyof RegisterFormValues) => {
    if (!submitAttempted && !touched[field]) return undefined;
    return errors[field as keyof RegisterFormErrors];
  };

  const setField = <K extends keyof RegisterFormValues>(field: K, nextValue: RegisterFormValues[K]) => {
    const nextValues = { ...values, [field]: nextValue } as RegisterFormValues;
    setValues(nextValues);

    if (field === 'preferredLanguage') {
      setLang(nextValue as RegisterFormValues['preferredLanguage']);
    }

    if (submitAttempted) {
      setErrors(updateValidation(nextValues));
    }
  };

  const markTouched = <K extends keyof RegisterFormValues>(field: K) => {
    setTouched((current) => ({ ...current, [field]: true }));
    setErrors(updateValidation(values));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitAttempted(true);

    const nextErrors = updateValidation(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      pushToast(
        'error',
        isRtl ? 'يرجى مراجعة البيانات' : 'Review required fields',
        isRtl ? 'أكمل الحقول المطلوبة قبل المتابعة.' : 'Complete the required fields before continuing.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitRegistration(values);
      if (result.success) {
        router.replace('/register/verify-otp');
      }
    } catch {
      pushToast(
        'error',
        isRtl ? 'تعذر إنشاء الحساب' : 'Unable to create account',
        isRtl ? 'حاول مرة أخرى بعد لحظات.' : 'Please try again in a moment.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      <ToastStack toasts={toasts} onDismiss={removeToast} />

      <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr] items-stretch">
        <section className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-linear-to-br from-slate-950 via-blue-950 to-slate-900 text-white shadow-2xl shadow-blue-950/20 p-6 sm:p-8 lg:p-10">
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.28),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.2),transparent_30%)]"
            aria-hidden
          />
          <div className="relative space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100 backdrop-blur">
              <Sparkles className="w-3.5 h-3.5" aria-hidden />
              <span>{t.auth.register.badge}</span>
            </div>

            <div className="space-y-3 max-w-xl">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">{t.auth.register.splitTitle}</h2>
              <p className="text-sm sm:text-base leading-relaxed text-slate-200/90">{t.auth.register.splitSubtitle}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {REGISTER_METRICS.map((metric) => (
                <div key={metric.value} className="rounded-2xl border border-white/10 bg-white/8 backdrop-blur px-4 py-3">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-slate-300">{isRtl ? metric.labelAr : metric.labelEn}</div>
                  <div className="mt-2 text-lg font-black text-white">{metric.value}</div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              {REGISTER_SPLIT_BENEFITS.map((benefit) => (
                <div key={benefit.id} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/8 backdrop-blur p-4">
                  <div className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/12 text-white">
                    <CheckCircle2 className="w-5 h-5" aria-hidden />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300">{benefit.stat}</p>
                    <h3 className="text-sm sm:text-base font-semibold text-white">{isRtl ? benefit.titleAr : benefit.titleEn}</h3>
                    <p className="text-sm leading-relaxed text-slate-200/85">{isRtl ? benefit.descriptionAr : benefit.descriptionEn}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/70 backdrop-blur-xl shadow-2xl shadow-slate-200/40 dark:shadow-none p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-2">
              <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">{t.auth.register.title}</h3>
              <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">{t.auth.register.subtitle}</p>
              {t.auth.register.notice && (
                <div className="p-3.5 bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 rounded-2xl text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                  {t.auth.register.notice}
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <RegisterField label={t.auth.register.fullName} htmlFor="fullName" error={getFieldError('fullName')}>
                <div className="relative">
                  <UserCircle2 className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRtl ? 'right-3' : 'left-3'}`} aria-hidden />
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    value={values.fullName}
                    onChange={(event) => setField('fullName', event.target.value)}
                    onBlur={() => markTouched('fullName')}
                    placeholder={t.auth.register.fullNamePlaceholder}
                    className={`w-full rounded-xl border bg-slate-50 dark:bg-slate-950 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors ${isRtl ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'} ${
                      getFieldError('fullName') ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
                    }`}
                    aria-invalid={!!getFieldError('fullName')}
                  />
                </div>
              </RegisterField>

              <RegisterField label={t.auth.register.emailAddress} htmlFor="email" error={getFieldError('email')}>
                <div className="relative">
                  <Mail className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRtl ? 'right-3' : 'left-3'}`} aria-hidden />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    value={values.email}
                    onChange={(event) => setField('email', event.target.value)}
                    onBlur={() => markTouched('email')}
                    placeholder={t.auth.register.emailPlaceholder}
                    dir="ltr"
                    className={`w-full rounded-xl border bg-slate-50 dark:bg-slate-950 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors pl-10 pr-4 text-left ${
                      getFieldError('email') ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
                    }`}
                    aria-invalid={!!getFieldError('email')}
                  />
                </div>
              </RegisterField>

              <RegisterField label={t.auth.register.mobileNumber} htmlFor="mobile" error={getFieldError('mobile')}>
                <div className="relative">
                  <Phone className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRtl ? 'right-3' : 'left-3'}`} aria-hidden />
                  <input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    autoComplete="tel"
                    inputMode="numeric"
                    value={values.mobile}
                    onChange={(event) => setField('mobile', event.target.value.replace(/\D/g, ''))}
                    onBlur={() => markTouched('mobile')}
                    placeholder={t.auth.register.mobilePlaceholder}
                    dir="ltr"
                    className={`w-full rounded-xl border bg-slate-50 dark:bg-slate-950 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors pl-10 pr-4 text-left ${
                      getFieldError('mobile') ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
                    }`}
                    aria-invalid={!!getFieldError('mobile')}
                  />
                </div>
              </RegisterField>

              <RegisterField label={t.auth.register.preferredLanguage} htmlFor="preferredLanguage">
                <div className="relative">
                  <Globe2 className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRtl ? 'right-3' : 'left-3'}`} aria-hidden />
                  <select
                    id="preferredLanguage"
                    name="preferredLanguage"
                    value={values.preferredLanguage}
                    onChange={(event) => setField('preferredLanguage', event.target.value as RegisterFormValues['preferredLanguage'])}
                    onBlur={() => markTouched('preferredLanguage')}
                    className={`w-full rounded-xl border bg-slate-50 dark:bg-slate-950 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors ${isRtl ? 'pr-10 pl-10 text-right' : 'pl-10 pr-10 text-left'} border-slate-200 dark:border-slate-800`}
                  >
                    {REGISTER_LANGUAGE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {isRtl ? option.labelAr : option.labelEn}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className={`pointer-events-none absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRtl ? 'left-3' : 'right-3'}`} aria-hidden />
                </div>
              </RegisterField>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <RegisterField label={t.auth.register.country} htmlFor="country" error={getFieldError('country')}>
                <div className="relative">
                  <ShieldCheck className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRtl ? 'right-3' : 'left-3'}`} aria-hidden />
                  <select
                    id="country"
                    name="country"
                    value={values.country}
                    onChange={(event) => setField('country', event.target.value)}
                    onBlur={() => markTouched('country')}
                    className={`w-full rounded-xl border bg-slate-50 dark:bg-slate-950 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors ${isRtl ? 'pr-10 pl-10 text-right' : 'pl-10 pr-10 text-left'} ${
                      getFieldError('country') ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <option value="">{t.auth.register.selectCountry}</option>
                    {REGISTER_COUNTRY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {isRtl ? option.labelAr : option.labelEn} · {option.dialingCode}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className={`pointer-events-none absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRtl ? 'left-3' : 'right-3'}`} aria-hidden />
                </div>
              </RegisterField>

              <RegisterField
                label={t.auth.register.password}
                htmlFor="password"
                error={getFieldError('password')}
                hint={isRtl ? 'استخدم كلمة مرور معقدة للحساب.' : 'Choose a strong password for your account.'}
              >
                <div className="relative">
                  <Lock className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRtl ? 'right-3' : 'left-3'}`} aria-hidden />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={values.password}
                    onChange={(event) => setField('password', event.target.value)}
                    onBlur={() => markTouched('password')}
                    dir="ltr"
                    className={`w-full rounded-xl border bg-slate-50 dark:bg-slate-950 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors ${isRtl ? 'pr-10 pl-20 text-left' : 'pl-10 pr-20 text-left'} ${
                      getFieldError('password') ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
                    }`}
                    aria-invalid={!!getFieldError('password')}
                  />
                  <div className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'left-3' : 'right-3'}`}>
                    <PasswordVisibilityToggle
                      visible={showPassword}
                      onToggle={() => setShowPassword((current) => !current)}
                      labelVisible={isRtl ? 'إخفاء' : 'Hide'}
                      labelHidden={isRtl ? 'إظهار' : 'Show'}
                    />
                  </div>
                </div>
              </RegisterField>
            </div>

            <RegisterField label={t.auth.register.confirmPassword} htmlFor="confirmPassword" error={getFieldError('confirmPassword')}>
              <div className="relative">
                <Lock className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRtl ? 'right-3' : 'left-3'}`} aria-hidden />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={values.confirmPassword}
                  onChange={(event) => setField('confirmPassword', event.target.value)}
                  onBlur={() => markTouched('confirmPassword')}
                  dir="ltr"
                  className={`w-full rounded-xl border bg-slate-50 dark:bg-slate-950 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors ${isRtl ? 'pr-10 pl-20 text-left' : 'pl-10 pr-20 text-left'} ${
                    getFieldError('confirmPassword') ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
                  }`}
                  aria-invalid={!!getFieldError('confirmPassword')}
                />
                <div className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'left-3' : 'right-3'}`}>
                  <PasswordVisibilityToggle
                    visible={showConfirmPassword}
                    onToggle={() => setShowConfirmPassword((current) => !current)}
                    labelVisible={isRtl ? 'إخفاء' : 'Hide'}
                    labelHidden={isRtl ? 'إظهار' : 'Show'}
                  />
                </div>
              </div>
            </RegisterField>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/40 p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" aria-hidden />
                <span>{isRtl ? 'متطلبات كلمة المرور' : 'Password requirements'}</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  t.auth.register.passwordChecklist.length,
                  t.auth.register.passwordChecklist.uppercase,
                  t.auth.register.passwordChecklist.lowercase,
                  t.auth.register.passwordChecklist.number,
                  t.auth.register.passwordChecklist.special,
                ].map((rule) => (
                  <div key={rule} className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" aria-hidden />
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40 p-4 cursor-pointer select-none">
                <input
                  id="acceptTerms"
                  name="acceptTerms"
                  type="checkbox"
                  checked={values.acceptTerms}
                  onChange={(event) => setField('acceptTerms', event.target.checked)}
                  onBlur={() => markTouched('acceptTerms')}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="space-y-1">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{t.auth.register.acceptTerms}</span>
                  {getFieldError('acceptTerms') && (
                    <p className="text-xs font-medium text-rose-500" role="alert">
                      {getFieldError('acceptTerms')}
                    </p>
                  )}
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                  {t.auth.register.creatingAccount}
                </>
              ) : (
                <>
                  <span>{t.auth.register.createAccount}</span>
                  <ArrowRight className={`${isRtl ? 'rotate-180' : ''} w-4 h-4`} aria-hidden />
                </>
              )}
            </button>

            <div className="flex items-center justify-between gap-4 pt-1 text-sm">
              <div className="text-slate-500 dark:text-slate-400">
                {t.auth.register.loginLinkText}{' '}
                <Link href="/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                  {t.auth.register.backToLogin}
                </Link>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
                <span>{t.auth.secureAccess}</span>
              </div>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}